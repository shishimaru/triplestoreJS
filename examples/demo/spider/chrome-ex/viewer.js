/* $Id$ */
var v = null;
//console.log = function(v){};

var Viewer = function(m, tab){
  this.m = m;
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
  if(this.bt_save) {
    this.bt_save.addEventListener('click', function() {
    this.m.save();
    v.showTypes(this.m.types);
    v.showItems(this.m.getSubjects());

    //disable save button
    v.disableButton(v.bt_save);
  }.bind(this));
  }
  if(this.bt_clear) {
    this.bt_clear.addEventListener('click', function() { this.m.clear(); v.reset(); }.bind(this));
  }
  
  this.focusSearchBox();
  $('#search').bind('focus', this.search.bind(this));
  $('#search').bind('input', this.search.bind(this));
  $('.search_box > .delete_input').click(function(event){
    v.focusSearchBox();
    v.reset();
  });
  
  if((this.m.rdfa && Manager.hasKey(this.m.rdfa)) ||
      (this.m.micro && this.m.micro.items.length)) {
      this.visibleInspect();
  }
};
Viewer.prototype.focusSearchBox = function() {
  $('#search').val("");
  $('#search').focus();
};
Viewer.prototype.search = function() {
  var keyword = $('#search').val();
  {//filter types
    var types = this.m.types;
    types = Manager.filter(keyword.trim().split(" "), types);
    v.showTypes(types);
  }
  if(!(keyword.length % 3)){//filter items
    var subjects = this.m.filterSubjects(keyword.trim().split(" "));
    v.showItems(subjects);
  }
};
Viewer.shortenString = function(s, len) {
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
  var inspect = $("<button/>", {"id": "bt_inspect", "class" : "fit"})
  .append($("<img/>", {"src": "images/inspect.png", "class" : "topbar_icon", "title" : "inspect semantics"}));
  $("#bt_clear").after(inspect);
  
  inspect.click(function(event){ v.show(); });
};

