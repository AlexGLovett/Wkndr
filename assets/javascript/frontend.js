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
    var tripLength = $("#tripLength").children("#option:selected").val();
    var location = $("#location").val();
    var distance;
    var types = $('.checkbox-green:checked').val();

    var surveyData = [tripLength, location, distance, types];

    console.log(surveyData);

    //var surveyData = JSON.stringify(surveyObj);
    //localStorage.setItem("survey", surveyData);
});

