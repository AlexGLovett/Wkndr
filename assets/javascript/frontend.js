$(document).ready(function(){
    // initializes sidenav and adds options
    var elem = document.querySelector('.sidenav');
    var instance = M.Sidenav.init(elem, {
        inDuration: 350,
        outDuration: 350,
        edge: 'left'
    });    

    // initialize select box
    $('select').formSelect();

    // initializes tabs
    $('.tabs').tabs();

    // initializes tooltips
    $('.tooltipped').tooltip();
});

$("#planWeekend").on("click", function(){
    event.preventDefault();

    var surveyObj = {
        tripLength: $("#tripLength").val(),
        location: $("#location").val(),
        distance: $("#distance").val(),
        types: []
    };

    /*
    var tripLength = $("#tripLength").val();
    var location = $("#location").val();
    var distance = $("#distance").val();
    var types = [];
    */

    var checkboxes = document.getElementsByName("types");  
    for(var i = 0; i < checkboxes.length; i++)  
    {  
            if(checkboxes[i].checked)  
                    surveyObj.types.push(checkboxes[i].attributes[3].nodeValue);  
    }  

    console.log(surveyObj);

    var surveyData = JSON.stringify(surveyObj);
    localStorage.setItem("survey", surveyData);
});