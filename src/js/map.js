// map
let Map = (function() {
  
  let M = {};

  M.initialize = function (container) {
    // init stuff
    // draw to container
    var map = L.map('map').setView([29.717, -95.402], 16);
    L.tileLayer(tileserver + '2015/all/{z}/{x}/{y}.png?layer=').addTo(map);
  }

  return M;
})();