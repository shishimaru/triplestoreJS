/* $Id$ */
String.prototype.trim = function() {
  return this.replace(/^\s+|\s+$/g, "");
};
var Manager = function(){
  this.lst = localStorage;
  {//TriplestoreJS
    this.tst = new Triplestore();
    this.tst.setMapping("foaf", "http://xmlns.com/foaf/0.1/");
    this.tst.setMapping("schema", "http://schema.org/");
    this.tst.setMapping("dc", "http://purl.org/dc/elements/1.1/");
  }
};
//Manager.DEV_MODE = "debug";
Manager.DEV_MODE = "product";
Manager.APP_ID = chrome.i18n.getMessage("@@extension_id");
Manager.APP_URL = "chrome-extension://" + Manager.APP_ID + "/";
Manager.APP_HOMEPAGE = "http://www.w3.org/2013/04/semweb-html5/spider/";
Manager.PROP_FOUNDAt = "__FOUND_At__";
Manager.PROP_FAVICON = "__FAVICON__";
Manager.PROP_TITLE =   "__TITLE__";
Manager.PROP_EXPIRES = "__EXPIRES__";
Manager.PROP_SELECT_NUM = "__SELECT_NUM__";
Manager.PROP_SYNCING = "__SYNCING__";
Manager.PROP_IMGDATA = "__IMGDATA__";
Manager.IMGDATA_SIZE = {W:35, H:45};
Manager.FACE_FEATURES = "__FACE_FEATURES__";

Manager.FB_APP_ID = "272938312872643";
Manager.FB_BASE_URL = "https://www.facebook.com/";
Manager.FB_GRAPH_URL = "https://graph.facebook.com/";
Manager.FB_DIALOG_FEED_URL = "https://www.facebook.com/dialog/feed";
Manager.FB_DIALOG_SEND_URL = "https://www.facebook.com/dialog/send";
Manager.FB_POST_URL = "https://semantic-spider.appspot.com/c/fb-post";
Manager.FB_REDIRECT_URL = Manager.DEV_MODE == "product" ?
    'https://ckdnmkbanbampnifpddcfdphonmfibkb.chromiumapp.org/callback':
    'https://flkmphkcppbjjamopnpbmppbiohnmjkn.chromiumapp.org/callback';

Manager.GL_API_KEY = "AIzaSyAyf46iLrX1qs2kPokrrc5A-i6yhGqaj44"
Manager.GL_BASE_URL = "https://plus.google.com/";
Manager.GL_PEOPLE_URL = "https://www.googleapis.com/plus/v1/people/";
Manager.GL_POST_URL = "https://semantic-spider.appspot.com/c/g-post";

Manager.GL_CAL_LIST_URL = "https://www.googleapis.com/calendar/v3/users/me/calendarList/";
Manager.GL_CAL_EVENT_URL = "https://www.googleapis.com/calendar/v3/calendars/";
Manager.GL_PHOTO_ALBUM_URL = "https://picasaweb.google.com/data/feed/api/user/default";
Manager.GL_POSTING_URL = "https://www.googleapis.com/plus/v1/people/me/activities/public";

