/* $Id$ */

function Options() {}

// Saves options to localStorage.
var el_autostore_setting = null;
var el_autostore_on = null;
var el_autostore_off = null;
var el_autostore_time = null;
var el_autostore_visit = null;
var el_autostore_remove = null;
Options.DEFAULT_STORE = true;
Options.DEFAULT_TIME = 1;
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
  el_autostore_time.value = Options.DEFAULT_TIME; 
  el_autostore_visit.value = Options.DEFAULT_VISIT;
  el_autostore_remove.checked = Options.DEFAULT_REMOVE;
  el_autostore_setting.removeAttribute("class");
  Options.save_options();
}
Options.get_time = function() {
  var autosave = localStorage["__OPTIONS_AUTOSTORE_ON"];
  var time = localStorage["__OPTIONS_AUTOSTORE_TIME"];
  
  var res = null;
  if(autosave == undefined || autosave == "true") {
    res = time == undefined ? Options.DEFAULT_TIME : parseFloat(time);
  }
  return res;
}
Options.get_visit = function() {
  var autosave = localStorage["__OPTIONS_AUTOSTORE_ON"];
  var visit = localStorage["__OPTIONS_AUTOSTORE_VISIT"];
  
  var res = null;
  if(autosave == undefined || autosave == "true") {
    res = visit == undefined ? Options.DEFAULT_VISIT : parseInt(visit);
  }
  return res;
}
Options.is_remove = function() {
  var autoremove = localStorage["__OPTIONS_AUTOSTORE_REMOVE"];
  
  var res = autoremove == "true" ? true : Options.DEFAULT_REMOVE;
  return res;
}
Options.restore_options = function() {
  var isAutosave = localStorage["__OPTIONS_AUTOSTORE_ON"];
  var time = localStorage["__OPTIONS_AUTOSTORE_TIME"];
  var visit = localStorage["__OPTIONS_AUTOSTORE_VISIT"];
  var isAutoremove = localStorage["__OPTIONS_AUTOSTORE_REMOVE"];
  
  el_autostore_on.checked = isAutosave == undefined ? el_autostore_on.checked : 
    (isAutosave == "true" ? true : false);
  el_autostore_off.checked = !el_autostore_on.checked; 
  el_autostore_time.value = time == undefined ? el_autostore_time.value : parseFloat(time);
  el_autostore_visit.value = visit == undefined ? el_autostore_visit.value : parseInt(visit);
  el_autostore_remove.checked = isAutoremove == undefined ? Options.DEFAULT_REMOVE : 
    (isAutoremove == "true" ? true : false);
  
  //off setting field
  if(el_autostore_on.checked == false) {
    el_autostore_setting.setAttribute("class", "disabled");
  }
}
Options.clear_storage = function() {
  localStorage.clear();
  Options.save_options();
}
function init() {
  el_autostore_setting = document.getElementById("autostore_setting");
  el_autostore_on = document.getElementById("autostore_on");
  el_autostore_off = document.getElementById("autostore_off");
  el_autostore_time = document.getElementById("autostore_time");
  el_autostore_visit = document.getElementById("autostore_visit");
  el_autostore_remove = document.getElementById("autostore_remove");
  
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
    
    Options.restore_options();
  }
} 

document.addEventListener('DOMContentLoaded', init);
