// map
let Map = (function($, dispatch) {
  
  let M = {};

  let year = 2015;
  let tileLayer;

  M.initialize = function (container) {
    var map = L.map(container).setView([29.717, -95.402], 16);
    tileLayer = L.tileLayer(tileserver + year + '/all/{z}/{x}/{y}.png?layer=').addTo(map);
  }

  M.setYear = function (newYear) {
    if (newYear == year) return;
    year = newYear;
    tileLayer.setUrl(tileserver + year + '/all/{z}/{x}/{y}.png?layer=');
  }

  return M;
})(jQuery, Dispatch);