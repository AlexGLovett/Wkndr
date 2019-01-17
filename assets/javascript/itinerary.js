function createItinerary(){

    //itinerary number variable
    var itineraryItem = 1;
    var previousDestination = {};

    for (var poiSet in possiblePOIS) {
        var poiChoices = possiblePOIS[poiSet];
        if(poiChoices.length >= 1){
            
            //Sort ratings from highest to lowest
            poiChoices.sort(function(a, b){return b.rating-a.rating});

            //grab a random choice from the top half of the choice list
            var randomChoice = poiChoices[Math.floor(Math.random()*(poiChoices.length/2))];

            //grabs the event type to list on the itinerary and posts the event to the page
            var strType = poiSet.charAt(0).toUpperCase() + poiSet.slice(1);
            postEvent(randomChoice, strType, itineraryItem);

            //if this is the first item to plot, start from the center
            //otherwise plot from the previous destination
            if(itineraryItem === 1){
                mapDestination(mapCenter, randomChoice, "#trip"+itineraryItem);
            }else{
                mapDestination(previousDestination, randomChoice, "#trip"+itineraryItem);
                //generateWaypoint($("#addressDest"+(i-1)).text());
            }

            //Prepares for the next waypoint mapping by setting the previous destination to the current choice
            previousDestination = randomChoice;
            //Move onto the next itinerary item
            itineraryItem++;
        }
    };

    setTimeout(routeItinerary, 2000);
    
}