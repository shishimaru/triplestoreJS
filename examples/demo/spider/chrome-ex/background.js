/* $Id$ */
var bg_res = {};
var expires = {};

function getRelatedSubjects(m, title, rdfa, micro) {
  var items = [];
  var MIN_SIMILARITY = 0.4;
  var MIN_PROPS_LEN = 0 + 6;//at least 6
  var RESULT_SIZE =  7;
  
  function sanitize(items) {
    var i = 0;
    while(i < items.length) {
      var props = m.projections[items[i].subject].getProperties();
      if(props.length < MIN_PROPS_LEN) {
        items.splice(i, 1);
      } else {
        i++;
      }
    } 
  }
  
  //find similar items using site title
  if(title) {
    items = items.concat(m.getSimilarItems([title], MIN_SIMILARITY));
  }
  
  //private items RDFa refers to
  if(rdfa) {
    for(var subject in rdfa) {
      var itemValues = [];
      
      var props = rdfa[subject];
      for(var prop in props) {
        var value = props[prop];
        if(m.projections[value]) {//search with subject
          items.push({"subject": value,
            "similarity": 1.0});
        }
        if(prop.match(/name$/) ||
            prop.match(/title$/) ||
            prop == Manager.PROP_TITLE) {
          itemValues.push(value);
        }
      }
      items = items.concat(m.getSimilarItems(itemValues, MIN_SIMILARITY));
    }
  }
  //private items microdata refers to
  if(micro && micro.items) {
    for(var i = 0; i < micro.items.length; i++) {
      var item = micro.items[i];
      var props = item.properties;
      var itemValues = [];
      for(var prop in props) {
        var values = props[prop];

        for(var j = 0; j < values.length; j++) {
          var value = values[j];
          
          if(m.projections[value]) {//search with subject
            items.push({"subject": value,
              "similarity": 1.0});
          }
        }
        if(prop.match(/name$/) ||
            prop.match(/title$/) ||
            prop == Manager.PROP_TITLE) {
          itemValues = itemValues.concat(values);
        }
      }
      items = items.concat(m.getSimilarItems(itemValues, MIN_SIMILARITY));
    }
  }
  //TODO : referred : find in triplestore
  //for(var subject in m.projections) {
  //}
  
  sanitize(items);
  //sort by similarity with ascending
  items = items.sort(function(item1, item2) {
    return item2.similarity - item1.similarity;
  });
  
  //set subjects
  var subjects = [];
  for(var i = 0; i < items.length; i++) {
    subjects.push(items[i]["subject"]);
  }
  subjects = Manager.trimDuplicate(subjects);
  subjects = subjects.slice(0, RESULT_SIZE);
  
  return subjects;
}
function generateInsertedHTML(m, v, subjects) {
  if(!subjects.length) {
    return null;
  }
  $wrapper = $("<div>", {"id" : "spider-wrapper"});
  var $img = $("<img>", {"class" : "related_type", "src" : m.app_url + "images/spider.png"});
  $wrapper.append($("<div>", {"id" : "spider-visible"}).append($img));
  var $container = $("<div>", {"id" : "spider-container"}).appendTo($wrapper);
  
  var $items = $("<div id='spider-items'>").appendTo($container);
  var $summaries = $("<table>", {"id" : "spider-summaries"}).appendTo($items);
  for(var i = 0; i < subjects.length; i++) {
    var $summary = Viewer.getSubjectHTML(m, m.projections[subjects[i]], "referred_cell", true);
    $summaries.append($("<tr class='spider-summary'>").append($summary));
    
    var detail = v.getSummaryHTML(subjects[i]);
    var $detail = null;
    if(detail) {
      $detail = $($(detail).find(".item-detail")[0]);
      $detail.find("ul").attr("style", "text-align:left;");//change the style of <ul>

      $items.append(
          $("<div>", {"class" : "spider-detail", "id" : $summary.attr("href")}).append($detail));
    }
  }
  return $("<div>").append($wrapper).html();
}
function getVisitNumber(url) {
  return localStorage[url] ? parseInt(localStorage[url]) : 0;
}
function countVisitNumber(url) {
  var num = localStorage[url] ? parseInt(localStorage[url]) : 0;
  if(num < 99) {
    localStorage[url] = num + 1;
  }
}
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      var m = new Manager(sender.tab);
      m.renew();
      
      if(request.action == "extracted") {
        if(!sender.tab || !sender.tab.id) {
          return;
        }
        //reset icon
        Viewer.changeIcon(sender.tab.id, false);
        //init
        var results = {};
        if(request.rdfa) {
          console.log("bg received RDFa");
          //sendResponse({farewell: "goodbye: " + res});
          results.rdfa = request.rdfa;
        }
        if(request.micro) {
          console.log("bg received microdata");
          //sendResponse({farewell: "goodbye: " + res});
          results.micro = request.micro;
        }
        if((request.rdfa && Manager.hasKey(request.rdfa)) ||
            (request.micro && request.micro.items.length)) {
          //notify the site has annotation
          Viewer.changeIcon(sender.tab.id, true);
        }
        results.expires = expires[request.url];
        results.onSelectionChanged = onSelectionChanged;
        bg_res[request.url] = results;
        countVisitNumber(request.url);
        
        //auto save the items based on visit number
        var visit = Options.get_visit();
        if(visit && getVisitNumber(request.url) >= visit * 3) {
          //alert("save by visit");
          m.save();
        }
      }
      //auto save for long stay at same site
      else if(request.action == "long-stay") {
        //alert("save by time");
        m.save();
      }
      //feedback related items to content script
      var subjects = getRelatedSubjects(m, request.title,
          bg_res[request.url].rdfa, bg_res[request.url].micro);
      
      var v = new Viewer(m, sender.tab);
      var html = generateInsertedHTML(m, v, subjects);
      var time = Options.get_time();
      sendResponse({html: html, time: time});
    }
);
function onSelectionChanged(tabId) {
  chrome.tabs.executeScript(tabId, {
    file: "content.js"
  });
}
/*chrome.tabs.onActivated.addListener(function(activeInfo) {
  onSelectionChanged(activeInfo.tabId);
});*/
chrome.tabs.onUpdated.addListener(function(id, changeInfo, tab) {
  onSelectionChanged(id);  
});

//get Expires header
chrome.webRequest.onResponseStarted.addListener(
    function(details) {
      var headers = details.responseHeaders;
      var ex = null;
      for(var i = 0; i < headers.length; i++) {
        if(headers[i].name.toLowerCase() == "expires") {
          ex = new Date(headers[i].value);
          break;
        }
      }
      expires[details.url] = ex;
    },
    { urls: ["<all_urls>"], types: ["main_frame"] },
    ["responseHeaders"]
);
//clean expired items only once
function cleanOldItems() {
  var m = new Manager(null);
  m.renew();
 
  var now = new Date();
  for(var subject in m.projections) {
    var projection = m.projections[subject];
    var expires_str = projection.get(Manager.PROP_EXPIRES);
    if(expires_str) {
      var expires = new Date(expires_str);
      if(expires < now) {
        projection.remove();
      }
    }
  }
}
document.addEventListener('DOMContentLoaded', function () {
  if(Options.is_remove()) {
    cleanOldItems();
  }
});