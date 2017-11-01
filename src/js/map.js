// map
let Map = (function($, dispatch) {
  
  let M = {};

  let map;
  let year = 2015;
  let tileLayer;
  let overlayLayer;
  let viewshedPoints;
  let selectedViewshed;
  let selectedViewshedData;
  let viewshedIcon = L.icon({
    iconUrl: 'img/viewshed.png',
    iconSize: [33, 37.25],
    iconAnchor: [16.5, 27.25]
  });
  let viewshedActiveIcon = L.icon({
    iconUrl: 'img/viewshed_active.png',
    iconSize: [33, 37.25],
    iconAnchor: [16.5, 27.25]
  });
  let viewshedStyle = {
    icon: viewshedIcon
  };
  let viewshedConeStyle = {
    stroke: false,
    fillColor: '#1a1a1a',
    fillOpacity: .6
  }
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
    map = L.map(container, {
        zoomControl: false,
        maxZoom: 18,
        minZoom: 15
      })
      .setView([29.717, -95.402], 16)
      .on('click', probe);
    L.control.zoom({position:'bottomleft'}).addTo(map);
    tileLayer = L.tileLayer(tileserver + year + '/' + layers.join(',') + '/{z}/{x}/{y}.png').addTo(map);
    $(window).on('transitionend', function () {
      map.invalidateSize();
    });
    return M;
  }

  M.setYear = function (newYear) {
    if (newYear == year) return;
    M.clearSelected();
    year = newYear;
    tileLayer.setUrl(tileserver + year + '/' + layers.join(',') + '/{z}/{x}/{y}.png');
    M.removeHighlight();
    removeViewsheds();
    $.getJSON(server + 'visual/' + year, function(json) {
      if (!json.features.length) return;
      let points = _.map(json.features, function (f) {
        return {type:'Feature', 
          properties: _.extend(
            f.properties, 
            {
              cone: L.geoJSON({type:'Feature', geometry: f.geometry.geometries[1]}, {
                style: function () { return viewshedConeStyle; }
              })
            }
          ),
          geometry: {type: 'Point', coordinates: f.geometry.geometries[1].coordinates[0][0]}}
      });
      viewshedPoints = L.geoJSON({type:'FeatureCollection', features: points}, {
        pointToLayer: function (pt, latlng) {
          return L.marker(latlng, viewshedStyle);
        },

        onEachFeature: function(feature, layer) {
          layer.on('mouseover', function (e) {
            feature.properties.cone.addTo(map);
            mapProbe(e, '<strong>' + feature.properties.description + '</strong><br><em>Click for details</em>');
          }).on('mouseout', function () {
            $('#map-probe').hide();
            if (map.hasLayer(feature.properties.cone) && selectedViewshed != this) map.removeLayer(feature.properties.cone);
          }).on('click', function () {
            Dispatch.call('viewshedclick', this, this.feature.properties.id);
          })
        }
      }).addTo(map);
      if (selectedViewshedData) { // was set after year change & before json load
        M.zoomToView(selectedViewshedData);
      }
    });
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
    overlayLayer = overlay.layer().setOpacity(1).addTo(map);
    return M;
  }

  M.removeOverlay = function () {
    if (overlayLayer && map.hasLayer(overlayLayer)) map.removeLayer(overlayLayer);
    return M;
  }

  M.setOverlayOpacity = function (val) {
    if (overlayLayer && map.hasLayer(overlayLayer)) overlayLayer.setOpacity(val)
    return M;
  }

  M.drawFeature = function (name) {
    M.removeHighlight();
    $.getJSON(server + 'draw/' + year + '/' + encodeURIComponent(name), function (json) {
      highlightLayerBottom = L.geoJson(json, {
        style: () => highlightBottomStyle,
        pointToLayer: (pt, latlng) => L.circleMarker(latlng, highlightMarkerBottomStyle)
      }).addTo(map);
      highlightLayerTop = L.geoJson(json, {
        style: () => highlightTopStyle,
        pointToLayer: (pt, latlng) => L.circleMarker(latlng, highlightMarkerTopStyle)
      }).addTo(map);
      map.fitBounds(highlightLayerBottom.getBounds());
    });
  }

  M.clearSelected = function () {
    if (selectedViewshed) {
      selectedViewshed.setIcon(viewshedIcon).setZIndexOffset(99);
      map.removeLayer(selectedViewshed.feature.properties.cone);
    }
    selectedViewshed = null;
    selectedViewshedData = null;
  }

  M.zoomToView = function (raster) {
    M.clearSelected();
    selectedViewshedData = raster;
    viewshedPoints.eachLayer(function(l){
      if (l.feature.properties.id == raster.id) {
        map.setView(l.getLatLng());
        selectedViewshed = l;
        l.setIcon(viewshedActiveIcon).setZIndexOffset(100);
        l.feature.properties.cone.addTo(map);
      }
    });
  }

  function removeViewsheds () {
    if (viewshedPoints && map.hasLayer(viewshedPoints)) map.removeLayer(viewshedPoints);
  }

  function probe (e) {
    let zoom = map.getZoom();
    let probeZoom;
    switch ( zoom ){
      case 15:
        probeZoom = .5;
        break;
      case 16:
        probeZoom = .35;
        break;
      case 17:
        probeZoom = .2;
        break;
      case 18:
        probeZoom = .1;
        break;
      default:
        probeZoom = .6;
        break;
    }
    let off = layers[0] == 'all' ? '' : layers.join(',');
    $.getJSON(server + 'probe/' + year + '/' + probeZoom + '/' + e.latlng.lng + ',' + e.latlng.lat + '/' + off, function (json) {
      Dispatch.call('showresults', this, _.indexBy(json, 'name'));
    });
  }

  return M;
})(jQuery, Dispatch);