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

    function initMap() {
    var mapCenter = new google.maps.LatLng(	38.897957,-77.036560);

    map = new google.maps.Map(document.getElementById('map'), {
        center: mapCenter,
        zoom: 15
    });

    var request = {
        query: '1500 Pennsylvania Avenue',
        fields: ['photos', 'formatted_address', 'name', 'rating', 'opening_hours', 'geometry'],
    };

    service = new google.maps.places.PlacesService(map);
    service.findPlaceFromQuery(request, callback);
    }

    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
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
    }

    function placeSearch() {

        var address = 30318;
        var queryURL = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=" + address + "&inputtype=textquery&key=" + config.apiKey;

        // Creates AJAX call for the specific movie button being clicked
        $.ajax({
          url: queryURL,
          method: "GET"
        }).then(function(response) {
            console.log(response);
          // YOUR CODE GOES HERE!!!

        });

      }
    placeSearch();
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
      