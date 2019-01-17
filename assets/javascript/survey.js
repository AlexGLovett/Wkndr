$(document).ready(function(){
    $('select').formSelect();
  });


$('.numbers').keypress(function(key) {
    if(key.charCode < 48 || key.charCode > 57) return false;
});


window.onload = function() {
    $("#two").hide();
    $("#three").hide();
    $("#four").hide();
}

var questionNum = 1;
$("#btn").click(function() {
    questionNum++
    switch(questionNum){
        case(2):
        $("#one").hide();
        $("#two").fadeIn();
        break;
        case(3):
        $("#two").hide();
        $("#three").fadeIn();
        break;
        case(4):
        $("#three").hide();
        $("#four").fadeIn();
        break;
    }
})

// Allow grouping like Radio buttons
// Act like Radio
// Allow unselecting all
// the selector will match all input controls of type :checkbox
// and attach a click event handler 
$("input:checkbox").on('click', function() {
    // in the handler, 'this' refers to the box clicked on
    var $box = $(this);
    if ($box.is(":checked")) {
      // the name of the box is retrieved using the .attr() method
      // as it is assumed and expected to be immutable
      var group = "input:checkbox[name='" + $box.attr("name") + "']";
      // the checked state of the group/box on the other hand will change
      // and the current value is retrieved using .prop() method
      $(group).prop("checked", false);
      $box.prop("checked", true);
    } else {
      $box.prop("checked", false);
    }
  });