Viewer.prototype.disableButton = function(buttonElement) {
  buttonElement.setAttribute('disabled', 'true');
};
Viewer.prototype.getHightlightURL = function(url_str) {
  var res = url_str;
  if(Manager.isAbsoluteURI(url_str)) {
    var head = url_str.substr(0, url_str.lastIndexOf("/") + 1);
    var tail = url_str.substr(url_str.lastIndexOf("/") + 1);
    res = "<span class='grey'>" + head + "</span>";
    res += tail;
  }
  return res;
};
Viewer.prototype.getRatingHTML = function(rating) {
  rating = rating > 5 ? 5 : rating;

  var baseURL = "http://images.bestbuy.com/BestBuy_US/images/global/misc/ratings_star_";
  var url = baseURL + Math.floor(rating) + "_" + rating * 10 % 10 + ".gif";
  return "<img src='" + url + "'>";
};
Viewer.prototype.showTypes = function(types) {
  //init
  var m = this.m;
  this.types.innerHTML = null;
  $('#types').scrollTop(0);
  types = types.sort();

  //reset button
  var $div = $("<div/>",  {"class" : "grey", "id" : "all_type"})
  .append($("<span>all</span>"))
  .append($("<span/>", {"class" : "count"}).html(this.m.getSubjects().length));
  $('#types').append($div);

  for(var i = 0; i < types.length; i++) {
    var count = this.m.getSubjects(null, types[i]).length;
    if(count) {
      var type_html = this.getHightlightURL(types[i]);
      var $div = $("<div/>", {"class" : "shorten"});
      $div.append($("<span/>", {"type" : types[i]}).html(type_html))
          .append($("<span/>", {"class" : "count"}).html(count));
      $('#types').append($div);
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
Viewer.getTypeImg = function(m, type) {
  var res = null;
  var tail = type.substr(type.lastIndexOf("/") + 1);
  
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
    } else if(tail.search(/mbox$/i) != -1 ||
        tail.search(/email$/i) != -1 ){
      res = "images/email.png";
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
        || tail.search(/place$/i) != -1
        || tail.search(/location$/i) != -1
        || tail.search(/^address$/i) != -1) {
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
  return res ? Manager.APP_URL + res : res;
};
Viewer.prototype.getSummaryHTML = function(subject, emailQuery, fb_request, gl_request) {
  function getWhitespace(s) {
    return s.replace(/./g,"&nbsp;");
  }
  
  var res = "";
  var props = this.m.projections[subject].getProperties().sort();
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
    var values = this.m.projections[subject].getAll(props[i]);
    for(var j = 0; j < values.length; j++) {
      var v = values[j];
      if(props[i].search(/^__.+__/) != -1) {//skip application original property
        continue;
      }
      if(!v || v.search(/^_:/) != -1) {
        continue;
      }
      var prop = null;
      var sepIndex = props[i].lastIndexOf("#");
      if(sepIndex != -1) {
        prop = props[i].substr(sepIndex + 1);
      } else {
        prop = props[i].substr(props[i].lastIndexOf("/") + 1);
      }
      
      
      if(prop.search(/type$/i) != -1) {
        type.push(v);
      } else if(!name && prop.search(/^name$/i) != -1
          //|| prop.search(/creator$/i) != -1
          //|| prop.search(/publisher$/i) != -1
          //|| prop.search(/author$/i) != -1
      ) {
        name = v;
      } else if(prop.search(/#?title$/i) != -1) {
        title = !title ? v : title;
      } else if(!description && prop.search(/#?description$/i) != -1) {
        description = v;
      } else if(prop.search(/#?image$/i) != -1 || prop.search(/#?img$/i) != -1) {
        img = v;
      } else if(!color && prop.search(/color$/i) != -1) {
        color = v;
      } else if(prop.search(/#?url$/i) != -1) {
        url = !url ? v : url;
      } else if(!address && (
          prop.search(/^address$/i) != -1 ||
          prop.search(/location$/i) != -1 ||
          prop.search(/^map$/i) != -1 ||
          prop.search(/place$/i) != -1)) {
        address = v;
      } else if(isNaN(rating) && prop.search(/ratingvalue$/i) != -1) {
        rating = Manager.ave(v, 1);
      } else {
        var propReadable = Manager.toHumanReadable(prop);
        var propImg = Viewer.getTypeImg(this.m, prop);
        if(Manager.isSiteURL(v)) {
          if(v.search(/\.jpg$/i) != -1
              || v.search(/\.gif$/i) != -1
              || v.search(/\.png$/i) != -1) {
            elseHTML += "<li>" + propReadable + "<br><img src='" + v + "' title='" + v + "' class='property_img'></img></li>";
          } else {
            propImg = propImg ? propImg : Manager.APP_URL + "images/link.png";
            var href = v;

            if(Manager.isFacebookProperty(prop, v)) {
              propImg = Manager.APP_URL + "images/facebook.png";
              var userid = v.substr(v.lastIndexOf('/') + 1);
              if(fb_request) {
                propImg = Manager.APP_URL + "images/facebook-br.gif";
                if(fb_request.method == "dialog/feed") {
                  fb_request.query.to = userid;
                  href = Manager.FB_DIALOG_FEED_URL + "?" + Manager.encode(fb_request.query);
                } else if(fb_request.method == "dialog/send") {
                  fb_request.query.to = userid;
                  href = Manager.FB_DIALOG_SEND_URL + "?" + Manager.encode(fb_request.query);
                }
              } else if(emailQuery){
                href = "mailto:" + userid + "@facebook.com?" + Manager.encode(emailQuery);
              }
            } else if(Manager.isGoogleProperty(prop, v)) {
              propImg = Manager.APP_URL + "images/google.png";
              var userid = v.substr(v.lastIndexOf('/') + 1);
              if(gl_request) {
                propImg = Manager.APP_URL + "images/google-br.gif";
                gl_request.query.recipients = userid;
                href = Manager.GL_POST_URL + "?" + Manager.encode(gl_request.query);
              }
            }
            if(prop == "knows") {
              var displayName = this.m.getValues(v, ["http://xmlns.com/foaf/0.1/name"]);
              propReadable = displayName.length ? propReadable + ": " + displayName[0] : propReadable;
            }
            elseHTML += "<li><img src='" + propImg + "' class='related_icon'><a href='" + href + "' title='" + href + "'>" + propReadable + "</a></li>";
          }
        } else if(v.search(/^mailto:/) != -1) {
          var href = v;
          if(emailQuery) {
            propImg = Manager.APP_URL + "images/email-br.gif";
            href += "?" + Manager.encode(emailQuery);
          }
          elseHTML += "<li>";
          if(propImg) { elseHTML += "<img src='" + propImg + "' class='related_icon'>"; }
          elseHTML += propReadable + " : " + "<a href='" + href + "' title='" + href + "'>" + v + "</a></li>";
        } else if(v.length < 30) {
          if(propImg) {
            elseHTML += "<li><img src='" + propImg + "' class='related_icon'>" + propReadable + " : " + v + "</li>";
          } else if(Datatype.isPrice(v)) {//price
            elseHTML += "<li><img src='" + Manager.APP_URL + "images/price.png' class='related_icon'>" + propReadable + " : " + v + "</li>";
          } else if(Datatype.isDate(v)) {//date
            elseHTML += "<li><img src='" + Manager.APP_URL + "images/calendar.png' class='related_icon'>" + propReadable + " : " + v + "</li>";
          } else if(Datatype.isPhone(v)) {//phone
            elseHTML += "<li><img src='" + Manager.APP_URL + "images/phone.png' class='related_icon'>" + propReadable + " : "
            + "<a href='" + v + "'>" + v + "</a></li>"; 
          } else {
            elseHTML += "<li>" + propReadable + " : " + v + "</li>";
          }
        }
      }
    }
  }
  res += "<div>";
  {//title and anchor to the site
    var href = url ? url : subject;
    var hasSiteURL = Manager.isSiteURL(href);
    var favicon = this.m.tst.getValues(subject, Manager.PROP_FAVICON)[0];
    
    res += "<div class='title'>"; {
      if(favicon) {
        res += "<img src='" + favicon + "' class='favicon'/>";
      } else if(type.length){
        var imgFile = Viewer.getTypeImg(this.m, type[0]);
        res += imgFile ? "<img src='" + imgFile + "' class='favicon'/>" : "";
      }
      if(hasSiteURL) {res += "<a class='title' href='" + href + "' title='" + href + "'>";}
      if(name) {
        res += "[" + (name + (title ? ": " + title : "")).substr(0,50) + "]";
      } else {
        res += "[" + (title ? title.substr(0, 50) : 
          Viewer.shortenString(subject, 50)) + "]";
      }
      if(hasSiteURL) { res += "</a>"; }
    }
    
    {//sync button
      var isSyncing = this.m.projections[subject].get(Manager.PROP_SYNCING);
      var icon_sync = Manager.APP_URL + (isSyncing ? "images/syncing.png" : "images/sync.png");
      res += "<img src='" + icon_sync + "' title='sync among your Chromes'" +
      " class='sync' subject='" + subject + "'/>";
    }
    {//trash button
      res += "<img src='" + Manager.APP_URL + "images/trash.png' title='remove'" +
      "class='trash' subject='" + subject + "'/>";
    }
    res += "</div>";
  }
  
  {//img and description
    res += "<div class='item-detail'>";
    res += description ? "<p>" + Viewer.shortenString(description, 300) + "</p>": "";
    res += "<table><tr><td style='vertical-align:middle; text-align:center'>";
    if(img) {
      if(img.search(/^\/\//) != -1) {
        img = "https:" + img;
      }
      res += "<img src='" + img + "' class='item_img'/>";
    } else {
      res += "<i style='color:grey; padding:10px;'>NO IMAGE</i>";
    }
    {//precise info
      res += "</td><td><ul>";
      res += address ? "<li><a href='https://www.google.com/maps?q=" + address +"'>" +
          "<img src='" + Manager.APP_URL + "images/map-marker.png' class='related_type'></a>Address : " + address + "</li>": "";
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
Viewer.getSubjectHTML = function(m, projection, className, useAnchor, emailQuery) {
  var subject = projection.getSubject();
  var title = m.getValues(subject, ["title"]);
  var name = m.getValues(subject, ["name"]);
  var img = m.getValues(subject, ["image"]);
  if(!img.length) { img =  m.getValues(subject, ["img"]); }
  var favicon = m.getValues(subject, [Manager.PROP_FAVICON]);
  var url = m.getValues(subject, ["url"]);
  var type = m.getValues(subject, ["type"]);
  var email = m.getValues(subject, ["mbox"]);
  email = email ? (emailQuery ? email + emailQuery : email) : "";
  
  var $td = $("<td/>", {"class" : className, "href" : subject});
  var $item = $("<" + (useAnchor? "a" : "span") + "/>",
      {"href" : emailQuery ? email : subject,
       "title" : subject});
  $td.append($item);
  
  {//Set item icon/favicon
    var imgFile = null;
    if(favicon) {
      imgFile = favicon;
    } else if(type[0]) {
      imgFile = Viewer.getTypeImg(m, type[0]);
    }
    if(imgFile) {
      $item.append($("<img/>", {"src" : imgFile, "class" : "related_type"}));
    }
  }
  $item.append($("<span/>", {"class": "related_name"}).html("" + (title.length?title[0]:(name[0]?name[0]:subject))));
  $item.append($("<br/>"));
  if(img[0]) {
    $item.append($("<img/>", {"src" : img[0], "class" : "related_img"}));
  }
  return $td;
}
Viewer.getSubjectsHTML = function(m, ex_subject, subjects, columNumber, className, useAnchor) {
  var table = null;
  var cells = [];
  for(var i = 0; subjects && i < subjects.length; i++) {
    if(subjects[i] != ex_subject) {//escape self reference
      var targetSub = subjects[i];
      var projection = m.projections[targetSub];
      
      if(projection) {
        var $td = Viewer.getSubjectHTML(m, projection, className, useAnchor);
        cells.push($td);
      }
    }
  }
  //add empty cell
  if(cells.length % columNumber) {
    var subjectLen = cells.length;
    for(var i = 0; i < (columNumber - subjectLen % columNumber); i++) {
      cells.push($("<td/>"));
    }
  }
  if(cells.length) {
    table = $("<table/>");
    var tr = null;
    for(var i = 0; i < cells.length; i++) {
      if(!(i % columNumber)) {
        tr = $("<tr/>");
        table.append(tr);
      }
      tr.append(cells[i]);
    }
  }
  return table;
}
Viewer.getGraphHTML = function(m, subject) {
  var div = $("<div/>");
  //items this subject refers
  var values = m.projections[subject].getAll();
  values = Manager.trimDuplicate(values).sort();
  
  var referringTable = Viewer.getSubjectsHTML(m, subject, values, 3, "refer_cell", false);
  if(referringTable) {
    referringTable.addClass("related_table");
    var icon = $("img", {"src" : Manager.APP_URL + "images/referring.png", "class" : "related_icon"});
    var section = $("<h4/>").append(icon).html("Refer to:")
    div.append(section).append(referringTable);
  }
  
  //items which refer to this subject
  var referredTable = Viewer.getSubjectsHTML(m, subject, m.referred[subject], 5, "referred_cell", false);
  if(referredTable) {
    referredTable.addClass("related_table");
    var icon = $("img", {"src" : Manager.APP_URL + "images/referred.png", "class" : "related_icon"});
    var section = $("<h4/>").append(icon).html("Referred by:");
    div.append(section).append(referredTable);
  }
  return div;
};
Viewer.getMessageHtml = function(message) {
  var res = "<div id='spider-message'>";
  res += "<div class='dialog-content'>";
  
  if(message) {
    res += message;
  }
  res += "</div></div>";
  return res;
}
Viewer.getKeywordSearchHTML = function(keywords) {
  var html = null;
  if(keywords && keywords.length) {
    //insert logo
    html = "<table>";
    for(var i = 0; i < keywords.length; i++) {
      html += "<tr><td>" + keywords[i].trim() + "</td></tr>";
    }
    html += "</table>";
  }
  return html;
}
Viewer.prototype.showItems = function(subjects) {
  //init
  var m = this.m;
  this.items.innerHTML = null;
  $('#items').scrollTop(0);

  for(var i = 0; i < subjects.length; i++) {
    var item = $("<div/>", {"class" : "frame"});
    item.append($(this.getSummaryHTML(subjects[i])));
    item.append(Viewer.getGraphHTML(this.m, subjects[i]));
    $('#items').append(item);
  }

  //events
  $("#items > div").mouseover(function(event){
    $(this).toggleClass("selected_item");
  });
  $("#items > div").mouseout(function(event){
    $(this).toggleClass("selected_item");
  });
  var m = this.m;
  $("#items a, .refer_cell, .referred_cell").click(function(event){//click link
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
  $(".sync").click(function(event){//click sync
    var subject = $($(this)).attr("subject");
    //set to sync
    if(event.target.src == Manager.APP_URL + "images/sync.png") {
      var propValue = {};
      propValue.pv = m.getObject(subject);
      propValue.t = new Date().getTime();
      
      var item = {};
      item[subject] = propValue;
      chrome.storage.sync.set(item, function() {
        event.target.src = Manager.APP_URL + "images/syncing.png";
      });
    }
    //reset not to sync
    else if(event.target.src == Manager.APP_URL + "images/syncing.png") {
      m.stopSync(subject);
      event.target.src = Manager.APP_URL + "images/sync.png";
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
  this.showTypes(this.m.types);
  this.types_title.innerText = "Types";
  this.selected_type = null;
};
Viewer.prototype.resetItems = function() {
  this.showItems(this.m.getSubjects());
  this.items_title.innerText = "Items";
};
Viewer.prototype.reset = function() {
  this.resetTypes();
  this.resetItems();
};
Viewer.prototype.show = function() {
  this.debug.innerHTML = "<div style='color:red'>RDFa<br><pre>" + JSON.stringify(this.m.rdfa, null, 2) + "</pre></div>";
  this.debug.innerHTML += "<div style='color:blue'>microdata<br><pre>" + JSON.stringify(this.m.micro, null, 2) + "</pre></div>"; 
};
Viewer.changeIcon = function(tabId, badgeText) {
  if(badgeText) {
    chrome.browserAction.setBadgeText({tabId: tabId, text: badgeText});
  } else {
    chrome.browserAction.setBadgeText({tabId: tabId, text: ""});
  }
}
