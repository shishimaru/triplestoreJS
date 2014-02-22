function frecog() {}
(function(){
  /**
   * Compute one feature with (row - mu) x eigenvector.
   * @param data
   * @returns {Array}
   */
  computeEigen = function(data) {
    var row = new Array(FACE_EIGENVECTOR.length);
    for(var i = 0; i < FACE_EIGENVECTOR.length; i++) {
      var v = 0;
      var eigen = FACE_EIGENVECTOR[i];
      for(var j = 0; j < data.length; j++) {
        v += (data[j] - FACE_MU[j]) * eigen[j];        
      }
      row[i] = v;
    }
    return row;
  }
  /**
   * Compute the distance between d1 and d2;
   * @param d1
   * @param d2
   * @returns {Number}
   */
  distance = function(d1, d2) {
    if(d1.length != d2.length) {
      throw new Error("dimension mismatch:" +
          d1.length + " vs " + d2.length);
    }
    var dist = 0;
    for(var i = 0; i < d1.length; i++) {
      dist += Math.pow(d1[i] - d2[i], 2);
    }
    dist = Math.sqrt(dist);
    return dist;
  }
  /**
   * Construct face features used for face recognition
   * with specified training face images you
   * would like to classify.
   */
  frecog.createFeatures = function(imgSet) {
    var res = new Array(imgSet.length);
    for(var i = 0; i < imgSet.length; i++) {
      var userdata = imgSet[i].userdata;
      var data = imgSet[i].data;
      var row = computeEigen(data);
      res[i] = {userdata: userdata, feature: row};
    }
    return res;
  };
  /**
   * Find out a similar face with the specified face test image.
   */
  /*frecog.search = function(features, imageData) {
    //create feature of the test data
    var f = computeEigen(imageData);
    
    var min_idx = -1;
    var min_dist = Number.MAX_VALUE;
    for(var i = 0; i < features.length; i++) {
      var d = distance(f, features[i].feature);
      if(d < min_dist) {
        min_dist = d;
        min_idx = i;
      }
    }
    return min_idx == -1 ? null:
           {userdata: features[min_idx].userdata, distance: min_dist};
  }*/
  frecog.search = function(features, imageData) {
    //create feature of the test data
    var f = computeEigen(imageData);
    
    var pre = new Array(features.length);
    for(var i = 0; i < features.length; i++) {
      var d = distance(f, features[i].feature);
      pre[i] = {userdata: features[i].userdata, distance: d};
    }
    pre.sort(function(a, b) {//sort with the distance
      return a.distance - b.distance;
    });
    return pre;
  }
})();