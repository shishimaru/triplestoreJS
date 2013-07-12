/* $Id$ */
var bg_res = {};

function getRelatedSubjects(m, rdfa, micro) {
  var res = [];
  
  //private items RDFa refers to
  if(rdfa) {
    for(var subject in rdfa) {
      var props = rdfa[subject];
      for(var prop in props) {
        var value = props[prop];
        console.log(subject, prop, value);
        if(m.projections[value]) {//search with subject
          res.push(value);
        } else if(prop.search(/name$/) != -1
            ||prop.search(/title$/) != -1) {
          var subjects = m.getSubjects(null, value);
          res = res.concat(subjects);
        }
      }
    }
  }
  //private items microdata refers to
  if(micro && micro.items) {
    for(var i = 0; i < micro.items.length; i++) {
      var item = micro.items[i];
      var subject = item.id ? item.id : (item.properties["url"] ? item.properties["url"] : null);
      var type = item.type;
      var props = item.properties;
      
      for(var prop in props) {
        var values = props[prop];
        for(var j = 0; j < values.length; j++) {
          var value = values[j];
          console.log(subject, prop, value);
          if(m.projections[value]) {//search with subject
            res.push(value);
          }
        }
        if(prop.search(/name$/) != -1
            ||prop.search(/title$/) != -1) {
          var subjects = m.getSubjects(null, value);
          res = res.concat(subjects);
        }
      }
    }
  }
  //TODO : referred : find in triplestore
  /*for(var subject in m.projections) {
    
  }*/
  
  return res;
}
function generateInsertedHTML(m, v, subjects) {
  if(!subjects.length) {
    return null;
  }
  $wrapper = $("<div>", {"id" : "spider-wrapper"});
  var $container = $("<div>", {"id" : "spider-container"}).appendTo($wrapper); {
    var $img = $("<img>", {"class" : "related_type", "src" : m.app_url + "images/spider.png"});
    $container.append(
        $("<div>", {"id" : "spider-visible", "style" : "text-align:center;"}).append($img)
    );
  }
  var $items = $("<div id='spider-items'>").appendTo($container);
  var $summaries = $("<table>", {"id" : "spider-summaries"}).appendTo($items);
  for(var i = 0; i < subjects.length; i++) {
    var $summary = Viewer.getSubjectHTML(m, m.projections[subjects[i]], "referred_cell", true);
    var detail = v.getSummaryHTML(subjects[i]);
    var $detail = null;
    if(detail) {
      $detail = $($(detail).find("table td")[1]);
    }
    
    $summaries.append($("<tr class='spider-summary'>").append($summary));
    $items.append(
        $("<div>", {"class" : "spider-detail", "id" : $summary.attr("href")}).append($detail));
  }
  return $("<div>").append($wrapper).html();
}
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
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
      results.onSelectionChanged = onSelectionChanged;
      bg_res[request.url] = results;
      
      //feedback related items to content script
      var m = new Manager(sender.tab);
      m.renew();
      var subjects = getRelatedSubjects(m, request.rdfa, request.micro);
      //console.log(subjects);      
      subjects = Manager.trimDuplicate(subjects);
      
      var v = new Viewer(m, sender.tab);
      var html = generateInsertedHTML(m, v, subjects);

      sendResponse({html: html});
    }
);
function onSelectionChanged(tabId) {
  chrome.tabs.executeScript(tabId, {
    file: "content.js"
  });
}

chrome.tabs.onActivated.addListener(function(activeInfo) {
  onSelectionChanged(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(function(id, changeInfo, tab) {
  onSelectionChanged(id);
});
