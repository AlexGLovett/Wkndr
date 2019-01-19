// 1. initialize firebase
  var config = {
    apiKey: "AIzaSyBPXBq7lkhMN8u7aRJOqok8zhZcElsFYI4",
    authDomain: "wkndr-228415.firebaseapp.com",
    databaseURL: "https://wkndr-228415.firebaseio.com",
    projectId: "wkndr-228415",
    storageBucket: "",
    messagingSenderId: "75810052745"
  };
  firebase.initializeApp(config);

// 2. global variables
    var map;
    var service;
    var infowindow;
    var geocoder;
    var mapCenter;
    var primeTerm = "nature";
    var primeDestination = true;
    var primeDestinationAddres;
    var eventStructure = {
        "friAft": {eventCount:4,foodCount:1},
        "friday": {eventCount:8,foodCount:3},
        "saturday": {eventCount:8,foodCount:3},
        "sunday": {eventCount:4,foodCount:2}
    }
    var POI_CHOICES = { //constant representing the possible categories to select and the types in them
        "nature": ["park"],
        "food": ["bakery","café","meal_takeaway","restaurant"],
        "fun": ["amusement_park","bowling_alley","movie_theater"],
        "shop": ["clothing_store","department_store","shoe_store","shopping_mall"],
        "attraction": ["aquarium","zoo","casino"],  //available in settings
        //"drinks": ["bar","liquor_store","night_club"], //comment out until we get a way to verify age
        "culture": ["art_gallery","library","museum","book_store"],  //available in settings
        "religion": ["synagogue","church","mosque","hindu_temple"],  //available in settings
        //"self-care": ["hair_care","spa"]  //what do you guys think?
    }
    //default picks
    var defaultPicks = ["nature", "food", "shop"]; 
    //hash of array to hold places responses
    var possiblePOIS = { "nature": [], "food": [], "fun": [], "shop": [],
                        "attraction": [], "drinks": [], "culture": [], "religion": [],  //available in settings
                        "self-care": [] }
    var terms = [];
    var waypnts = [];
    var markers = [];
    var lastDestination;
    var directionsService;
    var directionsDisplay;

