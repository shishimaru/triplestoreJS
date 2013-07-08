/* $Id$ */
var v = null;
var m = null;
document.addEventListener('DOMContentLoaded', function () {
  chrome.tabs.query({
    "active": true,
    "windowId": chrome.windows.WINDOW_ID_CURRENT
  }, function(tabs) {
      var tab = tabs.length === 0 ? tabs : tabs[0];
      
      m = new Manager(tab);
      v = new Viewer(m, tab);
      m.renew();
      v.resetTypes();
      v.resetItems();
  });
});
