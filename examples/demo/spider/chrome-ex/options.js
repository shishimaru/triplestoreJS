/* $Id$ */

function Options() {}

// Saves options to localStorage.
var el_autostore_setting = null;
var el_autostore_on = null;
var el_autostore_off = null;
var el_autostore_time = null;
var el_autostore_visit = null;
var el_autostore_remove = null;
var el_status_fb = null;
var el_status_gl = null;
var bt_login_facebook = null;
var bt_login_google = null;
var m = null;

Options.DEFAULT_STORE = true;
Options.DEFAULT_TIME = 5;
Options.DEFAULT_VISIT = 5;
Options.DEFAULT_REMOVE = false;

Options.show_status = function(id, msg) {
  var status = document.getElementById(id);
  status.innerHTML = msg;
  setTimeout(function() {
    status.innerHTML = "";
  }, 1000);
}
Options.save_options = function() {
  var isAutosave = el_autostore_on.checked;
  var time = el_autostore_time.value ? el_autostore_time.value : Options.DEFAULT_TIME;
  var visit = el_autostore_visit.value ? el_autostore_visit.value : Options.DEFAULT_VISIT;
  var isAutoremove = el_autostore_remove.checked ? el_autostore_remove.checked : Options.DEFAULT_REMOVE;
  
  localStorage["__OPTIONS_AUTOSTORE_ON"] = isAutosave;
  localStorage["__OPTIONS_AUTOSTORE_TIME"] = time;
  localStorage["__OPTIONS_AUTOSTORE_VISIT"] = visit;
  localStorage["__OPTIONS_AUTOSTORE_REMOVE"] = isAutoremove; 
}
Options.reset_options = function() {
  el_autostore_on.checked = Options.DEFAULT_STORE;
  el_autostore_off.checked = !el_autostore_on.checked; 
  el_autostore_time.value = Options.DEFAULT_TIME; 
  el_autostore_visit.value = Options.DEFAULT_VISIT;
  el_autostore_remove.checked = Options.DEFAULT_REMOVE;
  
  if(Options.DEFAULT_STORE) {
    el_autostore_setting.removeAttribute("class");    
  } else {
    el_autostore_setting.setAttribute("class", "disabled");
  }
  Options.save_options();
}
Options.restore_options = function() {
  var isAutosave = localStorage["__OPTIONS_AUTOSTORE_ON"];
  var time = localStorage["__OPTIONS_AUTOSTORE_TIME"];
  var visit = localStorage["__OPTIONS_AUTOSTORE_VISIT"];
  var isAutoremove = localStorage["__OPTIONS_AUTOSTORE_REMOVE"];

  el_autostore_on.checked = isAutosave == undefined ?
      Options.DEFAULT_STORE : (isAutosave == "true" ? true : false);
  el_autostore_off.checked = !el_autostore_on.checked;
  el_autostore_time.value = time == undefined ?
      Options.DEFAULT_TIME : parseFloat(time);
  el_autostore_visit.value = visit == undefined ?
      Options.DEFAULT_VISIT : parseInt(visit);
  el_autostore_remove.checked = isAutoremove == undefined ?
      Options.DEFAULT_REMOVE : (isAutoremove == "true" ? true : false);

  //off setting field                                              
  if(el_autostore_on.checked == false) {
    el_autostore_setting.setAttribute("class", "disabled");
  }
}
Options.get_time = function() {
  var autosave = localStorage["__OPTIONS_AUTOSTORE_ON"];
  var time = localStorage["__OPTIONS_AUTOSTORE_TIME"];
  
  var res = null;
  if(Options.DEFAULT_STORE && (autosave != "false") ||
    !Options.DEFAULT_STORE && (autosave == "true")) {
    res = time == undefined ? Options.DEFAULT_TIME : parseFloat(time);
  }
  return res;
}
Options.get_visit = function() {
  var autosave = localStorage["__OPTIONS_AUTOSTORE_ON"];
  var visit = localStorage["__OPTIONS_AUTOSTORE_VISIT"];
  
  var res = null;
  if(Options.DEFAULT_STORE && (autosave != "false") ||
    !Options.DEFAULT_STORE && (autosave == "true")) {
    res = visit == undefined ? Options.DEFAULT_VISIT : parseInt(visit);
  }
  return res;
}
Options.is_remove = function() {
  var autoremove = localStorage["__OPTIONS_AUTOSTORE_REMOVE"];
  
  var res = autoremove == "true" ? true : Options.DEFAULT_REMOVE;
  return res;
}

