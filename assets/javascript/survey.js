$(document).ready(function(){
    $('select').formSelect();
  });


//   $(".allownumericwithdecimal").on("keypress keyup blur",function (event) {
//     //this.value = this.value.replace(/[^0-9\.]/g,'');
// $(this).val($(this).val().replace(/[^0-9\.]/g,''));
//     if ((event.which != 46 || $(this).val().indexOf('.') != -1) && (event.which < 48 || event.which > 57)) {
//         event.preventDefault();
//     }
// });

$('.numbers').keypress(function(key) {
    if(key.charCode < 48 || key.charCode > 57) return false;
});