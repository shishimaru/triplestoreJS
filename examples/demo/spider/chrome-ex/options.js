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
Options.clear_storage = function() {
  localStorage.clear();
  Options.save_options();
}
Options.loginFacebook = function() {
  if(bt_login_facebook.innerText == "Log In") {
    var fb_login_url = "https://hu-study.appspot.com/c/fb-login";
    window.open(fb_login_url);
    window.close();
    
  } else { //Log Out
    localStorage.removeItem("__FB_ACCESS_TOKEN");
    localStorage.removeItem("__FB_EXPIRES");
    bt_login_facebook.innerText = "Log In";
    Options.show_status("login_status", "Logged out");
  }
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
      }
      if(fb_expires)      { localStorage["__FB_EXPIRES"] = fb_expires; }
    }
    //update button status
    if(fb_access_token) {
      bt_login_facebook.innerText = "Log Out";
    }
  }
} 

document.addEventListener('DOMContentLoaded', init);
