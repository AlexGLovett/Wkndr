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
      