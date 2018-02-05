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
    color: '#A63755',
    opacity: .5
  };
  let highlightTopStyle = {
    weight: 2,
    color: '#1a1a1a',
    opacity: 1
  };
  let highlightMarkerBottomStyle = {
    color: '#A63755',
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

  let aerialLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });

  let locationMarker;
  let locationBounds = L.latLngBounds([[33.8297, 35.4142], [33.9509, 35.593]]);

  M.initialize = function (container) {
    map = L.map(container, {
        zoomControl: false,
        maxZoom: 18,
        minZoom: 14
      })
      .setView([33.9, 35.5], 16)
      .on('click', probe)
      .on('moveend zoomend', function () {
        dispatch.call('statechange', this);
      })
      .on('locationfound', function (e) {
        showLocation(e.latlng);
      })
      .on('locationerror', function (e) {
        alert('Your location could not be found');
        $('.geolocate-control').removeClass('locating');
      })
    L.control.zoom({position:'bottomleft'}).addTo(map);
    tileLayer = L.tileLayer(tileserver + year + '/' + layers.join(',') + '/{z}/{x}/{y}.png').addTo(map);
    $(window).on('transitionend', function () {
      map.invalidateSize();
    });

    function showLocation (latlng) {
      if (locationMarker && map.hasLayer(locationMarker)) map.removeLayer(locationMarker);
      if (!locationBounds.contains(latlng)) {
        alert('Geolocation is only supported in the Rice campus area.');
        map.stopLocate();
      } else {
        locationMarker = L.circleMarker(latlng, {
          radius: 7,
          color: 'white',
          fillColor: '#3358ff',
          fillOpacity: 1,
          opacity: 1
        }).addTo(map);
        map.panTo(latlng);
      }
      
      $('.geolocate-control').removeClass('locating');
    }

    let LocationControl = L.Control.extend({
      options: {
        position: 'bottomleft'
      },

      onAdd: function (map) {
        let div = L.DomUtil.create('div', 'leaflet-bar leaflet-control geolocate-control');
        div.innerHTML = '<a><i class="icon-direction"></i><i class="icon-spinner animate-spin"></i></a>';
        div.onclick = function (e) {
          e.stopPropagation();
          map.locate({watch: true});
          $(div).addClass('locating');
        }
        return div;
      }
    });

    map.addControl(new LocationControl());

   // L.marker([29.717, -95.402]).addTo(map);

    $('.memory-icon').appendTo('#' + container);
    $('.memory-icon .cancel').click(function () {
      dispatch.call('cancelmemory', this);
    });
    $('.memory-icon .ok').click(function () {
      let pos = $('.memory-icon .icon').offset();
      pos.left += 13;
      pos.top += 42;
      let containerPos = $('#' + container).offset();
      pos.left -= containerPos.left;
      pos.top -= containerPos.top;
      let ll = map.containerPointToLatLng([pos.left, pos.top]);
      dispatch.call('showaddmemory', this, ll.lat, ll.lng);
    });
    return M;
  }

  M.setYear = function (newYear) {
    if (newYear == year) return;
    M.clearSelected();
    year = newYear;
    if (year == new Date().getFullYear()) {
      map.removeLayer(tileLayer);
      map.addLayer(aerialLayer);
    } else {
      tileLayer.setUrl(tileserver + year + '/' + layers.join(',') + '/{z}/{x}/{y}.png');
      if (map.hasLayer(aerialLayer)) map.removeLayer(aerialLayer);
      if (!map.hasLayer(tileLayer)) map.addLayer(tileLayer);
    }
    M.removeHighlight();
    removeViewsheds();
    viewshedPoints = null;
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
      })
      if (M.hasViews) viewshedPoints.addTo(map);
      if (selectedViewshedData) { // was set after year change & before json load
        M.zoomToView(selectedViewshedData);
      }
    });
    return M;
  }

  M.setLayers = function (list) {
    // don't do things if layer list hasn't changed
    let skip = true;
    list.forEach(function (l) {
      if (layers.indexOf(l) == -1) skip = false;
    });
    layers.forEach(function (l) {
      if (list.indexOf(l) == -1) skip = false;
    });
    if (skip) return M;
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
    if (overlay.bbox) {
      map.fitBounds(overlay.bbox);
    }
    
    return M;
  }

  M.removeOverlay = function () {
    if (overlayLayer && map.hasLayer(overlayLayer)) {
      overlayLayer.setOpacity(.9);
      map.removeLayer(overlayLayer);
    }
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
    M.removeHighlight();
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

  M.getView = function () {
    return [map.getCenter(), map.getZoom()];
  }

  M.setView = function (center, zoom) {
    map.setView(center, zoom);
    return M;
  }

  M.getBounds = function () {
    return map.getBounds();
  }

  M.hasViews = true;

  M.showViews = function () {
    addViewsheds();
    M.hasViews = true;
  }

  M.hideViews = function () {
    removeViewsheds();
    M.hasViews = false;
  }

  function removeViewsheds () {
    if (viewshedPoints && map.hasLayer(viewshedPoints)) map.removeLayer(viewshedPoints);
  }

  function addViewsheds () {
    if (viewshedPoints && !map.hasLayer(viewshedPoints)) map.addLayer(viewshedPoints);
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
      if (_.size(json)) $('.probe-hint').hide();
      Dispatch.call('showresults', this, _.indexBy(json, 'name'), true);
    });
  }

  return M;
})(jQuery, Dispatch);