Options.clear_storage = function() {
  localStorage.clear();
  Options.save_options();
  Options.logoutFacebook();
  Options.logoutGoogle();
  m.renew();
}
Options.loginFacebook = function() {
  if(bt_login_facebook.innerText == "Log In") {
    var fb_login_url = Manager.FB_LOGIN_URL + "?" + Manager.encode({state: Manager.DEV_MODE});
    window.open(fb_login_url);
    window.close();
  } else { //Log Out
    Options.logoutFacebook();
  }
}
Options.logoutFacebook = function() {
  //TODO : revoke access token
  localStorage.removeItem("__FB_ACCESS_TOKEN");
  localStorage.removeItem("__FB_EXPIRES");
  localStorage.removeItem("__FB_USERID");
  bt_login_facebook.innerText = "Log In";
  Options.show_status("login_status_fb", "Logged out");
}
Options.saveFacebookGraph = function(access_token) {
  function saveMe(obj) {
    var subject = Manager.FB_BASE_URL + obj.username;
    
    localStorage["__FB_USERID"] = subject;
    m.tst.set(subject, "__type", "http://xmlns.com/foaf/0.1/Person");
    m.tst.set(subject, "facebook-account", subject);
    if(obj.name)        { m.tst.set(subject, "foaf:name", obj.name); }
    if(obj.username)    { m.tst.set(subject, "facebook-username", obj.username); }
    //if(obj.first_name) { m.tst.set(subject, "foaf:firstName", obj.first_name); }
    //if(obj.last_name)  { m.tst.set(subject, "foaf:lastName", obj.last_name); }
    if(obj.gender)      { m.tst.set(subject, "foaf:gender", obj.gender); }
    if(obj.id)          { m.tst.set(subject, "facebook-id", obj.id); }
    if(obj.email)       { m.tst.set(subject, "foaf:mbox", "mailto:" + obj.email); }
    if(obj.link)        { m.tst.set(subject, "foaf:homepage", obj.link); }
    if(obj.locale)      { m.tst.set(subject, "schema:addressCountry", obj.locale); }
    if(obj.picture && obj.picture.data && obj.picture.data.url) {
      m.tst.set(subject, "foaf:img", obj.picture.data.url);
    }
    if(obj.location && obj.location.name) {
      m.tst.set(subject, "schema:addressLocality", obj.location.name);
    }
    if(obj.timezone)    { m.tst.set(subject, "timezone", String(obj.timezone)); }
    if(obj.currency && obj.currency.user_currency) {
      m.tst.set(subject, "currency", obj.currency.user_currency);
    }
    if(obj.updated_time){ m.tst.set(subject, "updated-time", obj.updated_time); }
    if(obj.languages)   {
      for(var i = 0; i < obj.languages.length; i++) {
        var lang = obj.languages[i]
        if(lang && lang.name) {
          m.add(subject, "language", lang.name);
        }
      }
    }
    if(obj.work)       {
      for(var i = 0; i < obj.work.length; i++) {
        var employer = obj.work[i].employer;
        if(employer && employer.name) {
          m.add(subject, "work", employer.name);
        }
      }
    }
    if(obj.devices)       {
      for(var i = 0; i < obj.devices.length; i++) {
        var hardware = obj.devices[i].hardware;
        var os = obj.devices[i].os;
        var device = hardware + "[" + os + "]";
        m.add(subject, "device", device);
      }
    }
    return subject;
  }
  function saveFriends(me, obj) {
    for(var i = 0; i < obj.data.length; i++) {
      var friend = obj.data[i];
      var friend_subject = Manager.FB_BASE_URL + friend.username;
      m.add(me, "foaf:knows", friend_subject);
      m.tst.set(friend_subject, "__type", "http://xmlns.com/foaf/0.1/Person");
      m.tst.set(friend_subject, "facebook-account", friend_subject);
      if(friend.name)       { m.tst.set(friend_subject, "foaf:name", friend.name); }
      //if(friend.first_name) { m.tst.set(friend_subject, "foaf:firstName", friend.first_name); }
      //if(friend.last_name)  { m.tst.set(friend_subject, "foaf:lastName", friend.last_name); }
      if(friend.id)         { m.tst.set(friend_subject, "facebook-id", friend.id); }
      if(friend.picture && friend.picture.data && friend.picture.data.url) {
        m.tst.set(friend_subject, "foaf:img", friend.picture.data.url);
      }
    }
  }
  
  //Get /me and /me/frinds
  var meURL = Manager.FB_GRAPH_URL + "me?" + Manager.encode({
    access_token: access_token,
    fields: "id,name,first_name,last_name,gender,locale,languages,link,username,age_range,\
      timezone,updated_time,bio,birthday,cover,currency,devices,education,email,\
      hometown,interested_in,location,political,picture,quotes,relationship_status,\
      religion,website,work"
  });
  var xhr = new XMLHttpRequest();
  xhr.open("GET", meURL, true); //GET /me
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      // JSON.parse does not evaluate the attacker's scripts.
      var resp = JSON.parse(xhr.responseText);
      var subject = saveMe(resp);
      el_status_fb.innerText = Options.getUserinfoFB();
      
      var friendsURL = Manager.FB_GRAPH_URL + "me/friends?";
      friendsURL += Manager.encode({
        access_token: access_token,
        fields: "name,last_name,first_name,username,picture,bio,birthday,education," +
        "hometown,interested_in,location,favorite_athletes,favorite_teams,quotes," +
        "relationship_status,religion,significant_other,website,work"
      });
      
      xhr = new XMLHttpRequest();
      xhr.open("GET", friendsURL, true); //GET /me/friends
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          // JSON.parse does not evaluate the attacker's scripts.
          var resp = JSON.parse(xhr.responseText);
          saveFriends(subject, resp);
          m.renew();
        }
      }
      xhr.send();
    }
  }
  xhr.send();
};
Options.loginGoogle = function() {
  if(bt_login_google.innerText == "Log In") {
    var gl_login_url = Manager.GL_LOGIN_URL + "?" + Manager.encode({state: Manager.DEV_MODE});
    window.open(gl_login_url);
    window.close();
  } else { //Log Out
    Options.logoutGoogle();
  }
}
Options.logoutGoogle = function() {
  //TODO : revoke access token
  localStorage.removeItem("__GL_ACCESS_TOKEN");
  localStorage.removeItem("__GL_EXPIRES");
  localStorage.removeItem("__GL_USERID");
  bt_login_google.innerText = "Log In";
  Options.show_status("login_status_gl", "Logged out");
}
Options.saveGoogleFriends = function(subject, access_token) {
  function save(me, obj) {
    for(var i = 0; i < obj.items.length; i++) {
      var friend = obj.items[i];
      var friend_subject = friend.url;
      m.add(me, "foaf:knows", friend_subject);
      if(!m.projections[friend_subject] ||
          m.projections[friend_subject].get("__etag") != friend.etag) {
        if(m.projections[friend_subject]) {
          m.projections[friend_subject].remove();
        }
        
        m.tst.set(friend_subject, "__etag", friend.etag);
        m.tst.set(friend_subject, "__type", "http://xmlns.com/foaf/0.1/Person");
        m.tst.set(friend_subject, "google-account", friend_subject);
        if(friend.displayName)       { m.tst.set(friend_subject, "foaf:name", friend.displayName); }
        //if(friend.first_name) { m.tst.set(friend_subject, "foaf:firstName", friend.first_name); }
        //if(friend.last_name)  { m.tst.set(friend_subject, "foaf:lastName", friend.last_name); }
        if(friend.id)         { m.tst.set(friend_subject, "google-id", friend.id); }
        if(friend.image && friend.image.url) {
          m.tst.set(friend_subject, "foaf:img", friend.image.url);
        }
      }
    }
  }
  
  var friendsURL = Manager.GL_PEOPLE_URL + "me/people/visible?";
  friendsURL += Manager.encode({access_token: access_token});
  
  xhr = new XMLHttpRequest();
  xhr.open("GET", friendsURL, true); //GET /me/friends
  el_status_gl.innerText = "Accessing Friend Graph...";
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      // JSON.parse does not evaluate the attacker's scripts.
      var resp = JSON.parse(xhr.responseText);
      save(subject, resp);
      Options.saveGoogleCalendar(subject, access_token);
    }
  }
  xhr.send();
}
Options.saveGoogleEvent = function(cal_id, subject, access_token) {
  function save(me, obj) {
    for(var i = 0; i < obj.items.length; i++) {
      var event = obj.items[i];
      var event_subject = event.htmlLink;
      //m.add(me, "foaf:knows", friend_subject);
      if(!m.projections[event_subject] ||
          m.projections[event_subject].get("__etag") != event.etag) {
        if(m.projections[event_subject]) {
          m.projections[event_subject].remove();
        }
        
        m.tst.set(event_subject, "__etag", event.etag);
        m.tst.set(event_subject, "__type", "http://schema.org/Event");

        if(event.summary) { m.tst.set(event_subject, "schema:name", event.summary); }
        if(event.description) { m.tst.set(event_subject, "schema:description", event.description); }
        if(event.location) { m.tst.set(event_subject, "schema:location", event.location); }
        if(event.start) {//datetime
          if(event.start.dateTime) {
            m.tst.set(event_subject, "schema:startDate", event.start.dateTime);
          }
          if(event.start.date) {
            m.tst.set(event_subject, "dc:date", event.start.date);
          }
        }
        if(event.end) {//datetime
          if(event.end.dateTime) {
            m.tst.set(event_subject, "schema:endDate", event.end.dateTime);
          }
        }
        if(event.creator) { m.tst.set(event_subject, "dc:creator", event.creator.displayName); }
      }
    }
  }
  var requestURL = Manager.GL_CAL_EVENT_URL + encodeURIComponent(cal_id) + "/events?";
  requestURL += Manager.encode(
      {key: Manager.GL_API_KEY,
        singleEvents: true,
        timeMin: Manager.toRFC3339(new Date(new Date().getTime() - 90 * 24 * 3600 * 1000)),//past
        timeMax: Manager.toRFC3339(new Date(new Date().getTime() + 90 * 24 * 3600 * 1000)) //future
      }
  );
  var xhr = new XMLHttpRequest();
  xhr.open("GET", requestURL, true);
  xhr.setRequestHeader("Authorization", "Bearer " + access_token);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var resp = JSON.parse(xhr.responseText);
      save(subject, resp);
      Options.saveGoogleAlbums(subject, access_token);
    }
  };
  xhr.send();
}
Options.saveGoogleCalendar = function(subject, access_token) {
  function getCalendarIDs(calList) {
    var idList = [];
    for(var i = 0; i < calList.items.length; i++) {
      var cal = calList.items[i];
      idList.push(cal.id);
    }
    return idList;
  }
  var requestURL = Manager.GL_CAL_LIST_URL + "?";
  requestURL += Manager.encode(
      {key: Manager.GL_API_KEY});
  
  
  xhr = new XMLHttpRequest();
  xhr.open("GET", requestURL, true);
  xhr.setRequestHeader("Authorization", "Bearer " + access_token);
  el_status_gl.innerText = "Accessing Calendar...";
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      // JSON.parse does not evaluate the attacker's scripts.
      var resp = JSON.parse(xhr.responseText);
      var ids = getCalendarIDs(resp);
      
      for(var i = 0; i < ids.length; i++) {
        Options.saveGoogleEvent(ids[i], subject, access_token);
      }
    }
  }
  xhr.send();
}
/*Options.saveGooglePhotos = function(subject, access_token) {
  function savePhotos(doc) {
    var $doc = $(doc);
    
    var entries = $doc.find("entry");
    for(var i = 0; i < entries.length; i++) {
      var $entry = $(entries[i]);
      var subject = $entry.find("link[rel='alternate']").attr("href");
      var title = $entry.find("title").text();
      var summary = $entry.find("summary").text();
      
      m.tst.set(subject, "__type", "http://schema.org/ImageObject");
      m.tst.set(subject, "schema:name", title);
      m.tst.set(subject, "schema:description", summary);
      
      var img = $entry.find("content").attr("src");
      m.tst.set(subject, "schema:image", img);
      
      var timestamp = $entry.find("gphoto\\:timestamp");
      if(timestamp.length) {
        m.tst.set(subject, "dc:date", timestamp.text());
      }
      var width = $entry.find("gphoto\\:width");
      if(width.length) {
        m.tst.set(subject, "schema:width", width.text());
      }
      var height = $entry.find("gphoto\\:height");
      if(height.length) {
        m.tst.set(subject, "schema:height", height.text());
      }
      var size = $entry.find("gphoto\\:size");
      if(size.length) {
        m.tst.set(subject, "schema:contentSize", size.text());
      }
      
      var location = $entry.find("gml\\:post");
      if(location.length) {
        m.tst.set(subject, "schema:contentLocation", location.text());
      }
    }
  }
  
  //var requestURL = Manager.GL_CAL_LIST_URL + "?";
  var requestURL = "https://picasaweb.google.com/data/feed/api/user/default?kind=photo&max-results=10&";
  requestURL += Manager.encode(
      {key: Manager.GL_API_KEY});
  
  xhr = new XMLHttpRequest();
  xhr.open("GET", requestURL, true);
  xhr.setRequestHeader("Authorization", "Bearer " + access_token);
  xhr.setRequestHeader("GData-Version", "2");
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var resp = xhr.responseText;
      savePhotos(resp);
    }
  }
  xhr.send();
}*/
Options.saveGoogleAlbums = function(subject, access_token) {
  function saveAlbums(doc) {
    var $doc = $(doc);
    
    var entries = $doc.find("entry");
    for(var i = 0; i < entries.length; i++) {
      var $entry = $(entries[i]);
      var subject = $entry.find("link[rel='alternate']").attr("href");
      var title = $entry.find("title").text();
      var summary = $entry.find("summary").text();
      
      m.tst.set(subject, "__type", "http://schema.org/ImageObject");
      m.tst.set(subject, "schema:name", title);
      m.tst.set(subject, "schema:description", summary);
      
      var img = $entry.find("media\\:thumbnail").attr("url");
      m.tst.set(subject, "schema:image", img);
      
      var user = $entry.find("author > name");
      if(user.length) {
        m.tst.set(subject, "schema:author", user.text());
      }
      var timestamp = $entry.find("gphoto\\:timestamp");
      if(timestamp.length) {
        m.tst.set(subject, "dc:date", new Date(parseInt(timestamp.text())).toLocaleDateString());
      }
      var number = $entry.find("gphoto\\:numphotos");
      if(number.length) {
        m.tst.set(subject, "schema:number", number.text());
      }
      var size = $entry.find("gphoto\\:bytesUsed");
      if(size.length) {
        var value = parseInt(size.text()) / Math.pow(10, 6);//MB
        value = Math.round(value * 100) / 100;
        m.tst.set(subject, "schema:contentSize", new String(value) + " MB");
      }
      var location = $entry.find("gphoto\\:location");
      if(location.length) {
        m.tst.set(subject, "schema:contentLocation", location.text());
      }
      var keywords = $entry.find("media\\:keywords");
      if(keywords.length) {
        m.tst.set(subject, "schema:keywords", keywords.text());
      }
    }
  }
  
  var requestURL = Manager.GL_PHOTO_ALBUM_URL;
  xhr = new XMLHttpRequest();
  xhr.open("GET", requestURL, true);
  xhr.setRequestHeader("Authorization", "Bearer " + access_token);
  xhr.setRequestHeader("GData-Version", "2");
  el_status_gl.innerText = "Accessing Photo Albums...";
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var resp = xhr.responseText;
      saveAlbums(resp);
      m.renew();
      el_status_gl.innerText = Options.getUserinfoGL();
    }
  }
  xhr.send();
}
Options.saveGoogleGraph = function(access_token) {
  function saveMe(obj) {
    var subject = Manager.GL_BASE_URL + obj.id;
    
    localStorage["__GL_USERID"] = subject;
    m.tst.set(subject, "__type", "http://xmlns.com/foaf/0.1/Person");
    m.tst.set(subject, "google-account", subject);
    
    if(obj.displayName)        { m.tst.set(subject, "foaf:name", obj.displayName); }
    //if(obj.first_name) { m.tst.set(subject, "foaf:firstName", obj.first_name); }
    //if(obj.last_name)  { m.tst.set(subject, "foaf:lastName", obj.last_name); }
    if(obj.image && obj.image.url) {
      m.tst.set(subject, "foaf:img", obj.image.url);
    }
    if(obj.gender)      { m.tst.set(subject, "foaf:gender", obj.gender); }
    if(obj.id)          { m.tst.set(subject, "google-id", obj.id); }
    //if(obj.email)       { m.tst.set(subject, "foaf:mbox", "mailto:" + obj.email); }
    //if(obj.link)        { m.tst.set(subject, "foaf:homepage", obj.link); }
    if(obj.placeLived && obj.placeLived.length)    {
      m.tst.set(subject, "schema:addressLocality", obj.locale.name);
    }
    //if(obj.timezone)    { m.tst.set(subject, "timezone", obj.locale.name); }
    //if(obj.updated_time){ m.tst.set(subject, "updated-time", obj.updated_time); }
    if(obj.language)   {
      m.tst.set(subject, "language", obj.language);
    }
    if(obj.organizations)       {
      for(var i = 0; i < obj.organizations.length; i++) {
        var org = obj.organizations[i];
        if(org && org.name) {
          var name = org.name;
          if(org.title) {
            name += "[" + org.title + "]";
          }
          m.add(subject, "organization", name);
        }
      }
    }
    return subject;
  }
  
  //Get /me and /me/frinds
  var meURL = Manager.GL_PEOPLE_URL + "me?" + Manager.encode({access_token: access_token});
  var xhr = new XMLHttpRequest();
  xhr.open("GET", meURL, true); //GET /me
  el_status_gl.innerText = "Accessing Personal Profile...";
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if(xhr.status >= 400) {
        Options.removeGlSession();
        Options.logoutGoogle();
      } else {
        // JSON.parse does not evaluate the attacker's scripts.
        var resp = JSON.parse(xhr.responseText);
        var subject = saveMe(resp);
        
        Options.saveGoogleFriends(subject, access_token);
      }
    }
  }
  xhr.send();
};
Options.loginSNS = function() {
  var fb_access_token = localStorage["__FB_ACCESS_TOKEN"];
  var fb_expires      = localStorage["__FB_EXPIRES"];
  var fb_userid       = localStorage["__FB_USERID"];
  var gl_access_token = localStorage["__GL_ACCESS_TOKEN"];
  var gl_expires      = localStorage["__GL_EXPIRES"];
  var gl_userid       = localStorage["__GL_USERID"];
  fb_expires = fb_expires ? parseInt(fb_expires) : null;
  gl_expires = gl_expires ? parseInt(gl_expires) : null;
  
  //check token expiraton of Facebook
  if(fb_expires && new Date(fb_expires) < new Date()) {
    fb_access_token = null;
    fb_expires = null;
    fb_userid = null;
    Options.logoutFacebook();
  }
  //check token expiraton of Google
  if(gl_expires && new Date(gl_expires) < new Date()) {
    gl_access_token = null;
    gl_expires = null;
    gl_userid = null;
    Options.logoutGoogle();
  }
  
  //Callback from OAuth Proxy
  if(window.location.search.length) {
    var queries = window.location.search.substr(1).split('&');
    var access_token = null, expires = null, token_for = null;
    for(var i = 0; i < queries.length; i++) {
      var nv = queries[i].split('=');
      var name = nv[0];
      var value = nv[1];
      if(name == "access_token")   { access_token = value; }
      else if(name == "expires" || name == "expires_in") {
        expires = value;
      }
      else if(name == "token_for") { token_for = value; }
    }
    if(token_for == "facebook") {
      fb_access_token = access_token;
      fb_expires = new Date().getTime() + expires * 1000;
      localStorage["__FB_ACCESS_TOKEN"] = fb_access_token;
      localStorage["__FB_EXPIRES"] = fb_expires;

      //Get the Graph Information
      Options.saveFacebookGraph(fb_access_token);
    } else if(token_for == "google") {
      gl_access_token = access_token;
      gl_expires = new Date().getTime() + expires * 1000;

      localStorage["__GL_ACCESS_TOKEN"] = gl_access_token;
      localStorage["__GL_EXPIRES"] = gl_expires;

      //Get the Graph Information
      Options.saveGoogleGraph(gl_access_token);
    }
  }
  
  //update button status
  if(fb_access_token) {
    bt_login_facebook.innerText = "Log Out";
    el_status_fb.innerText = Options.getUserinfoFB();
  }
  if(gl_access_token) {
    bt_login_google.innerText = "Log Out";
    el_status_gl.innerText = Options.getUserinfoGL();
  }
}
Options.getFacebookAccessToken = function() {
  return localStorage["__FB_ACCESS_TOKEN"];
}
Options.getGoogleAccessToken = function() {
  return localStorage["__GL_ACCESS_TOKEN"];
}
Options.getFacebookAccount = function() {
  return localStorage["__FB_USERID"];
}
Options.getGoogleAccount = function() {
  return localStorage["__GL_USERID"];
}
Options.getUserinfoFB = function() {
  var subject = localStorage["__FB_USERID"];
  return subject ? "Facebook ID: " + m.tst.getValues(subject, "foaf:name") : "";
}
Options.getUserinfoGL = function() {
  var subject = localStorage["__GL_USERID"];
  return subject ? "Google ID: " + m.tst.getValues(subject, "foaf:name") : "";
}
function init() {
  var bg = chrome.extension.getBackgroundPage();
  m = bg.bg_res.m;
  
  el_autostore_setting = document.getElementById("autostore_setting");
  el_autostore_on = document.getElementById("autostore_on");
  el_autostore_off = document.getElementById("autostore_off");
  el_autostore_time = document.getElementById("autostore_time");
  el_autostore_visit = document.getElementById("autostore_visit");
  el_autostore_remove = document.getElementById("autostore_remove");
  el_status_fb = document.getElementById("login_status_fb");
  el_status_gl = document.getElementById("login_status_gl");
  bt_login_facebook = document.getElementById("login_facebook");
  bt_login_google = document.getElementById("login_google");
  
  if(el_autostore_setting) {//works only in option setting
    document.querySelector('#autostore_save').addEventListener('click', function() {
      Options.save_options();
      Options.show_status("autostore_status", "Saved");
    });
    document.querySelector('#autostore_reset').addEventListener('click', function() {
      Options.reset_options();
      Options.show_status("autostore_status", "Reset");
    });
    document.querySelector('#autostore_off').addEventListener('click', function() {
      el_autostore_setting.setAttribute("class", "disabled");
    });
    document.querySelector('#autostore_on').addEventListener('click', function() {
      el_autostore_setting.removeAttribute("class");
    });
    document.querySelector('#storage_clear').addEventListener('click', function() {
      Options.clear_storage();
      Options.show_status("storage_status", "Cleared");
    });
    document.querySelector('#login_facebook').addEventListener('click', function() {
      Options.loginFacebook();
    });
    document.querySelector('#login_google').addEventListener('click', function() {
      Options.loginGoogle();
    });
    Options.restore_options();
    
    //SNS
    Options.loginSNS(); 
  }
} 

document.addEventListener('DOMContentLoaded', init);
