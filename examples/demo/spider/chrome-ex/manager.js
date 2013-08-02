/* $Id$ */
String.prototype.trim = function() {
  return this.replace(/^\s+|\s+$/g, "");
};
var Manager = function(tab){
  this.init(tab);
};
Manager.PROP_FOUNDAt = "__FOUND_At__";
Manager.PROP_FAVICON = "__FAVICON__";
Manager.PROP_TITLE = "__TITLE__";
Manager.prototype.init =function(tab) {
  this.app_id = chrome.i18n.getMessage("@@extension_id");
  this.app_url = "chrome-extension://" + this.app_id + "/";
  
  this.tab = tab;
  var bg = chrome.extension.getBackgroundPage();
  if(bg) {
    this.bg_res = bg.bg_res;
    this.rdfa = this.bg_res[tab.url] ? this.bg_res[tab.url].rdfa : null;
    this.micro = this.bg_res[tab.url] ? this.bg_res[tab.url].micro : null;
    this.onSelectionChanged = this.bg_res[tab.url] ? this.bg_res[tab.url].onSelectionChanged : null;
  }

  this.tst = new Triplestore();
  this.lst = localStorage;
};
Manager.prototype.getSubjects = function(property, value, isLax) {
  var res = [];
  for(var subject in this.projections) {
    var projection = this.projections[subject];
    
    if(property == null && value == null) {
      res.push(subject);
    } else if(property && value == null){
      if(projection.getAll(property).length) {
        res.push(subject);
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
Manager.prototype.getFilteredValues = function(subject, propKeywords) {
  var res = [];
  var props = this.projections[subject].getProperties();
  var type_props = Manager.filter(propKeywords, props, true);
  for(var i = 0; i < type_props.length; i++) {
    res = res.concat(this.projections[subject].getAll(type_props[i]));
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
}
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
Manager.filter = function(keywords, list, onlyTail) {
  var res = [];
  for(var i = 0; i < list.length; i++) {
    if(list[i]) {
      var findNum = 0;
      for(var j = 0; j < keywords.length; j++) {
        var regex = new RegExp(keywords[j] + (onlyTail ? "$" : ""), "i");
        if(!list[i].match(regex)) {
            break;
        }
        findNum++;
      }
      if(findNum >= keywords.length) {
        res.push(list[i]);
      }
    }
  }
  return res;
};
Manager.prototype.filterSubjects = function (keywords) {
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
        if(tmpValues[j].toLowerCase().indexOf(keywords[i].toLowerCase()) != -1) {
          found = true;
          break;
        }
      }
      if(found) {
        count++;
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
Manager.prototype.save = function() {
  //save triple only which doesn't have same value  
  function _save(m, subject, property, value) {
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
      m.tst.add(subject, property, value);
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
        _save(this, subject, prop, value);
      }
      //store site url
      _save(this, subject, Manager.PROP_FOUNDAt, this.tab.url);
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
          _save(this, subject, prop, value);
        }
      }
      //store site url
      _save(this, subject, Manager.PROP_FOUNDAt, this.tab.url);
      
    }
    console.log("end save microdata");
  }
  
  //save this site
  if(Manager.isSiteURL(this.tab.url)) {
    var subject = this.tab.url;
    _save(this, subject, Manager.PROP_TITLE, this.tab.title);
    if(!this.tst.getValues(subject, "title").length) {
      _save(this, subject, "title", this.tab.title);
    }
    if(this.tab.favIconUrl) {
      _save(this, subject, Manager.PROP_FAVICON, this.tab.favIconUrl);
    }
  }
  
  //renew internal status
  this.renew();
  //TODO : feedback to content script
  //this.onSelectionChanged(m.tab.id);
};
Manager.prototype.remove = function(subject) {
  if(this.projections[subject]) {
    this.projections[subject].remove();
  }
  this.renew();
};
Manager.prototype.clear = function() {
  this.tst.remove();
  this.renew();
};

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