// global variables
    var map;
    var service;
    var infowindow;
    var geocoder;
    var mapCenter;
    var primeTerm;
    var primeDestination = true;
    var primeDestinationAddres;
    var eventStructure = {
        "1": {eventCount:4,foodCount:2},
        "2": {eventCount:8,foodCount:3},
        "3": {eventCount:8,foodCount:3}
    }
    var POI_CHOICES = { //constant representing the possible categories to select and the types in them
        "nature": ["park"],
        "food": ["bakery","café","meal_takeaway","restaurant"],
        "amusements": ["amusement_park","bowling_alley","movie_theater"],
        "shopping": ["clothing_store","department_store","shoe_store","shopping_mall"],
        "attractions": ["aquarium","zoo","casino"],  //available in settings
        "nightlife": ["night_club", "bar", "liqour_store"], //comment out until we get a way to verify age
        "culture": ["art_gallery","library","museum","book_store"],  //available in settings
        "religion": ["synagogue","church","mosque","hindu_temple"],  //available in settings
        "self-care": ["hair_care","spa"] //what do you guys think?
    }
    //default picks
    var defaultPicks = ["nature", "food", "shopping"]; 
    //hash of array to hold places responses
    var possiblePOIS = {         
        "nature": [],
        "food": [],
        //"amusements": [],
        "shopping": [],
        //"attractions": [],  //available in settings
        //"nightlife": [], //comment out until we get a way to verify age
        //"culture": [],  //available in settings
        //"religion": [],  //available in settings
        //"self-care": [] //what do you guys think? 
    }
    var terms = [];
    var waypnts = [];
    var markers = [];
    var lastDestination;
    var directionsService;
    var directionsDisplay;
    var storedData;
    var surveyData;
    var tripLength;
    var dist;
    var loc;

$(document).ready(function() {
// gather input data and initialize map object

    //get the data from local storage and parse to obj
    function getLocalStorage() {
        storedData = localStorage.getItem("survey");
        surveyData = JSON.parse(storedData);
        //set survey variables
        terms = surveyData.types;
        tripLength = surveyData.tripLength;
        dist = surveyData.distance;
        loc = surveyData.location;
    }

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
            terms.push(selections[Math.floor(Math.random() * selections.length)]
            );
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
        possiblePOIS = { 
            "nature": [],
            "food": [],
            //"amusement": [],
            "shopping": [],
            //"attractions": [], 
            //"adult": [], 
            //"culture": [], 
            //"religion": [],
            //"self-care": [] 
        }
    }

    function beginSearch() {
        getLocalStorage();

        primeTerm = terms[0];

        console.log("Initiating Map & Search");

        //Reset map, search variables, and itinerary
        resetSearch();

        //Get the input zipcode and convert to lat/lng points for resetting map and search center
        directionsDisplay.setMap(map);

        geocoder = new google.maps.Geocoder();

        //Find the input search address, display it on the map, and perform a Places search within the area as a callback function
        codeAddress(loc,selectPrimeDestination);
    }

    beginSearch();

    $("#planWeekend").on("click", function(){
        beginSearch();
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
                console.log('Geocode was not successful for the following reason: ' + status);
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
        console.log(primeDestination);
        if (primeDestination == true){
            primeDestination = false;
            var request = {
                location: mapCenter,
                radius: '106934', // 0.000621371 miles =  1 meter
                rating: '4',
                type: [term],
                fields: ['formatted_address', 'name', 'rating', 'opening_hours', 'geometry']
            };
            
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
                case(contains(POI_CHOICES.amusements, term)):
                    possiblePOIS.fun = possiblePOIS.amusements.concat(resultsArray);
                    break;
                case(contains(POI_CHOICES.shopping, term)):
                    possiblePOIS.shopping = possiblePOIS.shopping.concat(resultsArray);
                    break;
                case(contains(POI_CHOICES.attractions, term)):
                    possiblePOIS.attraction = possiblePOIS.attractions.concat(resultsArray);
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
        setTimeout(function(){
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
            console.log(waypnts);
            plotDistance(origin, latLng, tripID);
        },1000);
        
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
            console.log(terms.length);
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
                console.log('Directions request failed due to ' + status);
              }
            });
        }

        setTimeout(function(){
            waypnts.pop();
            calculateAndDisplayRoute(directionsService, directionsDisplay, mapCenter, lastDestination, waypnts);
        },2000);
         //$("#addressDest3").text()
    }

    function setMapOnAll(map) {
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
        }
      }

});