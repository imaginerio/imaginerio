// map
const getMap = (components) => {
  
  const M = {};

  let map;
  let year = 2015;
  let tileLayer;
  let baseTileLayer;
  let overlayLayer;
  let viewshedPoints;
  let selectedViewshed;
  let selectedViewshedData;
  const viewshedIcon = L.icon({
    iconUrl: 'img/viewshed.png',
    iconSize: [33, 37.25],
    iconAnchor: [16.5, 27.25],
  });
  const viewshedActiveIcon = L.icon({
    iconUrl: 'img/viewshed_active.png',
    iconSize: [33, 37.25],
    iconAnchor: [16.5, 27.25],
  });
  const viewshedStyle = {
    icon: viewshedIcon,
  };
  const viewshedConeStyle = {
    stroke: false,
    fillColor: '#1a1a1a',
    fillOpacity: 0.6,
  };
  let highlightLayerBottom;
  let highlightLayerTop;
  const highlightBottomStyle = {
    weight: 8,
    color: '#A63755',
    opacity: 0.5,
  };
  const highlightTopStyle = {
    weight: 2,
    color: '#1a1a1a',
    opacity: 1,
  };
  const highlightMarkerBottomStyle = {
    color: '#A63755',
    weight: 3,
    fill: false,
    radius: 3,
  };
  const highlightMarkerTopStyle = {
    color: '#1a1a1a',
    weight: 1,
    fill: false,
    radius: 3,
  };
  let layers = ['all']; // either 'all' or a list of DISABLED layers

  const aerialLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  });

  // -22.9046, -43.1919
  let locationMarker;
  const locationBounds = L.latLngBounds([[-23.10243406, -44.04944719 ], [-22.63003187, -42.65988214]]);

  M.initialize = (container) => {
    const { init, dispatch } = components;
    const { tileserver } = init;
    
    function showLocation(latlng) {
      if (locationMarker && map.hasLayer(locationMarker)) map.removeLayer(locationMarker);
      if (!locationBounds.contains(latlng)) {
        alert('Geolocation is only supported in Beirut.');
        map.stopLocate();
      } else {
        locationMarker = L.circleMarker(latlng, {
          radius: 7,
          color: 'white',
          fillColor: '#3358ff',
          fillOpacity: 1,
          opacity: 1,
        }).addTo(map);
        map.panTo(latlng);
      }
      $('.geolocate-control').removeClass('locating');
    }

    map = L.map(container, {
      zoomControl: false,
      maxZoom: 18,
      minZoom: 10,
      maxBounds: [[-23.10243406, -44.04944719], [-22.63003187, -42.65988214]],
    })
      .setView([-22.9046, -43.1919], 16)
      .on('click', probe)
      .on('moveend zoomend', () => {
        dispatch.call('statechange', this);
      })
      .on('locationfound', (e) => {
        showLocation(e.latlng);
      })
      .on('locationerror', (e) => {
        alert('Your location could not be found');
        $('.geolocate-control').removeClass('locating');
      });
    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    const tileUrl = `${tileserver}${year}/${layers.join(',')}/{z}/{x}/{y}.png`;
    const baseTileUrl = `${tileserver}${year}/base/{z}/{x}/{y}.png`;

    baseTileLayer = L.tileLayer(baseTileUrl).addTo(map);
    tileLayer = L.tileLayer(tileUrl).addTo(map);

    $(window).on('transitionend', () => {
      map.invalidateSize();
    });

    const LocationControl = L.Control.extend({
      options: {
        position: 'bottomleft',
      },

      onAdd(innerMap) {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control geolocate-control');
        div.innerHTML = '<a><i class="icon-direction"></i><i class="icon-spinner animate-spin"></i></a>';
        div.onclick = function onClick(e) {
          e.stopPropagation();
          innerMap.locate({ watch: true });
          $(div).addClass('locating');
        };
        return div;
      },
    });

    map.addControl(new LocationControl());

   // L.marker([29.717, -95.402]).addTo(map);

    $('.memory-icon').appendTo('#' + container);
    $('.memory-icon .cancel').click(function () {
      dispatch.call('cancelmemory', this);
    });
    $('.memory-icon .ok').click(function click() {
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
  };

  M.getMap = () => map;

  M.setYear = (newYear) => {
    console.log('setyear');
    const { init, translations } = components;
    const {
      tileserver,
      server,
    } = init;

    if (newYear === year) return;
    M.clearSelected();
    year = newYear;
    if (year === new Date().getFullYear()) {
      map.removeLayer(tileLayer);
      map.addLayer(aerialLayer);
    } else {
      tileLayer.setUrl(`${tileserver}${year}/${layers.join(',')}/{z}/{x}/{y}.png`);
      if (map.hasLayer(aerialLayer)) map.removeLayer(aerialLayer);
      if (!map.hasLayer(tileLayer)) map.addLayer(tileLayer);
    }
    M.removeHighlight();
    removeViewsheds();
    viewshedPoints = null;
    $.getJSON(`${server}visual/${year}`, (json) => {
      const { probes, dispatch } = components;
      const Dispatch = dispatch;
      const { mapProbe } = probes;
      // console.log('json', json);
      if (!json.features.length) return;
      const points = _.map(json.features, f => ({
        type: 'Feature',
        properties: _.extend(
          f.properties,
          {
            cone: L.geoJSON(
              {
                type: 'Feature',
                geometry: f.geometry,
              },
              { style() { return viewshedConeStyle; } },
            ),
          },
        ),
        geometry: { type: 'Point', coordinates: f.geometry.coordinates[0][0] },
      }));
      viewshedPoints = L.geoJSON({ type: 'FeatureCollection', features: points }, {

        pointToLayer(pt, latlng) {
          return L.marker(latlng, viewshedStyle);
        },

        onEachFeature(feature, layer) {
          layer.on('mouseover', (e) => {
            const { language } = init;
            feature.properties.cone.addTo(map);
            mapProbe(e, `<strong>${feature.properties.description}</strong><br><em>${translations.find(d => d.name === 'click-for-details')[language]}</em>`);
          }).on('mouseout', function onMouseout() {
            $('#map-probe').hide();
            if (map.hasLayer(feature.properties.cone) && selectedViewshed != this) map.removeLayer(feature.properties.cone);
          }).on('click', function onClick() {
            probes.hideHintProbe();
            Dispatch.call('viewshedclick', this, this.feature.properties.id);
          });
        },
      });
      if (M.hasViews) viewshedPoints.addTo(map);
      if (selectedViewshedData) { // was set after year change & before json load
        M.zoomToView(selectedViewshedData);
      }
    });
    return M;
  };

  M.setLayers = function setLayers(list) {
    const { init } = components;
    const { tileserver } = init;
    // don't do things if layer list hasn't changed
    let skip = true;
    list.forEach((l) => {
      if (layers.indexOf(l) == -1) skip = false;
    });
    layers.forEach((l) => {
      if (list.indexOf(l) == -1) skip = false;
    });
    if (skip) return M;
    console.log('list', list);
    layers = list;
    tileLayer.setUrl(`${tileserver}${year}/${layers.join(',')}/{z}/{x}/{y}.png`);
    return M;
  };

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
  };

  M.removeHighlight = function () {
    if (highlightLayerBottom && map.hasLayer(highlightLayerBottom)) map.removeLayer(highlightLayerBottom).removeLayer(highlightLayerTop);
    return M;
  };

  M.addOverlay = function addOverlay(overlay) {
    if (overlayLayer && map.hasLayer(overlayLayer)) {
      map.removeLayer(overlayLayer);
    }
    overlayLayer = overlay.layer().addTo(map);
    if (overlay.bbox) {
      map.fitBounds(overlay.bbox);
    }

    return M;
  };

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

  M.drawFeature = (name) => {
    const { init } = components;
    const { server } = init;
    M.removeHighlight();
    $.getJSON(`${server}draw/${year}/${encodeURIComponent(name)}`, (json) => {
      M.drawLoadedFeature(json);
    });
  };

  M.drawPlanFeature = (name) => {
    const { init } = components;
    const { server } = init;
    console.log('plan path', `${server}plan/${encodeURI(name)}`);
    $.getJSON(`${server}plan/${encodeURI(name)}`, (json) => {
      const { features } = json;
      if (features.length > 0) {
        M.drawLoadedFeature(json);
      }
    });
  };

  M.drawLoadedFeature = (geojson) => {
    highlightLayerBottom = L.geoJson(geojson, {
      style: () => highlightBottomStyle,
      pointToLayer: (pt, latlng) => L.circleMarker(latlng, highlightMarkerBottomStyle)
    }).addTo(map);
    highlightLayerTop = L.geoJson(geojson, {
      style: () => highlightTopStyle,
      pointToLayer: (pt, latlng) => L.circleMarker(latlng, highlightMarkerTopStyle),
    }).addTo(map);
    map.fitBounds(highlightLayerBottom.getBounds());
  };

  M.clearSelected = () => {
    if (selectedViewshed) {
      selectedViewshed.setIcon(viewshedIcon).setZIndexOffset(99);
      map.removeLayer(selectedViewshed.feature.properties.cone);
    }
    selectedViewshed = null;
    selectedViewshedData = null;
    M.removeHighlight();
  };

  M.zoomToView = (raster) => {
    M.clearSelected();
    selectedViewshedData = raster;
    viewshedPoints.eachLayer((l) => {
      if (l.feature.properties.id == raster.id) {
        map.setView(l.getLatLng());
        selectedViewshed = l;
        l.setIcon(viewshedActiveIcon).setZIndexOffset(100);
        l.feature.properties.cone.addTo(map);
      }
    });
  };

  M.getView = () => {
    return [map.getCenter(), map.getZoom()];
  };

  M.setView = (center, zoom) => {
    map.setView(center, zoom);
    return M;
  };

  M.getBounds = () => {
    return map.getBounds();
  };

  M.hasViews = true;

  M.showViews = () => {
    addViewsheds();
    M.hasViews = true;
  };

  M.hideViews = () => {
    removeViewsheds();
    M.hasViews = false;
  };

  function removeViewsheds() {
    if (viewshedPoints && map.hasLayer(viewshedPoints)) map.removeLayer(viewshedPoints);
  }

  function addViewsheds() {
    if (viewshedPoints && !map.hasLayer(viewshedPoints)) map.addLayer(viewshedPoints);
  }

  function probe(e) {
    const { init, dispatch, probes } = components;
    const { server } = init;

    if ($('main').hasClass('searching-area')) return;
    probes.hideHintProbe();
    const zoom = map.getZoom();
    let probeZoom;
    switch (zoom) {
      case 15:
        probeZoom = 0.5;
        break;
      case 16:
        probeZoom = 0.35;
        break;
      case 17:
        probeZoom = 0.2;
        break;
      case 18:
        probeZoom = 0.1;
        break;
      default:
        probeZoom = 0.6;
        break;
    }
    const off = layers[0] === 'all' ? '' : layers.join(',');
    const probeUrl = `${server}probe/${year}/${probeZoom}/${e.latlng.lng},${e.latlng.lat}/${off}`;
    $.getJSON(probeUrl, function probeJSON(json) {
      dispatch.call('showresults', this, _.indexBy(json, 'name'), true);
    });
  }

  return M;
};
export default getMap;