/* 3. initialize map object
    Using Places and other Google Maps APIs through a Google Map Object
    https://developers.google.com/maps/documentation/javascript/importing_data        
*/

    //Initialize the map object from which other api calls are made
    /*
    Retrieving from local storage
    */
    //get the data from local storage and parse to obj
    var storedData = localStorage.getItem("survey");
    var surveyData = JSON.parse(storedData);
    //set survey variables
    var terms = surveyData.types;
    var tripLength = surveyData.tripLength;
    var dist = surveyData.distance;
    var loc = surveyData.location;

    function initMap() {
        
        //on map creation, center on Atlanta via lat-long coordinates
        var initialCenter = new google.maps.LatLng(	33.7490,-84.3880);
        map = new google.maps.Map(document.getElementById('map'), {
            center: initialCenter,
            zoom: 10
        });

        //initialize the direction service and set display source to the map
        directionsService = new google.maps.DirectionsService;
        directionsDisplay = new google.maps.DirectionsRenderer;
    }

    function generateTerms(){
        console.log("Generating terms.");
        //iterates the usersPicks array
        for(var i = 0; i<defaultPicks.length; i++){
            var pick = defaultPicks[i];
            //hashes into POI_CHOICES array by string in picks variable
            var selections = POI_CHOICES[pick]; 
            //random term from selections array is pushed into terms array 
            terms.push(selections[Math.floor(Math.random() * selections.length)]);
        }
    }

    //populates the terms array with picks from the user
    generateTerms();

    //Reset map, search variables, and itinerary
    function resetSearch(){
        $("#itineraryItems").empty();
        initMap();
        waypnts = [];
        primeDestination = true;
        possiblePOIS = { "nature": [], "food": [], "fun": [], "shop": [], 
                        "attraction": [], "adult": [], "culture": [], "religion": [],
                        "self-care": [] }
    }

    //When the search button is clicked, begin searching for selected terms within a distance of the origin point (zipcode)
    $(document).on('click',"#searchTestBtn",function() {

        console.log("Initiating Map & Search");

        //Reset map, search variables, and itinerary
        resetSearch();

        //Get the input zipcode and convert to lat/lng points for resetting map and search center
        directionsDisplay.setMap(map);

        geocoder = new google.maps.Geocoder();

        //Find the input search address, display it on the map, and perform a Places search within the area as a callback function
        codeAddress($("#searchTest").val(),selectPrimeDestination);
    });

    function codeAddress(location, callback) {
        var address = location;
        geocoder.geocode( { 'address': address}, function(results, status) {
            if (status == 'OK') {
                map.setCenter(results[0].geometry.location);
                mapCenter = results[0].geometry.location;
                var marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location
                });
                callback();
            } 
            else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    //used for the case statement to determine if the switch string is within the array
    function contains(array, elem){
        if(array.indexOf(elem) > -1){
            return elem;
        }
        return;
    }

    function dummy(){
    }

    function findDestinations(term, primeDestination, callBack){
        if (primeDestination == true){
            var request = {
                location: mapCenter,
                radius: '106934', // 0.000621371 miles =  1 meter
                rating: '4',
                type: [term],
                fields: ['formatted_address', 'name', 'rating', 'opening_hours', 'geometry']
            };
            primeDestination = false;
            terms.splice(terms.indexOf(term),1);
        }
        else{
            var request = {
                location: primeDestinationAddres,
                radius: '40934', // 0.000621371 miles =  1 meter
                rating: '4',
                type: [term],
                fields: ['formatted_address', 'name', 'rating', 'opening_hours', 'geometry']
            };
        }

        service.nearbySearch(request, callback);

        function callback(results, status, pagination) {
            var resultsArray = results;
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                if (pagination.hasNextPage){
                    resultsArray.concat(pagination.nextPage());
                }
            }
            switch (term){
                //case determines if the array in the constant hash object contains the term
                //if it does it fills the corresponding array in the response hash object
                //by concating resultsArray obtained by the Google Places API
                case(contains(POI_CHOICES.nature, term)):
                    possiblePOIS.nature = possiblePOIS.nature.concat(resultsArray);
                    break;
                case(contains(POI_CHOICES.food, term)):
                    possiblePOIS.food = possiblePOIS.food.concat(resultsArray);
                    break;
                case(contains(POI_CHOICES.fun, term)):
                    possiblePOIS.fun = possiblePOIS.fun.concat(resultsArray);
                    break;
                case(contains(POI_CHOICES.shop, term)):
                    possiblePOIS.shop = possiblePOIS.shop.concat(resultsArray);
                    break;
                case(contains(POI_CHOICES.attraction, term)):
                    possiblePOIS.attraction = possiblePOIS.attraction.concat(resultsArray);
                    break;
                case(contains(POI_CHOICES.culture, term)):
                    possiblePOIS.culture = possiblePOIS.culture.concat(resultsArray);
                    break;
                case(contains(POI_CHOICES.religion, term)):
                    possiblePOIS.religion = possiblePOIS.religion.concat(resultsArray);
                    break;
            }
        }
        //After 1 second to complete the query, calls either createItinerary or the dummy function
        setTimeout(callBack,1000); 
    }

    //Post gathered itinerary items to the webpage
    function postEvent(destination, type, destinationNumber){
        var newItem = $("<div id='newEvent" + destinationNumber + "'>");
        var title = $("<h5>").text("Destination " + destinationNumber + ": " + destination.name).appendTo(newItem);
        var type = $("<h6>").text("Activity Type: " + type).appendTo(newItem);
        var address = $("<h7 id='addressDest" + destinationNumber + "'>").text(destination.vicinity).appendTo(newItem);
        $("#itineraryItems").append(newItem);
        lastDestination = destination.vicinity;
        newItem.append("<br>");
        var travelDistance = $("<h7 id='trip" + destinationNumber + "'>").text("Travel Distance: ").appendTo(newItem);
        $("#itineraryItems").append(newItem);
    }

    //function to gather distance between waypoints and update the itinerary based on traffix
    function plotDistance(start, stop, tripID){
        var service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix(
        {
            origins: [start],
            destinations: [stop],
            travelMode: 'DRIVING',
            //Options for transit
            //transitOptions: TransitOptions,
            //options for driving
            drivingOptions: {
                departureTime: new Date(Date.now()),
                trafficModel: "bestguess"
            },
            unitSystem: google.maps.UnitSystem.IMPERIAL,
            //boolean
            avoidHighways: false,
            avoidTolls: true,
        }, callback);

        function callback(response, status) {
        // See Parsing the Results for
        // the basics of a callback function.
        if (status == google.maps.DistanceMatrixStatus.OK) {
            $(tripID).text("Travel Distance: " + response.rows[0].elements[0].distance.text);
            }
        else{
            console.log("Problem routing distance from point "+ start + " to " + stop);
            }
        }
    }

    function mapDestination(origin, destination, tripID){

        //create and add markers to the map to show the destinations
        var lat = destination.geometry.location.lat();
        var long = destination.geometry.location.lng();
        var latLng = new google.maps.LatLng(lat,long);
        var marker = new google.maps.Marker({
           position: latLng,
            map: map
        });
        markers.push(marker);

        //adjust the map view to the search location
        if (origin != mapCenter){
            origin = new google.maps.LatLng(origin.geometry.location.lat(),origin.geometry.location.lng());
        }
        else{
            primeDestinationAddres = latLng;
        }

        //add destination as a waypoint
        var newPt = {
            location:{
                lat: destination.geometry.location.lat(),
                lng: destination.geometry.location.lng()
            }
        }
        
        waypnts.push(newPt);
        plotDistance(origin, latLng, tripID);
    }

    //Maps the first point so that the secondary points can be plotted in reference to it
    function selectPrimeDestination(){

        //initialize the Places api service
        service = new google.maps.places.PlacesService(map);

        findDestinations(primeTerm, primeDestination, dummy);
        //setTimeout(createFirst,11000);
        selectDestination(primeTerm, 1);
        console.log(terms);
        gatherDestinations();
    }

    function gatherDestinations(){

        //for each term in the pick set, find destinations for 
        //that term then create an itinerary as a callback when done
        for (var i = 0; i < terms.length; i++){
            if (i === (terms.length - 1)){
                findDestinations(terms[i], primeDestination, createItinerary);
            }
            else{
                console.log(terms[i]);
                findDestinations(terms[i], primeDestination, dummy);
            }
        };
    }

    // Removes the markers from the map, but keeps them in the array.
    function clearMarkers() {
    setMapOnAll(null);
    }
    
    function routeItinerary(){
        //Remove the placeholder markers
        clearMarkers();
        waypnts.pop();
        //route the itinerary starting with the origin 
        //location and using the itinerary's middle destinations 
        //as waypoints, and the end destination as the endpoint
        function calculateAndDisplayRoute(directionsService, directionsDisplay, _origin, _destination, _waypoints) {

            directionsService.route({
              origin: _origin,
              destination: _destination,
              waypoints: _waypoints,
              travelMode: 'DRIVING'
            }, function(response, status) {
              if (status === 'OK') {
                directionsDisplay.setDirections(response);
              } else {
                window.alert('Directions request failed due to ' + status);
              }
            });
        }
        console.log(lastDestination);
        calculateAndDisplayRoute(directionsService, directionsDisplay, mapCenter, lastDestination, waypnts); //$("#addressDest3").text()
    }

    function setMapOnAll(map) {
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
        }
      }


    //PLACES TYPES
    /*
    accounting
    airport
    amusement_park
    aquarium
    art_gallery
    atm
    bakery
    bank
    bar
    beauty_salon
    bicycle_store
    book_store
    bowling_alley
    bus_station
    cafe
    campground
    car_dealer
    car_rental
    car_repair
    car_wash
    casino
    cemetery
    church
    city_hall
    clothing_store
    convenience_store
    courthouse
    dentist
    department_store
    doctor
    electrician
    electronics_store
    embassy
    fire_station
    florist
    funeral_home
    furniture_store
    gas_station
    gym
    hair_care
    hardware_store
    hindu_temple
    home_goods_store
    hospital
    insurance_agency

    jewelry_store
    laundry
    lawyer
    library
    liquor_store
    local_government_office
    locksmith
    lodging
    meal_delivery
    meal_takeaway
    mosque
    movie_rental
    movie_theater
    moving_company
    museum
    night_club
    painter
    park
    parking
    pet_store
    pharmacy
    physiotherapist
    plumber
    police
    post_office
    real_estate_agency
    restaurant
    roofing_contractor
    rv_park
    school
    shoe_store
    shopping_mall
    spa
    stadium
    storage
    store
    subway_station
    supermarket
    synagogue
    taxi_stand
    train_station
    transit_station
    travel_agency
    veterinary_care
    zoo


    */
    // var map;
    // function initMap() {
    // map = new google.maps.Map(document.getElementById('map'), {
    //     zoom: 2,
    //     center: new google.maps.LatLng(2.8,-187.3),
    //     //mapTypeId: 'terrain'
    // });

    // // Create a <script> tag and set the USGS URL as the source.
    // var script = document.createElement('script');
    //     // This example uses a local copy of the GeoJSON stored at
    //     // http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojsonp
    //     //cript.src = 'https://developers.google.com/maps/documentation/javascript/examples/json/earthquake_GeoJSONP.js';
    //     script.src = 'https://developers.google.com/maps/documentation/javascript/examples/json/earthquake_GeoJSONP.js';
    //     document.getElementsByTagName('head')[0].appendChild(script);
    // }

    // // Loop through the results array and place a marker for each
    // // set of coordinates.
    // window.eqfeed_callback = function(results) {
    //     for (var i = 0; i < results.features.length; i++) {
    //         var coords = results.features[i].geometry.coordinates;
    //         var latLng = new google.maps.LatLng(coords[1],coords[0]);
    //         var marker = new google.maps.Marker({
    //         position: latLng,
    //         map: map
    //         });
    //     }
    // }



