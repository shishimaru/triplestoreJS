// Class of Machine Learning algorithms 
var ML = function() {};
ML.jaccord = function(w1, w2) {
  var total_size = w1.length + w2.length;
  
  var sameNum = 0;
  var matchedId = {};
  for(var i = 0; i < w1.length; i++) {
    var find = false;
    for(var j = 0; j < w2.length; j++) {
      if(w1[i] == w2[j]) {
        matchedId[j] = null;
        find = true;
      }
    }
    if(find) {
      sameNum++;
    }
  }
  for(var id in matchedId) {
    sameNum++;
  }
  return sameNum / total_size;
}