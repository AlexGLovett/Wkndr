function createItinerary(){

    var itineraryItem = 2;
    for (var poiSet in possiblePOIS) {
        console.log(poiSet);
        selectDestination(poiSet, itineraryItem);
        itineraryItem++;
    };

    setTimeout(routeItinerary, 2000);
}

var previousDestination = {};

function selectDestination(searchTerm, itineraryItem){
    //itinerary number variable
    setTimeout(function(){
        var poiChoices = possiblePOIS[searchTerm];
        if(poiChoices.length >= 1){
            
            //Sort ratings from highest to lowest
            poiChoices.sort(function(a, b){return b.rating-a.rating});

            //grab a random choice from the top half of the choice list
            var randomChoice = poiChoices[Math.floor(Math.random()*(poiChoices.length/2))];

            //grabs the event type to list on the itinerary and posts the event to the page
            var strType = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1);
            postEvent(randomChoice, strType, itineraryItem);

            //if this is the first item to plot, start from the center
            //otherwise plot from the previous destination
            if(itineraryItem === 1){
                mapDestination(mapCenter, randomChoice, "#trip"+itineraryItem);
                previousDestination = randomChoice;
            }
            else{
                mapDestination(previousDestination, randomChoice, "#trip"+itineraryItem);
                previousDestination = randomChoice;
                //generateWaypoint($("#addressDest"+(i-1)).text());
            }

            //Prepares for the next waypoint mapping by setting the previous destination to the current choice
            //previousDestination = randomChoice;
            //Move onto the next itinerary item
        }
        else{
            //console.log("Couldn't find any results for the destination search.");
        }
    },2000);
}