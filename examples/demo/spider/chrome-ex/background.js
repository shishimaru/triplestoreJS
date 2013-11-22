/* $Id$ */
var bg_res = {};
var expires = {};

//sort subjects based on priority
function sortSnsAccount(m, subjects) {
  //sort with past select number
  subjects.sort(function(s1, s2) {
    var p1 = m.projections[s1];
    var p2 = m.projections[s2];
    var n1 = p1.get(Manager.PROP_SELECT_NUM);
    var n2 = p2.get(Manager.PROP_SELECT_NUM);
    n1 = n1 ? parseInt(n1) : 0;
    n2 = n2 ? parseInt(n2) : 0;
    return n2 - n1;
  });
  
  //put user's SNS account on top
  var fb_account = Options.getFacebookAccount();
  var gl_account = Options.getGoogleAccount();
  for(var i = 0; i < subjects.length; i++) {
    var subject = subjects[i];
    if(subject == fb_account || subject == gl_account) {
      subjects.splice(i, 1);
      subjects.unshift(subject);
    }
  }
}

function getRelatedSubjects(m, title, rdfa, micro) {
  var items = [];
  var MIN_SIMILARITY = 0.3;//0.5;
  var MIN_PROPS_LEN = 2;//at least 2
  var MAX_RESULT_SIZE =  20;
  
  function sanitize(items) {
    var i = 0;
    while(i < items.length) {
      var props = m.projections[items[i].subject].getProperties();
      var valid_prop_len = 0;
      for(var j = 0; j < props.length; j++) {
        if(!props[j].match(/^__/)) {
          valid_prop_len++;
        }
      }
      if(valid_prop_len < MIN_PROPS_LEN) {
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
  sortSnsAccount(m, subjects);
  subjects = Manager.trimDuplicate(subjects);
  subjects = subjects.slice(0, MAX_RESULT_SIZE);
  
  return subjects;
}
function generateInsertedHTML(m, v, subjects, emailQuery, fb_request, gl_request) {
  if(!subjects.length) {
    return null;
  }
  var $wrapper = $("<div>", {"id" : "spider-wrapper"});
  var $img = $("<img>", {"class" : "related_type", "src" : Manager.APP_URL + "images/spider.png"});
  $wrapper.append($("<div>", {"id" : "spider-visible", "title": "Toggle by ESC"}).append($img));
  var $container = $("<div>", {"id" : "spider-container"}).appendTo($wrapper);
  
  var $items = $("<div id='spider-items'>").appendTo($container);
  var $summaries = $("<table>", {"id" : "spider-summaries"}).appendTo($items);
  for(var i = 0; i < subjects.length; i++) {
    var $summary = Viewer.getSubjectHTML(m, m.projections[subjects[i]], "referred_cell", true);
    $summaries.append($("<tr class='spider-summary'>").append($summary));
    
    var detail = v.getSummaryHTML(subjects[i], emailQuery, fb_request, gl_request);
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
      var m = bg_res.m;
      m.init(sender.tab);
      m.renew();
      var v = new Viewer(m, sender.tab);
      
      if(request.action == "extracted") {
        if(!sender.tab || !sender.tab.id) {
          return;
        }
        //reset icon
        Viewer.changeIcon(sender.tab.id);
        //init
        var results = {};
        if(request.rdfa) {
          console.log("bg received RDFa");
          results.rdfa = request.rdfa;
        }
        if(request.micro) {
          console.log("bg received microdata");
          results.micro = request.micro;
        }
        if((request.rdfa && Manager.hasKey(request.rdfa)) ||
            (request.micro && request.micro.items.length)) {
          //notify the site has annotation
          var itemSize = Manager.getItemLen(request.rdfa);
          itemSize += Manager.getItemLen(request.micro.items);
          Viewer.changeIcon(sender.tab.id, String(itemSize));
        }
        results.expires = expires[request.url];
        bg_res[request.url] = results;
        countVisitNumber(request.url);
        
        //auto save the items based on visit number
        var visit = Options.getAutostoreVisit();
        if(visit && getVisitNumber(request.url) >= visit * 3) {
          m.save();
        }
      }
      //auto save for long stay at same site
      else if(request.action == "long-stay") {
        m.save();
      }
      else if(request.action == "selectItemNumber++") {
        m.incrementSelectNumber(request.subject);
      }
      else if(request.action == "selectKeywordNumber++") {
        var subjects = m.getSubjects(null, request.keyword, true);
        for(var i = 0; i < subjects.length; i++) {
          m.incrementSelectNumber(subjects[i]);
        }
      }
      else if(request.action == "getKeyword") {
        if(request.keyword && request.keyword.length) {
          var keywords = request.keyword.split(" ");
          var subjects = null;
          if(request.itemtype) {
            subjects = m.getSubjects(null, request.itemtype, true);  
          } else {
            subjects = m.getSubjects(null);
          }
          subjects.sort(function(s1, s2) {//sort with select number history
            return m.getSelectNumber(s2) - m.getSelectNumber(s1);
          });
          var values = [];
          for(var i = 0; i < subjects.length; i++) {
            values = values.concat(m.getFilteredValues(subjects[i], ["name","title"], true));
          }
          values = Manager.filter(keywords, values);
          for(var i = 0; i < values.length; i++) {
            values[i] = values[i].substr(0, 45);//shorten long keyword
          }
          values = Manager.trimSimilar(values, 0.8);
          var html = Viewer.getKeywordSearchHTML(values);
          sendResponse({html: html});
        }
        return false;
      }
      else if(request.action == "post-facebook") {//TODO:delete
        var requestURL = request.url + '&' +
        Manager.encode({access_token: Options.getFacebookAccessToken()});

        var xhr = new XMLHttpRequest();
        xhr.open("POST", requestURL, true);
        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4) {
            // JSON.parse does not evaluate the attacker's scripts.
            var resp = JSON.parse(xhr.responseText);
            if(resp.id) {
              alert("Done");
            } else if(resp.error) {
              alert(resp.error.message);
            }
          }
        }
        xhr.send();
        return false;
      }
      //feedback related items to content script
      var subjects = getRelatedSubjects(m, request.title,
          bg_res[request.url].rdfa, bg_res[request.url].micro);
      
      var html = generateInsertedHTML(m, v, subjects);
      var time = Options.getAutostoreTime();
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
function cleanOldItems(m) {
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
  function saveSyncItems() {//synchroize items
    chrome.storage.sync.get(null, function(items) {
      if(!chrome.runtime.lastError) {
        var maxSize = chrome.storage.sync.QUOTA_BYTES;
        chrome.storage.sync.getBytesInUse(null, function(usedSize) {
          if(!chrome.runtime.lastError) {
            var expirationHours = -799 * (usedSize/maxSize * 0.9 + 0.1) + 800;
            var now = new Date().getTime();
            for(var subject in items) {
              //save to storage
              var propValue = items[subject].pv;
              for(var prop in propValue) {
                m.tst.set(subject, prop, propValue[prop]);
              }
              //remove old sycing items from sync storage
              var savedTime = parseInt(items[subject].t);
              if(now - savedTime > expirationHours * 3600 * 1000) { //keep 720~1 hours
                m.stopSync(subject);
              } else {
                m.tst.set(subject, Manager.PROP_SYNCING, "1");
              }
            }
            m.renew();
          }
        });
      }
    });
  }
  
  var m = new Manager();
  m.init(null);
  m.renew();
  bg_res.m = m;
  if(Options.is_remove()) {
    cleanOldItems(m);
  }
  //start monitoring synced items
  saveSyncItems();
  setInterval(function() {
    saveSyncItems();
  }, 20 * 1000);
});

function menu_share(info, tab) {
  var MAX_RESULT_SIZE =  100;
  var pageURL = info.pageUrl;
  var email_query = {
      subject: "Sharing ",
      body: ""
  };
  var fb_request = {
      method: "dialog/send",
      query: {
        app_id: Manager.FB_APP_ID,
        display: "popup",
        link: pageURL,//if not reachable by FB, error happens
        redirect_uri: Manager.FB_REDIRECT_URL
      }
  };
  var gl_request = {
      query: {
        contenturl: tab.url
      }
  };
  
  if(info.mediaType == "image" ||
      info.mediaType == "video" ||
      info.mediaType == "audio") {
    email_query.subject += "media";
    email_query.body = info.srcUrl;
    
    fb_request.query.link = info.srcUrl;
    gl_request.query.contenturl = info.srcUrl;
    
  } else if(info.linkUrl) {
    email_query.subject += "URL";
    email_query.body = info.linkUrl;
    
    fb_request.query.link = info.linkUrl;
    gl_request.query.contenturl = info.linkUrl;
    
  } else if(info.selectionText) {
    email_query.subject += "text";
    email_query.body = info.selectionText;

    gl_request.query.prefilltext = info.selectionText;
  }
  var m = bg_res.m;
  var v = new Viewer(m, tab);
  var subjects = m.filterSubjects(["mbox", "facebook-account", "google-account"]);
  sortSnsAccount(m, subjects);
  subjects = subjects.slice(0, MAX_RESULT_SIZE);
  
  if(subjects.length) {
    var html = generateInsertedHTML(m, v, subjects, email_query,
        fb_request, gl_request);
    
    chrome.tabs.sendMessage(tab.id, {
      "html": html,
      "action": "suggest"
    },
    function(response) {
    });
  } else {
    alert("Sorry, could not find any contact for sharing.");
  }
}
function menu_save(info, tab) {
  var m = bg_res.m;
  m.init(tab);
  m.save();
  chrome.tabs.sendMessage(tab.id, {
    "html": Viewer.getMessageHtml("saved"),
    "action": "message"
  });
}
function menu_options(info, tab) {
  var url = Manager.APP_URL + "options.html";
  chrome.tabs.create({url : url});
}

//new context menu
//Create a parent item and two children.

var menu_top = chrome.contextMenus.create({
  title: "Semantic Spider",
  contexts: ["all"],
});
var menu_save = chrome.contextMenus.create({
  title: "Save",
  contexts: ["all"],
  parentId: menu_top,
  onclick: menu_save
});
chrome.contextMenus.create({
  title: "Share",
  contexts: ["all"],
  parentId: menu_top,
  onclick: menu_share
});
chrome.contextMenus.create({
  title: "Options...",
  contexts: ["all"],
  parentId: menu_top,
  onclick: menu_options
});