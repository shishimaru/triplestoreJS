// Class of Machine Learning algorithms 
var ML = function() {};
(function() {
/**
 * Compute the similarity of the inputed strings.
 */
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
ML.distance = function(d1, d2) {
  if(d1.length != d2.length) {
    throw new Error("dimension mismatch:" +
        d1.length + " vs " + d2.length);
  }
  var dist = 0;
  for(var i = 0; i < d1.length; i++) {
    //dist += Math.abs(d1[i] - d2[i]);
    dist += Math.pow(d1[i] - d2[i], 2);
  }
  dist = Math.sqrt(dist);
  return dist;
}
})();