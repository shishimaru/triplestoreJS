/* $Id$ */
var m = null;
var v = null;
//console.log = function(v){};

String.prototype.trim = function() {
  return this.replace(/^\s+|\s+$/g, "");
};

var Viewer = function(tab){
  this.tab = tab;

  //container
  this.debug = document.getElementById("debug");
  //this.search = document.getElementById("search");
  this.types = document.getElementById("types");
  this.items = document.getElementById("items");
  this.types_title = document.getElementById("types_title");
  this.items_title = document.getElementById("items_title");
  this.container = document.getElementById("container");
  this.bt_save = document.getElementById("bt_save");
  this.bt_clear = document.getElementById("bt_clear");
  //this.bt_inspect = document.getElementById("bt_inspect");
  this.selected_type = null; 

  //event listener
  this.bt_save.addEventListener('click', function() { m.save(); });
  this.bt_clear.addEventListener('click', function() { m.clear(); v.reset(); });
  //this.bt_inspect.addEventListener('click', function() { v.show(); });
  //window.addEventListener("beforeunload" , function() { m.freeTriples(); });
  
  this.focusSearchBox();
  $('#search').bind('focus', this.search);

  $('#search').bind('input', this.search);
  
  $(".search_box > .delete_input").click(function(event){
    v.focusSearchBox();
    v.reset();
  });
};
Viewer.prototype.focusSearchBox = function() {
  $('#search').val("");
  $('#search').focus();
};
Viewer.prototype.search = function() {
  var keyword = $('#search').val();
  {//filter types
    var types = m.types;
    types = m.filter(keyword.trim().split(" "), types);
    v.showTypes(types);
  }
  {//filter items
    var subjects = m.filterSubjects(keyword.trim().split(" "));
    v.showItems(subjects);
  }
};
Viewer.prototype.shortenString = function(s, len) {
  var res = s;
  if(s.length > len) {
    var separator = " ... ";
    var n = Math.floor((len - separator.length) / 2);
    res = s.substr(0, n) + separator + s.substr(s.length - n);
  }
  return res;
};

Viewer.prototype.enableButton = function(buttonElement) {
  buttonElement.removeAttribute('disabled');
};
Viewer.prototype.visibleInspect = function() {
  var inspect = $("<button id='bt_inspect' class='fit'>" +
  		"<img src='images/inspect.png' class='topbar_icon' title='inspect semantics'></button>");
  $("#bt_clear").after(inspect);
  
  inspect.click(function(event){ v.show(); });
};

