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
        //console.log(request.micro);
        //sendResponse({farewell: "goodbye: " + res});
        results.micro = request.micro;
      }
      bg_res[request.url] = results;
    }
);