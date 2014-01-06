/* $Id$ */
function getSubject(element, attrName) {
  if(element) {
    var id = element.getAttribute(attrName);
    if(id) {
      return id; 
    } else {
      return getSubject(element.parentNode, attrName);
    }
  }
  return null;
}
function incrementSelectItemNumber(subject) {
  if(subject) {
    chrome.runtime.sendMessage(
        {
          action : "selectItemNumber++",
          url: document.URL,
          subject: subject
        },
        function(res) {
        }
    );
  }
}
function incrementSelectKeywordNumber(keyword) {
  if(keyword) {
    chrome.runtime.sendMessage(
        {
          action : "selectKeywordNumber++",
          url: document.URL,
          keyword: keyword,
        },
        function(res) {
        }
    );
  }
}
function showMessage(html, doFadeout) {
  jQuery("#spider-message").remove();
  
  var $msg = jQuery(html);
  jQuery("html").append($msg);
  $msg.find(".dialog-close").click(function(e) {//click close button
    $msg.fadeOut(0);
  });
  $msg.fadeIn(1000);
  if(doFadeout) {
    $msg.fadeOut(3000);
  }
  return $msg;
}
function isSharingEndpoint() {
  var res = false;
  if((window.location.hostname == "localhost" ||
      window.location.hostname == "semantic-spider.appspot.com") &&
      window.location.pathname == "/c/g-post") {
    res = true;
  }
  return res;
}

var rdfa = {};
var micro = null;
var $container = null;
var $details = null;

