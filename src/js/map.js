// map
let Map = (function($, dispatch) {
  
  let M = {};

  let map;
  let year = 2015;
  let tileLayer;
  let overlayLayer;
  let highlightLayerBottom;
  let highlightLayerTop;
  let highlightBottomStyle = {
    weight: 8,
    color: '#07407B',
    opacity: .5
  };
  let highlightTopStyle = {
    weight: 2,
    color: '#1a1a1a',
    opacity: 1
  };
  let highlightMarkerBottomStyle = {
    color: '#07407B',
    weight: 3,
    fill: false,
    radius: 3
  }
  let highlightMarkerTopStyle = {
    color: '#1a1a1a',
    weight: 1,
    fill: false,
    radius: 3
  }
  let layers = ['all']; // either 'all' or a list of DISABLED layers

  M.initialize = function (container) {
    map = L.map(container, {zoomControl: false}).setView([29.717, -95.402], 16);
    L.control.zoom({position:'bottomleft'}).addTo(map);
    tileLayer = L.tileLayer(tileserver + year + '/' + layers.join(',') + '/{z}/{x}/{y}.png').addTo(map);
    $(window).on('transitionend', function () {
      map.invalidateSize();
    });
    return M;
  }

  M.setYear = function (newYear) {
    if (newYear == year) return;
    year = newYear;
    tileLayer.setUrl(tileserver + year + '/' + layers.join(',') + '/{z}/{x}/{y}.png');
    M.removeHighlight();
    return M;
  }

  M.setLayers = function (list) {
    layers = list;
    tileLayer.setUrl(tileserver + year + '/' + layers.join(',') + '/{z}/{x}/{y}.png');
    return M;
  }

  M.highlightFeature = function (geojson) {
    M.removeHighlight();
    highlightLayerBottom = L.geoJson(geojson, {
      style: () => highlightBottomStyle,
      pointToLayer: (pt, latlng) => L.circleMarker(latlng, highlightMarkerBottomStyle)
    }).addTo(map);
    highlightLayerTop = L.geoJson(geojson, {
      style: () => highlightTopStyle,
      pointToLayer: (pt, latlng) => L.circleMarker(latlng, highlightMarkerTopStyle)
    }).addTo(map);
    map.fitBounds(highlightLayerBottom.getBounds());

    return M;
  }

  M.removeHighlight = function () {
    if (highlightLayerBottom && map.hasLayer(highlightLayerBottom)) map.removeLayer(highlightLayerBottom).removeLayer(highlightLayerTop);
    return M;
  }

  M.addOverlay = function (overlay) {
    if (overlayLayer && map.hasLayer(overlayLayer)) map.removeLayer(overlayLayer);
    overlayLayer = overlay.layer().addTo(map);
    return M;
  }

  M.removeOverlay = function () {
    if (overlayLayer && map.hasLayer(overlayLayer)) map.removeLayer(overlayLayer);
    return M;
  }

  return M;
})(jQuery, Dispatch);