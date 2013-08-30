/* $Id$ */
var v = null;
var m = null;
document.addEventListener('DOMContentLoaded', function () {
  chrome.tabs.query({
    "active": true,
    "windowId": chrome.windows.WINDOW_ID_CURRENT
  }, function(tabs) {
      var tab = tabs.length === 0 ? tabs : tabs[0];
      
      var bg = chrome.extension.getBackgroundPage();
      m = bg.bg_res.m;
      m.init(tab);
      v = new Viewer(m, tab);
      v.resetTypes();
      v.resetItems();
  });
});
