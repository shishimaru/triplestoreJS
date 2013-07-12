/* $Id$ */
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
        url: document.URL,
        rdfa: rdfa,
        micro: micro
      },
      function(res) {
        this.flag = !this.flag ? false : this.flag;
        if(!this.flag) {
          var html = res.html;
          if(html && html.length) {
            //resolve duplicated container
            jQuery("#spider-wrapper").remove();
            
            var $wrapper = jQuery(html).css({'opacity' : 0.1});
            jQuery("body").append($wrapper);
            
            //hide the detail of each item
            $("#spider-wrapper .spider-detail").hide();
            
            $wrapper.mouseover(function(e){
              $wrapper.css({'opacity' : 1.0 });
            });
            $wrapper.mouseout(function(e){
              $wrapper.css({'opacity' : 0.1});
            });
            $("#spider-wrapper #spider-visible").click(function(e) {
              $("#spider-wrapper #spider-items").fadeToggle("fast");
            });
            $(window).bind("scroll", function() {
              $("#spider-wrapper .spider-detail").hide();
            });
            $("#spider-wrapper .spider-summary").mouseover(function(e) {
              $("#spider-wrapper .spider-detail").hide();
              
              //show the detail of matched item
              var subject = $(this).children("td").attr("href");
              $detail = $("#spider-wrapper .spider-detail[id='" + subject + "']");
              $detail.attr("style", "position:fixed;top:" + e.clientY +"px;left:92px");
            });
          }
        }
        this.flag = true;
      }
  );
}

extract();
