$(document).ready(function(){
    // initializes sidenav and adds options
    var elem = document.querySelector('.sidenav');
    var instance = M.Sidenav.init(elem, {
        inDuration: 350,
        outDuration: 350,
        edge: 'left'
    });    

    // initializes tabs
    $('.tabs').tabs();


});

// https://maps.googleapis.com/maps/api/place/findplacefromtext/json?key=AIzaSyAc37ceea-riBN1RsG5S-EX83UVoK-7W58&input=national+park+georgia&inputtype=textquery

// https://maps.googleapis.com/maps/api/place/textsearch/json?query=123+main+street&key=YOUR_API_KEY