var bg_res = {};
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      //init
      var results = {};
      if(request.rdfa) {
        console.log("bg received RDFa");
        //sendResponse({farewell: "goodbye: " + res});
        results.rdfa = request.rdfa;
      }
      if(request.micro) {
        console.log("bg received microdata");
        //sendResponse({farewell: "goodbye: " + res});
        results.micro = request.micro;
      }
      bg_res[request.url] = results;
    }
);
function onSelectionChanged(tabId) {
  chrome.tabs.executeScript(tabId, {
    file: "content.js"
  });
}

chrome.tabs.onActivated.addListener(function(activeInfo) {
  onSelectionChanged(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(function(id, changeInfo, tab) {
  onSelectionChanged(id);
});
