$(document).ready(function(){
  var id = getUrlParameter("id");
  $.ajax({
    dataType: "json",
    type: "get",
    url: "blog.json",
    data: {"id" : id},
    success: function(data){
      $("#content").val(data.content);
    }
  });
  $("#submit").click(function(){
    $.ajax({
      type: "post",
      dataType: "json",
      url: "blog.json",
      data: {"id" : id, "content": $("#content").val()},
      success: function(data){
        alert("提交成功");
      }
    });
  })
});

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};