function suggestHTML(html, type, opacity, postBaseURL, $msg) {
  var fadeSpeed = "fast";
  //resolve duplicated container
  jQuery("#spider-wrapper").remove();
    
  //init
  var $wrapper = jQuery(html);
  jQuery("body").append($wrapper);
  $container = $wrapper.find("#spider-container").css({'opacity' : opacity});
  $container.attr("type", type);
  $details = $wrapper.find(".spider-detail");
  
  //hide in default
  $container.hide();
  $details.hide();
  
  $container.mouseover(function(e){
    $container.css({'opacity' : 1.0 });
  });
  $container.mouseout(function(e){
    $container.css({'opacity' : opacity });
  });
  $("#spider-wrapper #spider-visible").click(function(e) {
    $container.fadeToggle(fadeSpeed);
  });
  $("#spider-container a").click(function(e) {
    var subject = getSubject(e.target, "id");
    incrementSelectItemNumber(subject);
    
    if($container.attr("type") == "contact") {
      chrome.runtime.sendMessage({
        action : "extracted",
        url: document.URL,
        title: document.title,
        rdfa: rdfa,
        micro: micro
      },
      function(res) {
        var html = res.html;
        if(html && html.length) {
          if(!isSharingEndpoint()) {
            var postURL = getSubject(e.target, "href");
            var $msg = showMessage(Viewer.getMessageHtml(
                "Select an item used for annotation " +
                "<i class='small'>or <a class='small' href='" + postURL + "' target='_blank'>SKIP</a></i>"));
            suggestHTML(html, "tag", 1.0, postURL, $msg);
            $container.show();
          }
        } else {
          var win = window.open(getSubject(e.target, "href"), '_blank');
          win.focus();
        }
      });
      return false;
    }
    else if($container.attr("type") == "tag") {
      chrome.runtime.sendMessage({
        action : "getItemProps",
        subject: subject
      }, function(res) {
        $msg.fadeOut(3000);//fadeout message
        var prefilltext = res.name +
        (res.prefilltext.length ? "\n{" + res.prefilltext + "}" : "");
        var postURL = postBaseURL + '&' + Manager.encode({prefilltext:prefilltext});
        var win = window.open(postURL, '_blank');
        win.focus();
      });
      return false;
    }
  });
  //search word suggestion
  $("body").off("keyup.item.spider");
  $("body").on("keyup.item.spider", function(event) {
    if(event.keyCode == 27) {
      $container.fadeToggle(fadeSpeed);
    }
  });
  //popup the item detail information 
  $("#spider-wrapper .spider-summary").mouseover(function(e) {
    $("#spider-wrapper .spider-detail").hide();
    
    //show the detail of matched item
    var subject = $(this).children("td").attr("href");
    $detail = $("#spider-wrapper .spider-detail[id='" + subject + "']");
    $detail.attr("style", "position:fixed;top:" + (e.clientY - 15) +"px;left:80px");
  });
  //UI optimization
  $(window).bind("scroll", function() {
    $details.hide();
  });
  $("body").off("click.item.spider");
  $("body").on("click.item.spider", function(event) {
    $details.hide();
  });
}
function extract() {
  {//RDFa
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
  {//microdata
    var $target = $("*");
    var json_str = $.microdata.json($target);
    micro = JSON.parse(json_str);
  }
  {//a@href of documents
    var anchors = [];
    var a_elements = document.getElementsByTagName("a");
    for(var i = 0; i < a_elements.length; i++) {
      var href = a_elements[i].getAttribute("href");
      if(href && href.search(/^\//) != -1) {
        href = document.location.protocol + "//" +document.location.hostname + href;
        anchors.push(href);
      } else if(href && href.search(/^https?:\/\//) != -1){
        anchors.push(href);
      }
    }
  }
  chrome.runtime.sendMessage(
      {
        action : "extracted",
        url: document.URL,
        title: document.title,
        rdfa: rdfa,
        micro: micro,
        anchors: anchors
      },
      function(res) {
        var html = res.html;
        if(html && html.length) {
          if(!isSharingEndpoint()) {
            suggestHTML(html, "related-items", 1.0);
          }
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
                });
          }, time);
        }
      }
  );
}
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if(request.action == "suggest-contact") {
        suggestHTML(request.html, "contact", 1.0);
        $container.show();
      } else if(request.action == "message") {
        showMessage(request.html, true);
      }
    }
);
function Assist() {};
Assist.search = function() {
  $(".spider-keyword-search").remove();
  var $inputs = $(
      "input[type='text']" +
      ",input[type='search']" +
      ",textarea" +
      ",input[id*='search']" + //Zappos
      ",input[id*='Search']" +
      ",input[id*='find']"     //Yelp
  );
  for(var i = 0; i < $inputs.length; i++) {
    //user starts to input search keyword
    $($inputs[i]).off("keyup.keyword.spider");
    $($inputs[i]).on("keyup.keyword.spider", function(event) {
      var input_value = $(event.target).val();
      if(!input_value.length) {
        $("div.spider-keyword-search").detach();
      }
      else {
        var $input = $(this);
        var input_width = $input.outerWidth();
        var input_height = $input.outerHeight();
        var offset = $input.offset();
        
        var itemtype = $(this).attr("itemtype");
        itemtype = itemtype == "" ? null : itemtype;
        var keyword = $(event.target).val().trim();
        keyword = keyword == "" ? null : keyword;
        
        chrome.runtime.sendMessage(
            {
              action: "getKeyword",
              itemtype: itemtype,
              keyword: keyword,
              url: document.URL,
              title: document.title,
            },
            function(res) {
              $("div.spider-keyword-search").detach();
              
              var html = res.html;
              if(html && html.length) {
                //insert keywords
                var $keywords_container = $("<div class='spider-keyword-search'" +
                    " style='position:fixed; width:300px;" + 
                    " top:" +  (offset.top + input_height - window.scrollY) + "px;" +
                    " left:" + (offset.left + input_width - window.scrollX) + "px;'>" +
                    "<a href='http://www.w3.org/2013/04/semweb-html5/spider/index.html'>" + 
                    "<img src='" + Manager.APP_URL + "images/spider.png" + "'></a>" +
                    html + "</div>");
                jQuery("body").append($keywords_container);
                
                //event : click keyword
                $keywords_container.find("td").off("click.keyword.spider");
                $keywords_container.find("td").on("click.keyword.spider", {input: $input}, function(e) {               
                  var selectedKeyword = $(e.target).text();
                  e.data.input.val(selectedKeyword);
                  incrementSelectKeywordNumber(selectedKeyword);
                  $keywords_container.detach();
                });
                //event : click body besides keyword
                $("body").off("click.keyword.spider");
                $("body").on("click.keyword.spider", function(e) {
                  $keywords_container.detach();
                });
                $(window).bind("scroll", function() {
                  $keywords_container.detach();
                });
              }
            }
        );
      }
    });
  }
}

extract();
Assist.search();
