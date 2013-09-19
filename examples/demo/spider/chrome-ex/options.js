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
}
Options.loginFacebook = function() {
  if(bt_login_facebook.innerText == "Log In") {
    var fb_login_url = Manager.FB_LOGIN_URL;
    window.open(fb_login_url);
    window.close();
    
  } else { //Log Out
    Options.logoutFacebook();
  }
}
Options.logoutFacebook = function() {
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
    //if(obj.first_name) { m.tst.set(subject, "foaf:firstName", obj.first_name); }
    //if(obj.last_name)  { m.tst.set(subject, "foaf:lastName", obj.last_name); }
    if(obj.gender)      { m.tst.set(subject, "foaf:gender", obj.gender); }
    if(obj.id)          { m.tst.set(subject, "facebook-id", obj.id); }
    if(obj.email)       { m.tst.set(subject, "foaf:mbox", "mailto:" + obj.email); }
    if(obj.link)        { m.tst.set(subject, "foaf:homepage", obj.link); }
    if(obj.locale)      { m.tst.set(subject, "schema:addressCountry", obj.locale); }
    if(obj.location)    { m.tst.set(subject, "schema:addressLocality", obj.locale.name); }
    if(obj.timezone)    { m.tst.set(subject, "timezone", obj.locale.name); }
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
    return subject;
  }
  function saveFriends(me, obj) {
    for(var i = 0; i < obj.data.length; i++) {
      var friend = obj.data[i];
      console.log(friend.name);
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
  var meURL = Manager.FB_GRAPH_URL + "me?" + Manager.encode({access_token: access_token});
  var xhr = new XMLHttpRequest();
  xhr.open("GET", meURL, true); //GEt /me
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      // JSON.parse does not evaluate the attacker's scripts.
      var resp = JSON.parse(xhr.responseText);
      console.log(resp);
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
      xhr.open("GET", friendsURL, true); //GEt /me/friends
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          // JSON.parse does not evaluate the attacker's scripts.
          var resp = JSON.parse(xhr.responseText);
          console.log(resp);
          saveFriends(subject, resp);
        }
      }
      xhr.send();
    }
  }
  xhr.send();
};
Options.loginGoogle = function() {
  if(bt_login_google.innerText == "Log In") {
    var gl_login_url = Manager.GL_LOGIN_URL;
    window.open(gl_login_url);
    window.close();
    
  } else { //Log Out
    Options.logoutGoogle();
  }
}
Options.logoutGoogle = function() {
  localStorage.removeItem("__GL_ACCESS_TOKEN");
  localStorage.removeItem("__GL_EXPIRES");
  localStorage.removeItem("__GL_USERID");
  bt_login_google.innerText = "Log In";
  Options.show_status("login_status_gl", "Logged out");
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
  function saveFriends(me, obj) {
    for(var i = 0; i < obj.data.length; i++) {
      var friend = obj.data[i];
      console.log(friend.name);
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
  var meURL = Manager.GL_PEOPLE_URL + "me?" + Manager.encode({access_token: access_token});
  var xhr = new XMLHttpRequest();
  xhr.open("GET", meURL, true); //GEt /me
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      // JSON.parse does not evaluate the attacker's scripts.
      var resp = JSON.parse(xhr.responseText);
      console.log(resp);
      var subject = saveMe(resp);
      el_status_gl.innerText = Options.getUserinfoGL();
      return;
      
      var friendsURL = Manager.FB_GRAPH_URL + "me/friends?";
      friendsURL += Manager.encode({
        access_token: access_token,
        fields: "name,last_name,first_name,username,picture,bio,birthday,education," +
        "hometown,interested_in,location,favorite_athletes,favorite_teams,quotes," +
        "relationship_status,religion,significant_other,website,work"
      });
      
      xhr = new XMLHttpRequest();
      xhr.open("GET", friendsURL, true); //GEt /me/friends
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          // JSON.parse does not evaluate the attacker's scripts.
          var resp = JSON.parse(xhr.responseText);
          console.log(resp);
          saveFriends(subject, resp);
        }
      }
      xhr.send();
    }
  }
  xhr.send();
};
Options.loginSNS = function() {
  var fb_access_token = localStorage["__FB_ACCESS_TOKEN"];
  var fb_expires      = localStorage["__FB_EXPIRES"];
  var fb_userid       = localStorage["__FB_USERID"]
  var gl_access_token = localStorage["__GL_ACCESS_TOKEN"];
  var gl_expires      = localStorage["__GL_EXPIRES"];
  var gl_userid       = localStorage["__GL_USERID"]
  
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
      fb_expires = expires;
      localStorage["__FB_ACCESS_TOKEN"] = fb_access_token;
      localStorage["__FB_EXPIRES"] = fb_expires;

      //Get the Graph Information
      Options.saveFacebookGraph(fb_access_token);
    } else if(token_for == "google") {
      gl_access_token = access_token;
      gl_expires = expires;

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
