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
            var $wrapper = jQuery(html);
            $wrapper.css({'opacity' : 0.2 });
            jQuery("body").append($wrapper);
            
            $wrapper.mouseover(function(e){
              $wrapper.css({'opacity' : 1.0 });
            });
            $wrapper.mouseout(function(e){
              $wrapper.css({'opacity' : 0.2 });
            });
            
            $("#spider-wrapper").click(function(e) {
              $("#spider-wrapper table").fadeToggle("slow");
            });
          }
        }
        this.flag = true;
      }
  );
}

extract();