Manager.prototype.init =function(tab) {
  this.tab = tab;
  if(this.tab) {
    var flagIndex = this.tab.url.lastIndexOf("#");
    if(flagIndex != -1) {
      this.tab.url = this.tab.url.substr(0, flagIndex);
    }
  }
  var bg = chrome.extension.getBackgroundPage();
  if(bg && tab) {
    this.bg_res = bg.bg_res;
    this.rdfa = this.bg_res[tab.url] ? this.bg_res[tab.url].rdfa : null;
    this.micro = this.bg_res[tab.url] ? this.bg_res[tab.url].micro : null;
    this.expires = this.bg_res[tab.url] ? this.bg_res[tab.url].expires : null;
  }
};
Manager.prototype.getSubjects = function(property, value, isLax) {
  var res = [];
  for(var subject in this.projections) {
    var projection = this.projections[subject];
    
    if(property == null && value == null) {
      res.push(subject);
    } else if(property && value == null){
      if(isLax) {
        var matchedProps = 
          Manager.filter(property.split(" "), projection.getProperties(), true);
        if(matchedProps.length) {
          res.push(subject);
        }
      } else {
        if(projection.getAll(property).length) {
          res.push(subject);
        }
      }
    } else if(property == null && value){
      if(isLax) {
        var values = projection.getAll(property);
        var matchedValues = Manager.filter(value.split(" "), values, false);
        if(matchedValues.length) {
          res.push(subject);
        }
      } else {
        if(projection.getProperties(value).length) {
          res.push(subject);
        }
      }
    } else if(property && value){
      var values = projection.getAll(property);
      
      if(isLax) {
        var matchedValues = Manager.filter(value.split(" "), values, false);
        if(matchedValues.length) {
          res.push(subject);
        }
      } else {
        for(var i = 0; i < values.length; i++) {
          if(values[i] == value) {
            res.push(subject);
            break;
          }
        }
      }
    }
  }
  return res;
};
Manager.prototype.getFilteredValues = function(subject, propKeywords, isOr) {
  var res = [];
  if(this.projections[subject]) {
    var props = this.projections[subject].getProperties();
    var type_props = Manager.filter(propKeywords, props, true, isOr);
    for(var i = 0; i < type_props.length; i++) {
      res = res.concat(this.projections[subject].getAll(type_props[i]));
    }
  }
  return res;
};
Manager.prototype.getValues = function(subject, propKeywords) {
  var res = [];
  if(subject) {
    res = res.concat(this.getFilteredValues(subject, propKeywords));
  } else {
    for(var subject in this.projections) {
      res = res.concat(this.getFilteredValues(subject, propKeywords));
    }
  }
  return res;
};
Manager.prototype.getName = function(subject) {
  var name = null;
  if(subject && this.projections[subject]) {
    var projection = this.projections[subject];
    var props = projection.getProperties();
    for(var i = 0; i < props.length; i++) {
      var prop = props[i];
      if(prop.match(/name$/) ||
          prop.match(/title$/) ||
          prop == Manager.PROP_TITLE) {
        name = projection.get(prop);
        break;
      }
    }
  }
  return name
}
Manager.prototype.getObject = function(subject) {
  var obj = null;
  if(subject && this.projections[subject]) {
    obj = {};
    var p = this.projections[subject];
    var props = p.getProperties();
    for(var i = 0; i < props.length; i++) {
      var value = p.get(props[i]);
      obj[props[i]] = value;
    }
  }
  return obj;
}
Manager.prototype.renew = function() {
  //this.subjects = [];
  this.projections = {};
  this.types = [];
  this.referred = {};
  
  var subs = this.tst.getSubjects();
  for(var i = 0; i < subs.length; i++) {
    var subject = subs[i];
    if(subject.search(/^_:/) == -1) {
      //this.subjects.push(subject);
      this.projections[subject] = this.tst.getProjection(subject);
      this.types = this.types.concat(this.getValues(subject, ["type"]));
    }
  }
  this.types = Manager.trimDuplicate(this.types);
  /*this.types.sort(function(a,b) {
    var codeA = a[a.lastIndexOf("/") + 1].toLowerCase().charCodeAt(0);
    var codeB = b[b.lastIndexOf("/") + 1].toLowerCase().charCodeAt(0);
    return codeB - codeA;
  });*/
  
  //init referred map
  this.referred = this.getReferredMap(this.projections);
  
  //calculate rating for each item
  var rating = Manager.calcRating(this.projections, this.referred);
  
  //sort with reference count
  this.projections = Manager.sortProjections(this.projections, rating);
};
//escape duplicated value
Manager.prototype.add = function(subject, property, value) {
  var values = this.tst.getValues(subject, property);
  var has = false;
  for(var i = 0; i < values.length; i++) {
    if(values[i] == value) {
      has = true;
      break;
    }
  }
  if(!has) {
    this.tst.add(subject, property, value);
  }
}
Manager.prototype.getReferredMap = function(projections) {
  var referred = {}
  for(var subject in projections) {
    var props = projections[subject].getProperties();
    for(var i = 0; i < props.length; i++) {
      if(props[i].search(/^__/) == -1) {
        var values = projections[subject].getAll(props[i]);
        for(var j = 0; j < values.length; j++) {
          if(projections[values[j]] && values[j] != subject) {
            if(!referred[values[j]]) {
              referred[values[j]] = [];
            }
            referred[values[j]].push(subject);
          }
        }
      }
    }
  }
  return referred;
};
Manager.prototype.stopSync = function(subject) {
  chrome.storage.sync.remove(subject);
  this.tst.remove(subject, Manager.PROP_SYNCING);
};
Manager.calcRating = function(projections, referredMap) {
  var rating = {};
  for(var subject in referredMap) {
    rating[subject] = referredMap[subject].length;
  }
  return rating;
};
Manager.sortProjections = function(projections, rating) {
  var tmpProjections = [];
  for(var subject in projections) {
    var obj = {"subject"    : subject, 
               "projection" : projections[subject],
               "count"      : !rating[subject] ? 0 : rating[subject]};
    tmpProjections.push(obj);
  }
  
  //sort with the rating
  tmpProjections.sort(function(a,b){
    return b.count - a.count;
  });
  
  var res = {};
  for(var i = 0; i < tmpProjections.length; i++) {
    res[tmpProjections[i].subject] = tmpProjections[i].projection; 
  }
  return res;
};
Manager.filter = function(keywords, list, onlyTail, isOr) {
  var res = [];
  for(var i = 0; i < list.length; i++) {
    if(list[i]) {
      var findNum = 0;
      for(var j = 0; j < keywords.length; j++) {
        var regex = new RegExp(keywords[j] + (onlyTail ? "$" : ""), "i");
        if(!list[i].match(regex)) {
          if(isOr) {
            continue;
          } else {
            break;
          }
        }
        findNum++;
      }
      if(isOr && findNum) {
        findNum = keywords.length;
      }
      if(findNum >= keywords.length) {
        res.push(list[i]);
      }
    }
  }
  return res;
};
Manager.prototype.filterSubjects = function (keywords, isAll) {
  var subjects = [];
  for(var subject in this.projections) {
    var tmpProps = this.projections[subject].getProperties();
    var tmpValues = this.projections[subject].getAll();
    var count = 0;
    for(var i = 0; i < keywords.length; i++) {
      var found = false;
      for(var j = 0; tmpProps[j] && j < tmpProps.length; j++) {
        if(tmpProps[j].toLowerCase().indexOf(keywords[i].toLowerCase()) != -1) {
          found = true;
          break;
        }
      }
      for(var j = 0; !found && tmpValues[j] && j < tmpValues.length; j++) {
        if(tmpValues[j].toLowerCase && keywords[i].toLowerCase &&
            tmpValues[j].toLowerCase().indexOf(keywords[i].toLowerCase()) != -1) {
          found = true;
          break;
        }
      }
      if(found) {
        count = isAll ? count + 1 : keywords.length;
      }
    }
    if(count >= keywords.length) {
      subjects.push(subject);
    }
  }
  return subjects;
};
Manager.trimDuplicate = function(list) {
  var map = {};
  for(var i = 0; i < list.length; i++) {
    map[list[i]] = null;
  }
  var res = [];
  for(var key in map) {
    res.push(key);
  }
  return res;
};
/**
 * Trim items whose similarities are more than
 * the specified similarity ratio.
 */
