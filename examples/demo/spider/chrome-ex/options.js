/* $Id$ */

function Options() {}

// Saves options to localStorage.
var el_autostore_setting = null;
var el_autostore_on = null;
var el_autostore_off = null;
var el_autostore_time = null;
var el_autostore_visit = null;
var el_autostore_remove = null;
var bt_login_facebook = null;

Options.DEFAULT_STORE = true;
Options.DEFAULT_TIME = 5;
Options.DEFAULT_VISIT = 5;
Options.DEFAULT_REMOVE = false;

Options.show_status = function(id, msg) {
  var status = document.getElementById(id);
  status.innerHTML = msg;
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
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
Options.logoutFacebook = function() {
  localStorage.removeItem("__FB_ACCESS_TOKEN");
  localStorage.removeItem("__FB_EXPIRES");
  bt_login_facebook.innerText = "Log In";
  Options.show_status("login_status", "Logged out");
}
Options.clear_storage = function() {
  localStorage.clear();
  Options.save_options();
  Options.logoutFacebook();
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
Options.saveFacebookGraph = function(access_token) {
  function saveMe(obj) {
    var subject = Manager.FB_BASE_URL + obj.username;
    var bg = chrome.extension.getBackgroundPage();
    m = bg.bg_res.m;
    
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
          m.tst.add(subject, "language", lang.name);
        }
      }
    }
    if(obj.work)       {
      for(var i = 0; i < obj.work.length; i++) {
        var employer = obj.work[i].employer;
        if(employer && employer.name) {
          m.tst.add(subject, "work", employer.name);
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
      m.tst.add(me, "foaf:knows", friend_subject);
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
  
  //Callback from OAuth Proxy
  if(window.location.search.length) {
    var queries = window.location.search.substr(1).split('&');
    for(var i = 0; i < queries.length; i++) {
      var nv = queries[i].split('=');
      var name = nv[0];
      var value = nv[1];
      if(name == "access_token") { fb_access_token = value; }
      else if(name == "expires") { fb_expires = value; }
    }
    if(fb_access_token) {
      localStorage["__FB_ACCESS_TOKEN"] = fb_access_token;
      Options.show_status("login_status", "Logged In !");
      //Get the Graph Information
      Options.saveFacebookGraph(fb_access_token);
    }
    if(fb_expires) { localStorage["__FB_EXPIRES"] = fb_expires; }

  }
  //update button status
  if(fb_access_token) {
    bt_login_facebook.innerText = "Log Out";
  }
}
Options.getFacebookAccessToken = function() {
  return localStorage["__FB_ACCESS_TOKEN"];
}
function init() {
  el_autostore_setting = document.getElementById("autostore_setting");
  el_autostore_on = document.getElementById("autostore_on");
  el_autostore_off = document.getElementById("autostore_off");
  el_autostore_time = document.getElementById("autostore_time");
  el_autostore_visit = document.getElementById("autostore_visit");
  el_autostore_remove = document.getElementById("autostore_remove");
  bt_login_facebook = document.getElementById("login_facebook");
  
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
    Options.restore_options();
    
    //SNS
    Options.loginSNS();
  }
} 

document.addEventListener('DOMContentLoaded', init);
