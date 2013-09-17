/* $Id$ */
function showHTML(html, opacity) {
  //resolve duplicated container
  jQuery("#spider-wrapper").remove();
  
  //init
  var $wrapper = jQuery(html);
  jQuery("body").append($wrapper);
  var $container = $wrapper.find("#spider-container").css({'opacity' : opacity});
  var $details = $wrapper.find(".spider-detail");
  
  //hide details
  $details.hide();
  
  $container.mouseover(function(e){
    $container.css({'opacity' : 1.0 });
  });
  $container.mouseout(function(e){
    $container.css({'opacity' : opacity });
  });
  $("#spider-wrapper #spider-visible").click(function(e) {
    $container.fadeToggle("fast");
  });
  /*$("#spider-items a").click(function(e) {
    //check the url is related to facebook
    if(e.currentTarget.href.indexOf(Manager.FB_BASE_URL) != -1) {
      chrome.runtime.sendMessage(
          {
            action : "post-facebook",
            url: e.currentTarget.href
          },
          function(res) {
            return false;
          }
      );
      return false;//prevent the page moving
    }
  });*/
  $(window).bind("scroll", function() {
    $details.hide();
  });
  $("#spider-wrapper .spider-summary").mouseover(function(e) {
    $("#spider-wrapper .spider-detail").hide();
    
    //show the detail of matched item
    var subject = $(this).children("td").attr("href");
    $detail = $("#spider-wrapper .spider-detail[id='" + subject + "']");
    $detail.attr("style", "position:fixed;top:" + (e.clientY - 15) +"px;left:80px");
  });
}
function extract() {
  var rdfa = {};
  {
    RDFa.attach(document);
    var projections = document.data.getProjections();
    for ( var i = 0; projections && i < projections.length; i++) {
      var projection = projections[i];
      var subject = projection.getSubject();
      var properties = projection.getProperties();
      var prop_value = {};
      
      for ( var j = 0; j < properties.length; j++) {
        var property = properties[j];
        var object = projection.get(property);
        prop_value[property] = object;
      }
      rdfa[subject] = prop_value;
    }
  }
  var micro = null;
  {
    var $target = $("*");
    var json_str = $.microdata.json($target);
    micro = JSON.parse(json_str);
  }
  chrome.runtime.sendMessage(
      {
        action : "extracted",
        url: document.URL,
        title: document.title,
        rdfa: rdfa,
        micro: micro
      },
      function(res) {
        var html = res.html;
        if(html && html.length) {
          //alert("@render html");
          showHTML(html, 0.1);
        }
        //set timer for autosave
        if(res.time) {
          var time = res.time * 60 * 1000;
          setTimeout(function(){
            chrome.runtime.sendMessage(
                {
                  action : "long-stay",
                  url: document.URL,
                  title: document.title
                },
                function(res) {
                  var html = res.html;
                  if(html && html.length) {
                    //alert("@render html by time");
                    showHTML(html, 0.1);
                  }
                });
          }, time);
        }
      }
  );
}
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      showHTML(request.html, 1.0);
    }
);
extract();