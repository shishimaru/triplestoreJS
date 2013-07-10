var bg_res = {};

function getRelatedSubjects(m, rdfa, micro) {
  var res = [];
  
  //refer : find in RDFa
  if(rdfa) {
    for(var subject in rdfa) {
      var props = rdfa[subject];
      for(var prop in props) {
        var value = props[prop];
        console.log(subject, prop, value);
        if(m.projections[value]) {
          res.push(value);
        } 
      }
    }
  }
  //refer : find in microdata
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
          if(m.projections[value]) {
            res.push(value);
          }
        }
      }
    }
  }
  //TODO : referred : find in triplestore
  /*for(var subject in m.projections) {
    
  }*/
  
  return res;
}
function generateInsertedHTML(m, subjects) {
  var table = Viewer.getSubjectsHTML(m, null, subjects, 1, "referred_cell", true);
  if(table) {
    table.addClass("related_table");
  }
  var html = null;
  if(table) {
    html = "<div id='spider-wrapper'>" +
    "<div class='spider-container'>" +
    "<img class='related_type' src='" + m.app_url + "images/spider.png'>" +
    $("<div/>").append(table).html() + "</div></div>";
  }
  return html;
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
      if(request.rdfa || request.micro) {
        //notify the site has annotation
        Viewer.changeIcon(sender.tab.id, true);
      }
      results.onSelectionChanged = onSelectionChanged;
      bg_res[request.url] = results;
      
      //feedback related items to content script
      var m = new Manager(sender.tab);
      m.renew();
      var subjects = getRelatedSubjects(m, request.rdfa, request.micro);
      console.log(subjects);      
      subjects = m.trimDuplicate(subjects);
      var html = generateInsertedHTML(m, subjects);

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