Viewer.prototype.disableButton = function(buttonElement) {
  buttonElement.setAttribute('disabled', 'true');
};
Viewer.prototype.getHightlightURL = function(url_str) {
  var res = url_str;
  if(m.isAbsoluteURI(url_str)) {
    var head = url_str.substr(0, url_str.lastIndexOf("/") + 1);
    var tail = url_str.substr(url_str.lastIndexOf("/") + 1);
    res = "<span class='grey'>" + head + "</span>";
    res += tail;
  }
  return res;
};
Viewer.prototype.getRatingHTML = function(rating) {
  rating = rating > 5 ? 5 : rating;

  //http://images.bestbuy.com/BestBuy_US/images/global/misc/ratings_star_3_5.gif
  var baseURL = "http://images.bestbuy.com/BestBuy_US/images/global/misc/ratings_star_";
  var url = baseURL + Math.floor(rating) + "_" + rating * 10 % 10 + ".gif";
  return "<img src='" + url + "'>";
};
Viewer.prototype.showTypes = function(types) {
  /*$('#types').append("<li><a href='#'>" + "http://person" +
      "<sapn class='count'>" + 2 + "</span></a>");//*/
  //init
  this.types.innerHTML = null;
  types = m.trimDuplicate(types).sort();

  //reset button
  $('#types').append($("<div class='grey' id='all_type'>" +
  		"<span>all</span>" +
  		"<span class='count'>" + m.types.length + "</span></div>"));

  for(var i = 0; i < types.length; i++) {
    var count = m.getSubjects(null, types[i]).length;
    if(count) {
      var type_html = this.getHightlightURL(types[i]);
      var $li =
        $("<div class='shorten'>" +
            "<span type='" + types[i]+ "'>" + type_html + "</span>" +
            "<span class='count'>" + count + "</span>" +
        "</div>");
      $('#types').append($li);
    }
  }
  
  //mouse over
  $("#types > div").mouseover(function(event){
    $(this).toggleClass("selected_type");
  });
  $("#types > div").mouseout(function(event){
    $(this).toggleClass("selected_type");
  });
  $("#types > div").click(function(event){
    if($(this).attr("id") == "all_type") {
      //reset
      v.types_title.innerText = "Types";
      v.items_title.innerText = "Items";
      v.focusSearchBox();
      v.reset();
    } else {
      type = $($(this).children()[0]).attr("type");
      v.selected_type = type;
      v.types_title.innerText = "Types: " + type;
      v.items_title.innerText = "Items";
      //update values
      var subjects = m.getSubjects(null, type);
      v.showItems(subjects);
    }
  });
};
Viewer.getTypeImg = function(type) {
  var res = null;
  if(type) {
    if(type.search(/account$/i) != -1) {
      res = "images/account.png";
    } else if(type.search(/airport$/i) != -1) {
      res = "images/airport.png";
    } else if(type.search(/article$/i) != -1) {
      res = "images/news.png";
    } else if(type.search(/book$/i) != -1) {
      res = "images/book.png";
    } else if(type.search(/building$/i) != -1
        || type.search(/buildings$/i) != -1
        || type.search(/structure$/i) != -1) {
      res = "images/building.png";
    } else if(type.search(/document$/i) != -1) {
      res = "images/document.png";
    } else if(type.search(/endorsement$/i) != -1) {
      res = "images/endorsement.png";
    } else if(type.search(/event$/i) != -1) {
      res = "images/calendar.png";
    } else if(type.search(/group$/i) != -1) {
      res = "images/group.png";
    } else if(type.search(/movie$/i) != -1
        || type.search(/video$/i) != -1) {
      res = "images/movie.png";
    } else if(type.search(/organization$/i) != -1) {
      res = "images/affiliate.png";
    } else if(type.search(/person$/i) != -1
        || type.search(/user$/i) != -1) {
      res = "images/person.png";
    } else if(type.search(/photo$/i) != -1
        || type.search(/photograph$/i) != -1) {
      res = "images/picture.png";
    } else if(type.search(/map$/i) != -1
        || type.search(/place$/i) != -1) {
      res = "images/map-marker.png";
    } else if(type.search(/product$/i) != -1) {
      res = "images/shopping.png";
    } else if(type.search(/project$/i) != -1) {
      res = "images/timeline.png";
    } else if(type.search(/train/i) != -1
        || type.search(/subway/i) != -1) {
      res = "images/train.png";
    }
    
  }
  return res;
};
Viewer.prototype.getSummaryHTML = function(subject) {
  var res = "";
  var props = m.projections[subject].getProperties().sort();
  //find image data
  var name = null, title = null;
  var type = null;
  var url = null;
  var img = null, color = null;
  var description = null;
  var address = null;
  var rating = NaN;
  var elseHTML = "";
  for(var i = 0; i < props.length; i++) {
    var v = m.projections[subject].get(props[i]);
    if(props[i].search(/^__.*__$/) != -1) {//skip application original property
      continue;
    }
    if(!v || v.search(/^_:/) != -1) {
      continue;
    }
    var prop = props[i].toLowerCase();
    if(!type && prop.search(/type$/i) != -1) {
      type = v;
    } else if(!name && prop.search(/name$/i) != -1
        //|| prop.search(/creator$/i) != -1
        //|| prop.search(/publisher$/i) != -1
        //|| prop.search(/author$/i) != -1
    ) {
      name = v;
    } else if(!title && prop.search(/title$/i) != -1) {
      title = v;
    } else if(!description && prop.search(/description$/i) != -1) {
      description = v;
    } else if(prop.search(/image$/i) != -1 || prop.search(/img$/i) != -1) {
      img = v;
    } else if(!color && prop.search(/color$/i) != -1) {
      color = v;
    } else if(prop.search(/url$/i) != -1) {
      url = !url ? v : url;
    } else if(!address && prop.search(/address$/i) != -1) {
      address = v;
    } else if(isNaN(rating) && prop.search(/ratingvalue$/i) != -1) {
      rating = m.ave(v, 1);
    } else {
      var tail = props[i].substr(props[i].lastIndexOf("/") + 1);
      tail = m.toHumanReadable(tail);
      if(m.isSiteURL(v)) {
        if(v.search(/\.jpg$/i) != -1
            || v.search(/\.gif$/i) != -1
            || v.search(/\.png$/i) != -1) {
          elseHTML += "<li>" + tail + "<br><img src='" + v + "' title='" + v + "' class='item_img'></img></li>";
        } else {
          elseHTML += "<li><img src='images/link.png' class='related_icon'><a href='" + v + "' title='" + v + "'>" + tail + "</a></li>";
        }
      } else if(v.length < 30) {
        if(Datatype.isPrice(v)) {//price
          v = "<span class='money'>" + v + "</span>"; 
        } else if(Datatype.isDate(v)) {//date
          v = "<span class='date'>" + v + "</span>"; 
        } else {
          elseHTML += "<li>" + tail + " : " + v + "</li>";
        }
      } 
    }
  }
  res += "<div>";
  {//title and anchor to the site
    var href = url ? url : subject;
    var hasSiteURL = m.isSiteURL(href);
    var favicon = m.tst.getValues(subject, Manager.PROP_FAVICON)[0];
    
    res += "<div class='shorten title'>"; {
      if(favicon) {
        res += "<img src='" + favicon + "' class='favicon'/>";
      } else {
        var imgFile = Viewer.getTypeImg(type);
        res += imgFile ? "<img src='" + imgFile + "' class='favicon'/>" : "";
      }
      if(hasSiteURL) {res += "<a class='title' href='" + href + "' title='" + href + "'>";}
      if(name) {
        res += "[" + name + (title ? ": " + title : "") + "]";
      } else {
        res += "[" + (title ? title : subject) + "]";
      }
      if(hasSiteURL) { res += "</a>"; }
    }
    
    {//trash button
      res += "<img src='images/trash.png' title='remove'" +
      "class='trash' subject='" + subject + "'/>";
    }
    res += "</div>";
  }
  
  {//img and description
    res += "<div>";
    res += description ? "<p>" + this.shortenString(description, 300) + "</p>": "";
    res += "<table><tr><td class='item_img'>";
    if(img) {
      if(img.search(/^\/\//) != -1) {
        img = "https:" + img;
      }
      res += "<img src='" + img + "' class='item_img'/>";
    } else {
      res += "<i style='color:grey;'>NO IMAGE</i>";
    }
    {//precise info
      res += "</td><td><ul>";
      res += address ? "<li>Address: " +
        "<a href='https://www.google.com/maps?q=" + address +"'>" +
        		"<img src='images/map-marker.png' class='related_type'></a> "+address+"</li>": "";
      res += !isNaN(rating) ? "<li>Rate: " + rating + this.getRatingHTML(rating) + "</li>" : "";
      res += color ? "<li>Color: <span style='background-color:"+ color + 
                     "'>&nbsp;&nbsp;</span> "+color+"</li>": "";
      res += elseHTML;
      res += "</ul></td></tr>";
    }
    res += "</table></div>";
  }
  res += "</div>";
  return res;
};
Viewer.prototype.getGraphHTML = function(subject) {
  var res = "";
  var values = m.projections[subject].getAll();
  values = m.trimDuplicate(values).sort();
  for(var i = 0; i < values.length; i++) {
    if(values[i] != subject) {//escape self reference
      var targetSub = values[i];
      if(targetSub.search(/^_:/) == -1) {
        var projection = m.projections[targetSub];
        
        if(projection) {
          var title = m.getValues(targetSub, ["title"]);
          var name = m.getValues(targetSub, ["name"]);
          var img = m.getValues(targetSub, ["image"]);
          var url = m.getValues(targetSub, ["url"]);
          var type = m.getValues(targetSub, ["type"]);
          
          res += "<a href='" + targetSub + "' title='" + targetSub + "'>";
          if(img[0]) {
            res += "<img src='" + img[0] + "' class='related_img'>";
          }
          if(type[0]) {
            var imgFile = Viewer.getTypeImg(type[0]);
            res += imgFile ? "<img src='" +  imgFile + "' class='related_type'>" : "";
          }
          res += "<span class='related_name'>" + (title.length?title[0]:(name[0]?name[0]:targetSub)) + "</span></a><br>";
        }
      }
    }
  }
  if(res.length) {
    res = "<h4><img src='images/treediagram.png' class='related_icon'>Related Items:</h4>" + res;
  }
  return res;
};
Viewer.prototype.showItems = function(subjects) {
  //init
  this.items.innerHTML = null;
  subjects = m.trimDuplicate(subjects).sort();

  for(var i = 0; i < subjects.length; i++) {
    var item_html = "<div class='frame'>";
    item_html += this.getSummaryHTML(subjects[i]);
    item_html += this.getGraphHTML(subjects[i]);
    item_html += "</div>";
    var $li = $(item_html);
    $('#items').append($li);
  }

  //events
  $("#items > div").mouseover(function(event){
    $(this).toggleClass("selected_item");
  });
  $("#items > div").mouseout(function(event){
    $(this).toggleClass("selected_item");
  });
  $("#items a").click(function(event){//click link
    var url = $($(this)).attr("href");
    var clazz = $($(this)).attr("class");
    if("title" != clazz //escape self reference
        && m.projections[url]) {
      v.showItems([url]);
    } else {
      chrome.tabs.create({
        "url": url,
        "index": v.tab.index + 1
      });
    }
  });
  $(".trash").click(function(event){//click trash
    var subject = $($(this)).attr("subject");
    m.remove(subject);
    if(v.selected_type) {
      v.showTypes(m.types);
      v.showItems(m.getSubjects(null, v.selected_type));
    } else {
      v.search();
    }
  });
};
Viewer.prototype.resetTypes = function() {
  this.showTypes(m.types);
  this.types_title.innerText = "Types";
  this.selected_type = null;
};
Viewer.prototype.resetItems = function() {
  //this.showItems(m.getSubjects());
  this.showItems(m.subjects);
  this.items_title.innerText = "Items";
};
Viewer.prototype.reset = function() {
  this.resetTypes();
  this.resetItems();
};
Viewer.prototype.show = function() {
  this.debug.innerHTML = "<div style='color:red'>RDFa<br><pre>" + JSON.stringify(m.rdfa, null, 2) + "</pre></div>";
  this.debug.innerHTML += "<div style='color:blue'>microdata<br><pre>" + JSON.stringify(m.micro, null, 2) + "</pre></div>"; 
};

var Manager = function(viewer, tab){
  this.init(viewer, tab);
};
Manager.PROP_FOUNDAt = "__FOUND_At__";
Manager.PROP_FAVICON = "__FAVICON__";
Manager.PROP_TITLE = "__TITLE__";
Manager.prototype.init =function(viewer, tab) {
  this.viewer = viewer;
  this.tab = tab;
  var bg = chrome.extension.getBackgroundPage();
  this.bg_res = bg.bg_res;
  this.rdfa = this.bg_res[tab.url] ? this.bg_res[tab.url].rdfa : null;
  this.micro = this.bg_res[tab.url] ? this.bg_res[tab.url].micro : null;
  this.tst = new Triplestore();
  this.lst = localStorage;
  
  if((this.rdfa && hasKey(this.rdfa)) ||
      (this.micro && this.micro.items.length)) {
    //this.viewer.enableButton(v.bt_save);
    //this.viewer.enableButton(v.bt_inspect);
    this.viewer.visibleInspect();
  }
};
Manager.prototype.getSubjects = function(property, value) {
  var res = [];
  for(var subject in this.projections) {
    var projection = this.projections[subject];
    
    if(!property && !value) {
      res.push(subject);
    } else if(property && !value){
      if(projection.getAll(property).length) {
        res.push(subject);
      }
    } else if(!property && value){
      if(projection.getProperties(value).length) {
        res.push(subject);
      }
    } else if(property && value){
      var values = projection.getAll(property);
      for(var i = 0; i < values.length; i++) {
        if(values[i] == value) {
          res.push(subject);
          break;
        }
      }
    }
  }
  return res;
};
Manager.prototype.getFilteredValues = function(subject, propKeywords) {
  var res = [];
  var props = m.projections[subject].getProperties();
  var type_props = m.filter(propKeywords, props, true);
  for(var i = 0; i < type_props.length; i++) {
    res = res.concat(m.projections[subject].getAll(type_props[i]));
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
  this.subjects = [];
  this.projections = {};
  this.types = [];
  
  var subs = this.tst.getSubjects();
  for(var i = 0; i < subs.length; i++) {
    var subject = subs[i];
    if(subject.search(/^_:/) == -1) {
      this.subjects.push(subject);
      var projection = this.tst.getProjection(subject);
      this.projections[subject] = projection;
      this.types = this.types.concat(this.getValues(subject, ["type"]));
    }
  }
};
Manager.prototype.filter = function(keywords, list, onlyTail) {
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
Manager.prototype.trimDuplicate = function(list) {
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
Manager.prototype.isAbsoluteURI = function(url_str) {
  return (url_str && (url_str.indexOf("://") != -1)) ? true : false;
};
Manager.prototype.isSiteURL = function(url_str) {
  return (url_str && (url_str.search(/^http:\/\//i) != -1 ||
      url_str.search(/^https:\/\//i) != -1)) ? true : false;
};
Manager.prototype.ave = function(values, floatDigit) {
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
Manager.prototype.toHumanReadable = function(str) {
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
function hasKey(o) {
  for(var k in o) { return true; }
  return false;
}
Manager.prototype.save = function() {

  //save triple only which doesn't have same value  
  function _save(subject, property, value) {
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
        _save(subject, prop, value);
      }
      _save(subject, Manager.PROP_FOUNDAt, m.tab.url);//store site url
    }
    console.log("end save RDFa");
  }
  
  if(this.micro && this.micro.items) {
    //save microdata triples
    console.log("start save microdata");
    for(var i = 0; i < this.micro.items.length; i++) {
      var item = this.micro.items[i];
      var subject = item.id ? item.id : this.tab.url;
      var type = item.type;
      var props = item.properties;
      props['__type'] = type;
      
      for(var prop in props) {
        var values = props[prop];
        for(var j = 0; j < values.length; j++) {
          var value = values[j];
          console.log(subject, prop, value);
          if(typeof(value) != "string") {
            value = JSON.stringify(value);
          }
          _save(subject, prop, value);
        }
      }
      _save(subject, Manager.PROP_FOUNDAt, m.tab.url);//store site url
    }
    console.log("end save microdata");
  }
  
  //save this site
  if(this.isSiteURL(m.tab.url)) {
    var subject = m.tab.url;
    _save(subject, Manager.PROP_TITLE, m.tab.title);
    if(!m.tst.getValues(subject, "title").length) {
      _save(subject, "title", m.tab.title);
    }
    if(m.tab.favIconUrl) {
      _save(subject, Manager.PROP_FAVICON, m.tab.favIconUrl);
    }
  }
  
  //update views
  this.renew();
  v.showTypes(this.types);
  v.showItems(this.getSubjects());

  //disable save button
  v.disableButton(v.bt_save);
};
Manager.prototype.remove = function(subject) {
  if(this.projections[subject]) {
    this.projections[subject].remove();
  }
  this.renew();
};
Manager.prototype.clear = function() {
  this.tst.remove();
  m.renew();
};
document.addEventListener('DOMContentLoaded', function () {
  chrome.tabs.query({
    "active": true,
    "windowId": chrome.windows.WINDOW_ID_CURRENT
  }, function(tabs) {
      var tab = tabs.length === 0 ? tabs : tabs[0];
      
      v = new Viewer(tab);
      m = new Manager(v, tab);
      m.renew();
      v.resetTypes();
      v.resetItems();
  });
});
var Datatype = function() {};
Datatype.isDate = function(s) {
  return s.search(/^\d*[\-\/]\d*([\-\/]\d*)?((\T\s)\d*:\d*)?/) != -1;
};
Datatype.isPrice = function(s) {
  return s.search(/^\$[0-9]*(.)[0-9]*$/) != -1;
};