Manager.trimSimilar = function(list, similarity) {
  var res = []
  for(var i = 0; i < list.length - 1 ; i++) {
    for(var j = i + 1; j < list.length;) {
      var simValue = ML.jaccord(list[i], list[j]);
      if(simValue > similarity) {
        list.splice(j,1);
      } else {
        j++;
      }
    }
  }
  return list;
}
Manager.isAbsoluteURI = function(url_str) {
  return (url_str && (url_str.indexOf("://") != -1)) ? true : false;
};
Manager.isSiteURL = function(url_str) {
  return (url_str && (url_str.search(/^http:\/\//i) != -1 ||
      url_str.search(/^https:\/\//i) != -1)) ? true : false;
};
Manager.ave = function(values, floatDigit) {
  var d = floatDigit ? 10*floatDigit: 1;
  if(typeof(values) == "string") {
    return parseFloat(values, 10);
  }
  
  var sum = 0;
  var count = 0;
  for(var i = 0; i < values.length; i++) {
    if(typeof(values[i]) == "number") {
      sum += values[i];
      count++;
    } else if(typeof(values[i]) == "string") {
      var v = parseFloat(values[i], 10);
      if(!isNaN(v)) {
        sum += v;
        count++;
      }
    }
  }
  return count ? Math.round(sum/count*d)/d: 0; 
};
Manager.toHumanReadable = function(str) {
  function isLowerCase(c) {
    return (c >= 97 && c <= 122) ? true : false;
  }
  function isUpperCase(c) {
    return (c >= 65 && c <= 90) ? true : false;
  }
  var res = [];
  for(var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    if(!i && isLowerCase(c)) {//lower case
      c -= 32;
    } else if(isUpperCase(c)) {//upper case
      if(i && isLowerCase(res[res.length - 1].charCodeAt(0))) {
        res.push(' ');
      }
    }
    res.push(String.fromCharCode(c));
  }
  return res.join("");
};
/*Manager.prototype.freeTriples = function() {
  delete this.bg_res[tab.url];
};*/
function has(values, value) {
  for(var i = 0; values && i < values.length; i++) {
    if(values[i] == value) {
      return true;
    }
  }
  return false;
}
Manager.hasKey = function(o) {
  for(var k in o) { return true; }
  return false;
}
Manager.getItemLen = function(items) {
  var len = 0;
  if(items) {
    if(items instanceof Array) {
      len = items.length;
    } else {
      for(var item in items) {
        len++;
      }
    }
  }
  return len;
}
Manager.prototype.save = function() {
  //save triple only which doesn't have same value  
  function _save(m, subject, property, value, isAdd) {
    var values = m.tst.getValues(subject, property);
    var found = false;
    if(values.length) {
      for(var i = 0; i < values.length; i++) {
        if(values[i] == value) {
          found = true;
          break;
        }
      }
    }
    if(!found) {
      if(isAdd) {
        m.tst.add(subject, property, value);
      } else {
        m.tst.set(subject, property, value);
      }
    }
  }
  
  if(this.rdfa) {
    //save RDFa triples
    console.log("start save RDFa");
    for(var subject in this.rdfa) {
      var props = this.rdfa[subject];
      for(var prop in props) {
        var value = props[prop];
        console.log(subject, prop, value);
        _save(this, subject, prop, value, true);
      }
      //store site info
      _save(this, subject, Manager.PROP_FOUNDAt, this.tab.url, true);
      if(this.tab.favIconUrl) {
        _save(this, subject, Manager.PROP_FAVICON, this.tab.favIconUrl, true);
      }
      //store expires
      if(this.expires) {
        _save(this, subject, Manager.PROP_EXPIRES, this.expires.toUTCString(), false);
      }
    }
    console.log("end save RDFa");
  }
  
  if(this.micro && this.micro.items) {
    //save microdata triples
    console.log("start save microdata");
    for(var i = 0; i < this.micro.items.length; i++) {
      var item = this.micro.items[i];
      var subject = item.id ? item.id : (item.properties["url"] ? item.properties["url"] : this.tab.url);
      var props = item.properties;
      var type = item.type;
      props['__type'] = type;
      
      for(var prop in props) {
        var values = props[prop];
        for(var j = 0; j < values.length; j++) {
          var value = values[j];
          console.log(subject, prop, value);
          if(typeof(value) == "object") {
            value = JSON.stringify(value);
          }
          _save(this, subject, prop, value, true);
        }
      }
      //store site info
      _save(this, subject, Manager.PROP_FOUNDAt, this.tab.url, true);
      if(this.tab.favIconUrl) {
        _save(this, subject, Manager.PROP_FAVICON, this.tab.favIconUrl, true);
      }
      //store expires
      if(this.expires) {
        _save(this, subject, Manager.PROP_EXPIRES, this.expires.toUTCString(), false);
      }
    }
    console.log("end save microdata");
  }
  
  //save this site
  /*if(Manager.isSiteURL(this.tab.url)) {
    var subject = this.tab.url;
    _save(this, subject, Manager.PROP_TITLE, this.tab.title, true);
    if(!this.tst.getValues(subject, "title").length) {
      _save(this, subject, "title", this.tab.title, true);
    }
    if(this.tab.favIconUrl) {
      _save(this, subject, Manager.PROP_FAVICON, this.tab.favIconUrl, true);
    }
  }*/
  
  //renew internal status
  this.renew();
};
Manager.prototype.remove = function(subject) {
  if(this.projections[subject]) {
    chrome.storage.sync.remove(subject);
    this.projections[subject].remove();
  }
  this.renew();
};
Manager.prototype.clear = function() {
  this.tst.remove();
  this.renew();
};
Manager.prototype.incrementSelectNumber = function(subject) {
  if(subject) {
    var projection = this.projections[subject];
    if(projection) {
      var num = projection.get(Manager.PROP_SELECT_NUM);
      if(!num) {
        num = 1;
      } else {
        num = parseInt(num) + 1;
      }
      this.tst.set(subject, Manager.PROP_SELECT_NUM, String(num));
    }
  }
};
Manager.prototype.getSelectNumber = function(subject) {
  var res = 0;
  if(subject) {
    var projection = this.projections[subject];
    if(projection) {
      var num = projection.get(Manager.PROP_SELECT_NUM);
      if(num) {
        res = parseInt(num);
      }
    }
  }
  return res;
};
Manager.encode = function(kvMap) {
  var res = "";
  var dict = { "'": "%27"};
  for(var key in kvMap) {
    if(res.length) {
      res += '&';
    }
    var k = encodeURIComponent(key);
    var v = kvMap[key];
    
    if(v.constructor.name == "Array") {
      if(v.length) {
        for(var i = 0; i < v.length; i++) {
          if(i) {
            res += '&';
          }
          res += k + '=' + encodeURIComponent(v[i]);
        }
      } else {
        res += k;
      }
    } else {
      v = encodeURIComponent(v);
      v = v.replace(/'/g, function(s) {
        return dict[s];
      });
      res += k + '=' + v;
    }
  }
  return res;
}
Manager.toRFC3339 = function(date) {
  //2013-10-10T00:00:00.000Z
  //("0" + num).slice(-2)
  var res = "";
  var year = date.getFullYear();
  var month = ("0" + (date.getMonth() + 1)).slice(-2);
  var day = ("0" + date.getDate()).slice(-2);
  var hour = ("0" + date.getHours()).slice(-2);
  var min = ("0" + date.getMinutes()).slice(-2);
  var sec = ("0" + date.getSeconds()).slice(-2);
  var msec = ("0" + date.getMilliseconds()).slice(-3);
  var zone = ("0" + date.getTimezoneOffset()/60).slice(-2);
  res += year + "-" + month + "-" + day + "T";
  res += hour + ":" + min + ":" + sec + "." + msec;
  res += "-" + zone + ":00";
  return res;
}
Manager.isFacebookProperty = function(name, value) {
  if(name && value) {
    if(name.search(/^facebook-/) != -1 ||
        name.search(/holdsAccount$/) != -1 ||
        name.search(/knows$/) != -1){
      if(value.search(/^https?:\/\/www\.facebook\./) != -1) {
        return true
      }
    }
  }
  return false;
}
Manager.isGoogleProperty = function(name, value) {
  if(name && value) {
    if(name.search(/^google-/) != -1 ||
       name.search(/holdsAccount$/) != -1 ||
       name.search(/knows$/) != -1) {
      if(value.search(/^https?:\/\/plus.google\./) != -1) {
        return true
      }
    }
  }
  return false;
}
Manager.prototype.saveFrecogFeatures = function() {
  var subjects = this.getSubjects(null, "http://xmlns.com/foaf/0.1/Person", false);
  subjects = subjects.concat(this.getSubjects(null, "http://schema.org/Person", false));
  var imgSet = [];
  for(var i = 0; i < subjects.length; i++) {
    var subject = subjects[i];
    var faceDataList = this.tst.getValues(subject, Manager.PROP_IMGDATA);
    for(var j = 0; j < faceDataList.length; j++) {
      var faceData = faceDataList[j];
      imgSet.push({userdata: subject, data: faceData});      
    }
  }
  var features = frecog.createFeatures(imgSet);
  //this.faceFeatures = features;
  this.lst[Manager.FACE_FEATURES] = JSON.stringify(features);
  return features;
}

Manager.dict_pronoun = ["i", "my", "me", "mine",
                        "we", "our", "us", "ours",
                        "you", "your", "yours",
                        "he", "his", "him",
                        "she", "her", "hers",
                        "it", "its",
                        "they", "their", "them", "theirs",
                        "this", "that", "these", "those",
                        "one", "ones", "all"];
Manager.dict_verb = ["is", "am", "are", "was", "were", "do", "does", "did", "done", "have", "has", "had", "been"];
Manager.dict_article = ["a", "an", "the"];
Manager.dict_auxiliary = ["can", "must", "will", "may", "shall", "should", "could", "would",
                          "might", "would"];
Manager.dict_preposition = ["aboard", "about", "above", "across", "after", "against", "along",
                            "alongside", "all", "and", "around", "as", "at", "before", "behind", "below",
                            "beneath", "beside", "besides", "between", "beyond", "but", "by",
                            "concerning", "despite", "down", "during", "except", "excluding",
                            "few", "for", "from", "in", "including", "inside", "into", "like", "near",
                            "of", "off", "on", "onto", "out", "outside", "over", "past", "per",
                            "pro", "regarding", "since", "such", "than", "through", "till", "to",
                            "toward", "under", "unlike", "until", "up", "upon", "versus",
                            "via", "with", "within", "without"];
Manager.dict_code = ["-"];

Manager.sanitize = function(words) {
  function toLower(words) {
    for(var i = 0; i < words.length; i++) {
      words[i] = words[i].toLowerCase();
    }
  }
  function checkDict(word, dict) {
    for(var i = 0; i < dict.length; i++) {
      if(word == dict[i]) {
        return true;
      }
    }
    return false;
  }
  function removeStopWord(words) {
    var i = 0;
    while(i < words.length) {
      if(words[i].trim().length < 2 ||
          checkDict(words[i], Manager.dict_pronoun) ||
          checkDict(words[i], Manager.dict_verb) ||
          checkDict(words[i], Manager.dict_article) ||
          checkDict(words[i], Manager.dict_auxiliary) ||
          checkDict(words[i], Manager.dict_preposition) ||
          checkDict(words[i], Manager.dict_code)) {
        words.splice(i,1);
      } else {
        i++;
      }
    }
  }
  toLower(words);
  removeStopWord(words);
}
Manager.sanitizeString = function(str) {
  var res = str;
  if(str) {
    var STOP_CH = /[!"#\$%\&'\(\)-=\^~|\\\[\{\}\]`@\*:\+;_\/\?<>,.®]/g;
    res = res.replace(STOP_CH,"");
    res = res.replace(/\s+/g," ");
  }
  return res;
}
Manager.prototype.getSimilarItems = function(targetValues, similarityThreshold) {
  var SEP = /[\s\t\d\n,\.!\?"#$%=&'"\(\):;\[\]\^®]+/;
  var w1 = targetValues.join(" ").split(SEP);//sanitize
  Manager.sanitize(w1);//sanitize
  
  var res = [];
  for(var subject in this.projections) {
    var projection = this.projections[subject];
    var values = [];//values to be compared with target
    
    var props = projection.getProperties();
    for(var i = 0; i < props.length; i++) {
      if(props[i].match(/name$/) ||
          props[i].match(/title$/) ||
          props[i] == Manager.PROP_TITLE
      ){
        values = values.concat(projection.getAll(props[i]));
      }
    }
    
    var w2 = values.join(" ").split(SEP);//sanitize
    Manager.sanitize(w2);//sanitize
    
    //detect similarity and register to res
    if(w1.length && w2.length) {
      var similarity = ML.jaccord(w1, w2);
      
      if(similarity > similarityThreshold) {
        res.push({
          subject: subject,
          similarity: similarity});
      }
    }
  }
  return res;
};
Manager.prototype.getCitingPosting = function(urls, similarity) {
  var res = [];
  var subjects = this.getSubjects("schema:type", "http://schema.org/Comment");
  for(var i = 0; i < subjects.length; i++) {
    var proj = this.projections[subjects[i]];
    var citations = proj.getAll("schema:citation");
    for(var j = 0; j < citations.length; j++) {
      for(var k = 0; k < urls.length; k++) {
        if(citations[j] == urls[k]) {
          res.push({subject:subjects[i], similarity: similarity}); 
          break;
        }
      }
    }
  }
  return res;
}
Manager.prototype.export = function() {
  var res = '{"items":[';
  var flag = false;
  for(var key in localStorage) {
    if(key.search("^<W3C>") != -1) {
      if(flag) {
        res += ',';
      }
      flag = true;
      res += '{"' + key + '":' + localStorage[key] + '}';
    }
  }
  res += ']}';
  return res;
}
var Datatype = function() {};
Datatype.isDate = function(s) {
  return s.trim().search(/\d+[\-\/]\d+([\-\/]\d+)?((\T\s)\d+:\d+)?/) != -1;
};
Datatype.isPrice = function(s) {
  return s.trim().search(/^\$[0-9,]*.?[0-9]*$/) != -1;
};
Datatype.isPhone = function(s) {
  return s.trim().search(/^tel:\+\d+/) != -1;
}
Datatype.isURL = function(s) {
  return s.trim().search(/^http[s]?:\/\//) != -1; 
}
Datatype.isEmail = function(s) {
  return s.trim().search(/^mailto:/) != -1; 
}
