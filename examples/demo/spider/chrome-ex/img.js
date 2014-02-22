var SpyImg = function() {};
SpyImg.grayscale = function(data) {
  for(var i = 0; i < data.length; i += 4) {
    var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
    // red
    data[i] = brightness;
    // green
    data[i + 1] = brightness;
    // blue
    data[i + 2] = brightness;
  }
  return data;
}
SpyImg.resize = function(imgData, width, height) {
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext('2d');
  ctx.putImageData(imgData, 0, 0);
  ctx.drawImage(canvas, 0, 0, imgData.width, imgData.height,
      0, 0, width, height);
  newImgData = ctx.getImageData(0, 0, width, height);
  return newImgData
}