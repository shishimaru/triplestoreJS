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
            
            /*var $wrapper = jQuery(html).css({'opacity' : 0.1});*/
            var $wrapper = jQuery(html);
            jQuery("body").append($wrapper);
            
            var $container = $wrapper.find("#spider-container").css({'opacity' : 0.1});
            //hide the detail of each item
            $("#spider-wrapper .spider-detail").hide();
            
            $container.mouseover(function(e){
              $container.css({'opacity' : 1.0 });
            });
            $container.mouseout(function(e){
              $container.css({'opacity' : 0.1 });
            });
            $("#spider-wrapper #spider-visible").click(function(e) {
              $container.fadeToggle("fast");
            });
            $(window).bind("scroll", function() {
              $container.hide();
            });
            $("#spider-wrapper .spider-summary").mouseover(function(e) {
              $("#spider-wrapper .spider-detail").hide();
              
              //show the detail of matched item
              var subject = $(this).children("td").attr("href");
              $detail = $("#spider-wrapper .spider-detail[id='" + subject + "']");
              $detail.attr("style", "position:fixed;top:" + (e.clientY - 15) +"px;left:80px");
            });
          }
        }
        this.flag = true;
      }
  );
}

extract();
