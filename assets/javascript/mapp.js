/* 1. initialize firebase
*/
  var config = {
    apiKey: "AIzaSyBPXBq7lkhMN8u7aRJOqok8zhZcElsFYI4",
    authDomain: "wkndr-228415.firebaseapp.com",
    databaseURL: "https://wkndr-228415.firebaseio.com",
    projectId: "wkndr-228415",
    storageBucket: "",
    messagingSenderId: "75810052745"
  };
  firebase.initializeApp(config);



/* 2. global variables
*/


/* 3. initialize map object
    Using Places and other Google Maps APIs through a Google Map Object
    https://developers.google.com/maps/documentation/javascript/importing_data        
*/



    var map;
    var service;
    var infowindow;
    var geocoder;
    var mapCenter;
    var SELECTIONS = { //constant representing the possible categories to select and the types in them
        "nature": ["park"],
        "food": ["bakery","café","meal_takeaway","restaurant"],
        "amusements": ["amusement_park","bowling_alley","movie_theater"],
        "shopping": ["clothing_store","department_store","shoe_store","shopping_mall"],
        "attractions": ["aquarium","zoo","casino"],  //available in settings
        "nightlife": ["night_club", "bar", "liqour_store"], //comment out until we get a way to verify age
        "culture": ["art_gallery","library","museum","book_store"],  //available in settings
        "religion": ["synagogue","church","mosque","hindu_temple"],  //available in settings
        "self-care": ["hair_care","spa"]  //what do you guys think?
    }
    var userPicks = ["nature", "food", "shopping"]; //what the user would pick
    var respHash = { //hash of array to hold places responses
        "nature": [],
        "food": [],
        "amusements": [],
        "shopping": [],
        "attractions": [],  //available in settings
        "nightlife": [], //comment out until we get a way to verify age
        "culture": [],  //available in settings
        "religion": [],  //available in settings
        "self-care": []  //what do you guys think?
    }
    var terms = [];
    //
    var waypnts = [];
    var markers = [];
    var directionsService;
    var directionsDisplay;

    /*
    Retrieving from local storage
    */
    //get the data from local storage and parse to obj
    var storedData = localStorage.getItem("survey");
    var surveyData = JSON.parse(storedData);
    //set survey variables
    var userPicks = surveyData.types;
    var tripLength = surveyData.tripLength;
    var dist = surveyData.distance;
    var loc = surveyData.location;
    //

    function initMap() {
        
        var initialCenter = new google.maps.LatLng(	33.7490,-84.3880);
        map = new google.maps.Map(document.getElementById('map'), {
            center: initialCenter,
            zoom: 10
        });
        directionsService = new google.maps.DirectionsService;
        directionsDisplay = new google.maps.DirectionsRenderer;

    }
    //After clicking the plan weekend call the functions and build map
    $(document).on('click',"#planWeekend",function() {

        //Reset search variables and itinerary
        $("#itineraryItems").empty();
        initMap();
        respHash = {
            "nature": [],
            "food": [],
            "amusements": [],
            "shopping": [],
            "attractions": [],  //available in settings
            "nightlife": [], //comment out until we get a way to verify age
            "culture": [],  //available in settings
            "religion": [],  //available in settings
            "self-care": []  //what do you guys think
        }
        //
        waypnts = [];
        terms = []; //clear terms so that we have empty array to fill
        //Get the input zipcode and convert to lat/lng points for resetting map and search center
        directionsDisplay.setMap(map);
        geocoder = new google.maps.Geocoder();
        codeAddress(loc,gatherDestinations);
        setTimeout(createItinerary,1000);
        setTimeout(routeItinerary,2000);

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
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
    }

    function gatherDestinations(){
        //fills the array with 
        generateTerms()
        service = new google.maps.places.PlacesService(map);
        terms.forEach(function(term){
            var request = {
                location: mapCenter,
                radius: parseFloat(dist)/0.000621371, // 0.000621371 miles =  1 meter //converts to meters from miles
                rating: '4',
                type: [term],
                fields: ['formatted_address', 'name', 'rating', 'opening_hours', 'geometry']
            };
            service.nearbySearch(request, callback);

            function callback(results, status, pagination) {
                var resultsArray = results;
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    for (var i = 0; i < results.length; i++) {
                    }
                    if (pagination.hasNextPage){
                        resultsArray.concat(pagination.nextPage());
                    }
                }
                switch (term){
                    //case determines if the array in the constant hash object contains the term
                    //if it does it fills the corresponding array in the response hash object
                    //by concating resultsArray obtained by the Google Places API
                    case(contains(SELECTIONS.nature, term)):
                        respHash.nature = respHash.nature.concat(resultsArray);
                        break;
                    case(contains(SELECTIONS.food, term)):
                        respHash.food = respHash.food.concat(resultsArray);
                        break;
                    case(contains(SELECTIONS.fun, term)):
                        respHash.fun = respHash.fun.concat(resultsArray);
                        break;
                    case(contains(SELECTIONS.shopping, term)):
                        respHash.shopping = respHash.shopping.concat(resultsArray);
                        break;
                    case(contains(SELECTIONS.attraction, term)):
                        respHash.attraction = respHash.attraction.concat(resultsArray);
                        break;
                    case(contains(SELECTIONS.culture, term)):
                        respHash.culture = respHash.culture.concat(resultsArray);
                        break;
                    case(contains(SELECTIONS.religion, term)):
                        respHash.religion = respHash.religion.concat(resultsArray);
                        break;
                }
            }
        });
    }

    function generateTerms(){
        //iterates the usersPicks array
        for(var i = 0; i<userPicks.length; i++){
            var pick = userPicks[i];
            //hashes into selections array by string in picks variable
            var selections = SELECTIONS[pick]; 
            //random term from selections array is pushed into terms array 
            terms.push(selections[Math.floor(Math.random() * selections.length)]);
        }
    }

    //used for the case statement to determine if the switch string is within
    //the array
    function contains(array, elem){
        if(array.indexOf(elem) > -1){
            return elem;
        }
        return;
    }

    function createItinerary(){
        //
        var i = 1;
        var prevRandom = {};
        for(var prop in respHash){
            var array = respHash[prop];
            if(array.length < 1){
                console.log("array length 0 for respHash["+prop+"]")
                continue;
            }
            array.sort(function(a, b){return b.rating-a.rating});
            var random = array[Math.floor(Math.random()*(array.length/2))];
            var strType = prop.charAt(0).toUpperCase() + prop.slice(1);
            postEvent(random, strType, i);
            if(i === 1){
                mapDestination(mapCenter, random, "#trip"+i);
            }else{
                mapDestination(prevRandom, random, "#trip"+i);
                //generateWaypoint($("#addressDest"+(i-1)).text());
            }
            prevRandom = random;
            i++;
        }
        generateWaypoint($("#addressDest1").text());
        generateWaypoint($("#addressDest2").text());

        function postEvent(destination, type, destinationNumber){
            var newItem = $("<div id='newEvent" + destinationNumber + "'>");
            var title = $("<h5>").text("Destination " + destinationNumber + ": " + destination.name).appendTo(newItem);
            var type = $("<h6>").text("Activity Type: " + type).appendTo(newItem);
            var address = $("<h7 id='addressDest" + destinationNumber + "'>").text(destination.vicinity).appendTo(newItem);
            $("#itineraryItems").append(newItem);
            newItem.append("<br>");
            var travelDistance = $("<h7 id='trip" + destinationNumber + "'>").text("Travel Distance: ").appendTo(newItem);
            $("#itineraryItems").append(newItem);
        }

        function mapDestination(origin,destination, tripID){
            if (origin != mapCenter){
                origin = new google.maps.LatLng(origin.geometry.location.lat(),origin.geometry.location.lng());
            }
            var lat = destination.geometry.location.lat();
            var long = destination.geometry.location.lng();
            var latLng = new google.maps.LatLng(lat,long);
            var marker = new google.maps.Marker({
               position: latLng,
                map: map
            });
            markers.push(marker);
            plotDistance(origin, latLng, tripID);
        }

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
    }

    function generateWaypoint(location) {
        var address = location;
        geocoder.geocode( { 'address': address}, function(results, status) {
          if (status == 'OK') {
              var newPt = {
                location:{
                    lat: results[0].geometry.location.lat(),
                    lng: results[0].geometry.location.lng()
                }
              };
            waypnts.push(newPt);
          } 
          else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
    }

    function routeItinerary(){
        clearMarkers();
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
          calculateAndDisplayRoute(directionsService, directionsDisplay, mapCenter, $("#addressDest3").text(), waypnts);
    }

    function setMapOnAll(map) {
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
        }
      }

      // Removes the markers from the map, but keeps them in the array.
      function clearMarkers() {
        setMapOnAll(null);
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
      
