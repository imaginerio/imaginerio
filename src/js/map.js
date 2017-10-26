// map
let Map = (function($, dispatch) {
  
  let M = {};

  let map;
  let year = 2015;
  let tileLayer;
  let overlayLayer;
  let viewshedPoints;
  let viewshedIcon = L.icon({
    iconUrl: 'img/viewshed.png',
    iconSize: [33, 37.25],
    iconAnchor: [16.5, 27.25]
  });
  let viewshedStyle = {
    icon: viewshedIcon
  };
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
    $.getJSON(server + 'visual/' + year, function(json) {
      if (!json.features.length) return;
      let points = _.map(json.features, function (f) {
        return {type:'Feature', 
          properties: _.extend(
            f.properties, 
            {
              cone: L.geoJSON({type:'Feature', geometry: f.geometry.geometries[1]}, {
                style: function () { return highlightBottomStyle; }
              })
            }
          ),
          geometry: {type: 'Point', coordinates: f.geometry.geometries[1].coordinates[0][0]}}
      });
      removeViewsheds();
      viewshedPoints = L.geoJSON({type:'FeatureCollection', features: points}, {
        pointToLayer: function (pt, latlng) {
          return L.marker(latlng, viewshedStyle);
        },

        onEachFeature: function(feature, layer) {
          layer.on('mouseover', function () {
            feature.properties.cone.addTo(map);
          }).on('mouseout', function () {
            if (map.hasLayer(feature.properties.cone)) map.removeLayer(feature.properties.cone);
          }).on('click', function () {
            Dispatch.call('viewshedclick', this, this.feature.properties.id)
          })
        }
      }).addTo(map);
    })
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

  function removeViewsheds () {
    if (viewshedPoints && map.hasLayer(viewshedPoints)) map.removeLayer(viewshedPoints);
  }

  return M;
})(jQuery, Dispatch);