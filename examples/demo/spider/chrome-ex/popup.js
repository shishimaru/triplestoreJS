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
  this.selected_type = null; 

  //event listener
  this.bt_save.addEventListener('click', function() { m.save(); });
  this.bt_clear.addEventListener('click', function() { m.clear(); v.reset(); });
  
  this.focusSearchBox();
  $('#search').bind('focus', this.search);
  $('#search').bind('input', this.search);
  $('.search_box > .delete_input').click(function(event){
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
  //init
  this.types.innerHTML = null;
  $('#types').scrollTop(0);
  types = types.sort();

  //reset button
  $('#types').append($("<div class='grey' id='all_type'>" +
  		"<span>all</span>" +
  		"<span class='count'>" + m.getSubjects().length + "</span></div>"));

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
  tail = type.substr(type.lastIndexOf("/") + 1);
  
  if(tail) {
    //major web service icon
    if(tail.search(/twitter/i) != -1) {
      res = "images/twitter.png";
    } else if(tail.search(/facebook/i) != -1) {
      res = "images/facebook.png";
    } else if(tail.search(/google/i) != -1) {
      res = "images/google.png";
    } else if(tail.search(/yahoo/i) != -1) {
      res = "images/yahoo.png";
    }
    //general icon
    else if(tail.search(/account$/i) != -1
        || tail == "id") {
      res = "images/account.png";
    } else if(tail.search(/^airport$/i) != -1) {
      res = "images/airport.png";
    } else if(tail.search(/^article$/i) != -1
        || tail.search(/^blog$/i) != -1
        || tail.search(/^catalog$/i) != -1
        || tail.search(/^recipe$/i) != -1
        || tail.search(/^page$/i) != -1) {
      res = "images/news.png";
    } else if(tail.search(/^address$/i) != -1) {
      res = "images/map-marker.png";
    } else if(tail.search(/^book$/i) != -1) {
      res = "images/book.png";
    } else if(tail.search(/^building$/i) != -1
        || tail.search(/^buildings$/i) != -1
        || tail.search(/^structure$/i) != -1) {
      res = "images/building.png";
    } else if(tail.search(/^copyright$/i) != -1
        || tail.search(/license$/i) != -1) {
      res = "images/copyright.png";
    } else if(tail.search(/^document$/i) != -1
        || tail.search(/text$/i) != -1) {
      res = "images/document.png";
    } else if(tail.search(/^endorsement$/i) != -1) {
      res = "images/endorsement.png";
    } else if(tail.search(/^event$/i) != -1) {
      res = "images/calendar.png";
    } else if(tail.search(/^group$/i) != -1
        || tail.search(/^organization$/i) != -1
        || tail.search(/^corporation$/i) != -1
        || tail.search(/^team$/i) != -1
        || tail.search(/^business$/i) != -1) {
      res = "images/group.png";
    } else if(tail.search(/^language$/i) != -1) {
      res = "images/language.png";
    } else if(tail.search(/^movie$/i) != -1
        || tail.search(/^video$/i) != -1
        || tail.search(/^movingimage$/i) != -1) {
      res = "images/movie.png";
    } else if(tail.search(/^person$/i) != -1
        || tail.search(/^user$/i) != -1
        || tail.search(/^agent$/i) != -1
        || tail.search(/^contributor$/i) != -1
        || tail.search(/^author$/i) != -1
        || tail.search(/^creator$/i) != -1
        || tail.search(/^publisher$/i) != -1
        || tail.search(/^rightsholder$/i) != -1) {
      res = "images/person.png";
    } else if(tail.search(/^image$/i) != -1
        || tail.search(/^photo$/i) != -1
        || tail.search(/^photograph$/i) != -1) {
      res = "images/picture.png";
    } else if(tail.search(/^map$/i) != -1
        || tail.search(/^place$/i) != -1
        || tail.search(/^location$/i) != -1) {
      res = "images/map-marker.png";
    } else if(tail.search(/^phone$/i) != -1) {
      res = "images/phone.png";
    } else if(tail.search(/^product$/i) != -1) {
      res = "images/shopping.png";
    } else if(tail.search(/^project$/i) != -1) {
      res = "images/timeline.png";
    } else if(tail.search(/^train$/i) != -1
        || tail.search(/subway$/i) != -1) {
      res = "images/train.png";
    } else if(tail.search(/worst/i) != -1) {
      res = "images/skull.png";
    }
  }
  return res;
};
Viewer.prototype.getSummaryHTML = function(subject) {
  function getWhitespace(s) {
    return s.replace(/./g,"&nbsp;");
  }
  
  var res = "";
  var props = m.projections[subject].getProperties().sort();
  //find image data
  var name = null, title = null;
  var type = [];
  var url = null;
  var img = null, color = null;
  var description = null;
  var address = null, phone = null;
  var rating = NaN;
  var elseHTML = "";
  for(var i = 0; i < props.length; i++) {
    var values = m.projections[subject].getAll(props[i]);
    for(var j = 0; j < values.length; j++) {
      var v = values[j];
      //console.log(props[i] + " : " + v);
      if(props[i].search(/^__.+__/) != -1) {//skip application original property
        continue;
      }
      if(!v || v.search(/^_:/) != -1) {
        continue;
      }
      //var prop = props[i].toLowerCase();
      var prop = props[i].substr(props[i].lastIndexOf("/") + 1);
      
      if(prop.search(/type$/i) != -1) {
        type.push(v);
      } else if(!name && prop.search(/#?name$/i) != -1
          //|| prop.search(/creator$/i) != -1
          //|| prop.search(/publisher$/i) != -1
          //|| prop.search(/author$/i) != -1
      ) {
        name = v;
      } else if(prop.search(/#?title$/i) != -1) {
        title = !title ? v : title;
      } else if(!description && prop.search(/#?description$/i) != -1) {
        description = v;
      } else if(prop.search(/#?image$/i) != -1 || prop.search(/^img$/i) != -1) {
        img = v;
      } else if(!color && prop.search(/color$/i) != -1) {
        color = v;
      } else if(prop.search(/#?url$/i) != -1) {
        url = !url ? v : url;
      } else if(!address && prop.search(/^address$/i) != -1) {
        address = v;
      } else if(isNaN(rating) && prop.search(/ratingvalue$/i) != -1) {
        rating = m.ave(v, 1);
      } else {
        var tmpTail = props[i].substr(props[i].lastIndexOf("/") + 1);
        tail = m.toHumanReadable(tmpTail);
        var propImg = Viewer.getTypeImg(props[i]);
        if(m.isSiteURL(v)) {
          if(v.search(/\.jpg$/i) != -1
              || v.search(/\.gif$/i) != -1
              || v.search(/\.png$/i) != -1) {
            elseHTML += "<li>" + tail + "<br><img src='" + v + "' title='" + v + "' class='property_img'></img></li>";
          } else {
            propImg = propImg ? propImg : "images/link.png";
            elseHTML += "<li><img src='" + propImg + "' class='related_icon'><a href='" + v + "' title='" + v + "'>" + tail + "</a></li>";
          }
        } else if(v.length < 30) {
          if(propImg) {
            elseHTML += "<li><img src='" + propImg + "' class='related_icon'>" + tail + " : " + v + "</li>";
          } else if(Datatype.isPrice(v)) {//price
            elseHTML += "<li><img src='images/price.png' class='related_icon'>" + tail + " : " + v + "</li>";
          } else if(Datatype.isDate(v)) {//date
            elseHTML += "<li><img src='images/calendar.png' class='related_icon'>" + tail + " : " + v + "</li>";
          } else if(Datatype.isPhone(v)) {//phone
            elseHTML += "<li><img src='images/phone.png' class='related_icon'>" + tail + " : "
            + "<a href='" + v + "'>" + v + "</a></li>"; 
          } else {
            elseHTML += "<li>" + tail + " : " + v + "</li>";
          }
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
      } else if(type.length){
        var imgFile = Viewer.getTypeImg(type[0]);
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
  function _getGraphHTML(values) {
    var res = "";
    
    var cells = [];
    for(var i = 0; values && i < values.length; i++) {
      if(values[i] != subject) {//escape self reference
        var targetSub = values[i];
        var projection = m.projections[targetSub];
        
        if(projection) {
          var title = m.getValues(targetSub, ["title"]);
          var name = m.getValues(targetSub, ["name"]);
          var img = m.getValues(targetSub, ["image"]);
          var url = m.getValues(targetSub, ["url"]);
          var type = m.getValues(targetSub, ["type"]);
          
          var frag = "";
          if(type[0]) {
            var imgFile = Viewer.getTypeImg(type[0]);
            frag += imgFile ? "<img src='" +  imgFile + "' class='related_type'>" : "";
          }
          frag += "<span class='related_name'>" + (title.length?title[0]:(name[0]?name[0]:targetSub)) + "</span><br>";
          if(img[0]) {
            frag += "<img src='" + img[0] + "' class='related_img'>";
          }
          frag = "<td  class='related_cell' href='" + targetSub
          + "' title='" + targetSub + "'>" + frag + "</td>";
          cells.push(frag);
        }
      }
    }
    if(cells.length) {
      for(var i = 0; i < cells.length; i++) {
        if(!(i % 3)) {
          res += "<tr>" + cells[i];
        } else if(i % 3 == 2) {
          res += cells[i] + "</tr>";
        } else {
          res += cells[i];
        }
      }
      if(cells.length % 3 != 2) {
        res += "</tr>";
      }
    }
    return res;
  }
  
  var res = "";
  //items this subject refers
  var values = m.projections[subject].getAll();
  values = m.trimDuplicate(values).sort();
  var referringHTML = _getGraphHTML(values);
  if(referringHTML.length) {
    res += "<h4><img src='images/referring.png' class='related_icon'>Referring to:</h4>"
      + "<table class='related_table'>" + referringHTML + "</table>";
  }
  
  //items which refer to this subject
  var referredHTML = _getGraphHTML(m.referred[subject]);
  if(referredHTML.length) {
    res += "<h4><img src='images/referred.png' class='related_icon'>Referred by:</h4>"
      + "<table class='related_table'>" + referredHTML + "</table>";
  }
  return res;
};
Viewer.prototype.showItems = function(subjects) {
  //init
  this.items.innerHTML = null;
  $('#items').scrollTop(0);

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
  $(".related_cell").click(function(event){//click related items
    var url = $($(this)).attr("href");
    if(m.projections[url]) {
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
  this.showItems(m.getSubjects());
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
  this.types = this.trimDuplicate(this.types);
  /*this.types.sort(function(a,b) {
    var codeA = a[a.lastIndexOf("/") + 1].toLowerCase().charCodeAt(0);
    var codeB = b[b.lastIndexOf("/") + 1].toLowerCase().charCodeAt(0);
    return codeB - codeA;
  });*/
  
  //init referred map
  this.referred = this.getReferredMap(this.projections);
  
  //calculate rating for each item
  var rating = this.calcRating(this.projections, this.referred);
  
  //sort with reference count
  this.projections = this.sortProjections(this.projections, rating);
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
Manager.prototype.calcRating = function(projections, referredMap) {
  var rating = {};
  for(var subject in referredMap) {
    rating[subject] = referredMap[subject].length;
  }
  return rating;
};
Manager.prototype.sortProjections = function(projections, rating) {
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
          if(typeof(value) == "object") {
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
  return s.trim().search(/\d+[\-\/]\d+([\-\/]\d+)?((\T\s)\d+:\d+)?/) != -1;
};
Datatype.isPrice = function(s) {
  return s.trim().search(/^\$[0-9,]*.?[0-9]*$/) != -1;
};
Datatype.isPhone = function(s) {
  return s.trim().search(/^tel:\+\d+/) != -1;
}