/* 4. places logic -- https://developers.google.com/maps/documentation/javascript/places

    Test Case 1:
      Start Location: 714 Holmes Street, Atlanta 30318
      Max Distance: 100 miles
      Max Time: 2 days
    
    
    a. pull user preferences or defaults from firebase db
    b. based on number of available activities, create x arrays of y objects (ex: 5 nature activities, two food activities)
    c. for each category of arrays, create maps search for the first point ~X miles away from the origin (100 miles if that's the users preference)
    d. populate the category array of the activity with that activity's details, then plot another origin at activity 1
    e. for each category of arrays, create a map search for the first point within ~Y miles away from origin 2 (~25-40 miles from origin at max), and populate the remaining empty objects in the category arrays with the top-rated or pseudorandom choices from response object JSON
    f. create an dictionary of the itinerary points with the activity number as the key and the activity details, including inputs for the routing and viewing api calls as the values -- https://developers.google.com/maps/documentation/javascript/directions
        
          *sample call:
                    {
                origin: 'Chicago, IL',
                destination: 'Los Angeles, CA',
                waypoints: [
                    {
                    location: 'Joplin, MO',
                    stopover: false
                    },{
                    location: 'Oklahoma City, OK',
                    stopover: true
                    }],
                provideRouteAlternatives: false,
                travelMode: 'DRIVING',
                drivingOptions: {
                    departureTime: new Date( now, or future date ),
                    trafficModel: 'pessimistic'
                },
                unitSystem: google.maps.UnitSystem.IMPERIAL
                }


*/
    

/* 5. send places results to a list for display (itinerary) 
*/


/* 6. add places as markers to map
*/


/* 7. generate map route to destinations 
*/
      
