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
    var parks = [];
    var food = [];
    var amusements = [];
    var terms = ["park", "restaurant", "amusement_park", "night_club"];
    var waypnts = [];
    var markers = [];

    var directionsService;
    var directionsDisplay;

    function initMap() {
        
        var initialCenter = new google.maps.LatLng(	33.7490,-84.3880);
        map = new google.maps.Map(document.getElementById('map'), {
            center: initialCenter,
            zoom: 10
        });
        directionsService = new google.maps.DirectionsService;
        directionsDisplay = new google.maps.DirectionsRenderer;
        directionsDisplay.setMap(map);

    }
    $(document).on('click',"#searchTestBtn",function() {
        $("#itineraryItems").empty();
        parks = [];
        food = [];
        amusements = [];
        //Get the input zipcode and convert to lat/lng points for resetting map and search center
        geocoder = new google.maps.Geocoder();
        codeAddress($("#searchTest").val(),gatherDestinations);
        setTimeout(createItinerary,5000);
        setTimeout(routeItinerary,10000);
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
        service = new google.maps.places.PlacesService(map);
        terms.forEach(function(term){
            var request = {
                location: mapCenter,
                radius: '40934', // 0.000621371 miles =  1 meter
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
                    case("park"):
                    parks = parks.concat(resultsArray);
                    break;
                    case("restaurant"):
                    food = food.concat(resultsArray);
                    break;
                    case("amusement_park"):
                    amusements = amusements.concat(resultsArray);
                    break;
                    case("night_club"):
                    amusements = amusements.concat(resultsArray);
                    break;
                }
            }
        });
    }

    function createItinerary(){
        parks.sort(function(a, b){return b.rating-a.rating});
        food.sort(function(a, b){return b.rating-a.rating});
        amusements.sort(function(a, b){return b.rating-a.rating});
        var randomFood = food[Math.floor(Math.random()*(food.length/2))];
        postEvent(randomFood, "Food", 1);
        mapDestination(mapCenter, randomFood, "#trip1");
        var randomPark = parks[Math.floor(Math.random()*(parks.length/2))];
        postEvent(randomPark,"Outdoors", 2);
        mapDestination(randomFood, randomPark, "#trip2");
        var randomAmusement = amusements[Math.floor(Math.random()*(amusements.length/2))];
        postEvent(randomAmusement, "Amusement", 3);3
        mapDestination(randomPark, randomAmusement, "#trip3");
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


=======
    var mapCenter;

    function initMap() {
    mapCenter = new google.maps.LatLng(	33.7490,-84.3880);
    map = new google.maps.Map(document.getElementById('map'), {
        center: mapCenter,
        zoom: 10
    });
    }

    $(document).on('click',"#searchTestBtn",function() {
        // 0.000621371 miles =  1 meter
        var searchTerm = $("#searchTest").val();
        console.log(searchTerm);
        var request = {
            location: mapCenter,
            radius: '160934',
            type: [searchTerm]
        };
        
        service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, callback);
    });

    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            console.log("check");
            for (var i = 0; i < results.length; i++) {
                    //var coords = results.features[i].geometry.coordinates;
                    var lat = results[i].geometry.location.lat();
                    var long = results[i].geometry.location.lng();
                    var latLng = new google.maps.LatLng(lat,long);
                    var marker = new google.maps.Marker({
                        position: latLng,
                        map: map
                    });
            }
        }
        console.log(results);
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
      