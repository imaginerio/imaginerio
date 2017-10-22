// map
let Map = (function($, dispatch) {
  
  let M = {};

  let map;
  let year = 2015;
  let tileLayer;
  let highlightLayer;

  M.initialize = function (container) {
    map = L.map(container, {zoomControl: false}).setView([29.717, -95.402], 16);
    L.control.zoom({position:'bottomleft'}).addTo(map);
    tileLayer = L.tileLayer(tileserver + year + '/all/{z}/{x}/{y}.png').addTo(map);
    return M;
  }

  M.setYear = function (newYear) {
    if (newYear == year) return;
    year = newYear;
    tileLayer.setUrl(tileserver + year + '/all/{z}/{x}/{y}.png');
    return M;
  }

  M.highlightFeature = function (geojson) {
    M.removeHighlight();
    highlightLayer = L.geoJson(geojson).addTo(map);
  }

  M.removeHighlight = function () {
    if (highlightLayer && map.hasLayer(highlightLayer)) map.removeLayer(highlightLayer);
  }

  return M;
})(jQuery, Dispatch);