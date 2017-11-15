$(document).ready(function() {
  $(document).scroll(function() {
    $("#slide1").css("background-position", 'center ' + (-$(document).scrollTop() * 0.3) + 'px');
    $("#text").css("margin-top", $(document).scrollTop() * 0.4 + 'px');
    $("#text").css("opacity", -1 / 400 * $(document).scrollTop() + 1);
  });
});
