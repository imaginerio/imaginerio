import { SSL_OP_CRYPTOPRO_TLSEXT_BUG } from 'constants';

// map
const getMap = (components) => {
  
  const M = {};

  let map;
  let year = 2015;
  let tileLayer;
  let overlayLayer;
  let viewshedPoints;
  let selectedViewshed;
  let selectedViewshedData;
  const viewshedIcon = L.icon({
    iconUrl: 'img/viewshed-new.png',
    iconSize: [33, 33],
    iconAnchor: [16.5, 16.5],
  });
  const viewshedActiveIcon = L.icon({
    iconUrl: 'img/viewshed-new-active.png',
    iconSize: [33, 33],
    iconAnchor: [16.5, 16.5],
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

  let highlightBottomStyle;
  let highlightTopStyle;
  let highlightMarkerBottomStyle;
  let highlightMarkerTopStyle;

  let layers = ['all']; // either 'all' or a list of DISABLED layers

  const aerialLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  });

  // -22.9046, -43.1919
  let locationMarker;
  const locationBounds = L.latLngBounds([[-23.10243406, -44.04944719 ], [-22.63003187, -42.65988214]]);

  let tilesAreLoaded = false;
  let minTileLoadDone = false;

  const setLoadScreen = () => {
    minTileLoadDone = false;
    tilesAreLoaded = false;
    toggleLoadScreen(true);
    setTimeout(() => {
      minTileLoadDone = true;
      if (tilesAreLoaded) {
        toggleLoadScreen(false);
      }
    }, 500);
  };

  const removeLoadIfTimePassed = () => {
    tilesAreLoaded = true;
    if (minTileLoadDone) {
      toggleLoadScreen(false);
    }
  };

  M.initialize = (container) => {
    const { init, dispatch, probes } = components;
    const { tileserver, darkBlue } = init;

    setLoadScreen();
    highlightBottomStyle = {
      weight: 8,
      color: darkBlue,
      opacity: 0.5,
    };
    highlightTopStyle = {
      weight: 2,
      color: '#1a1a1a',
      opacity: 1,
    };
    highlightMarkerBottomStyle = {
      color: darkBlue,
      weight: 3,
      fill: false,
      radius: 3,
    };
    highlightMarkerTopStyle = {
      color: '#1a1a1a',
      weight: 1,
      fill: false,
      radius: 3,
    };
    
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
      minZoom: 12,
      maxBounds: [[-23.10243406, -44.0], [-22.63003187, -42.69]],
    })
      .setView([-22.9046, -43.1919], 16)
      .on('click', probe)
      // .on('movestart', () => {
      //   probes.hideMapProbe();
      // })
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

    tileLayer = L.tileLayer(tileUrl)
      .on('load', removeLoadIfTimePassed)
      .addTo(map);

    $(window).on('transitionend', () => {
      map.invalidateSize();
    });

    const LocationControl = L.Control.extend({
      options: {
        position: 'bottomleft',
      },

      onAdd(innerMap) {
        // geolocate control
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

    $('.memory-icon').appendTo('#' + container);
    $('.memory-icon .cancel').click(function () {
      dispatch.call('cancelmemory', this);
    });
    $('.memory-icon .ok').click(function click() {
      const pos = $('.memory-icon .icon').offset();
      pos.left += 13;
      pos.top += 42;
      const containerPos = $('#' + container).offset();
      pos.left -= containerPos.left;
      pos.top -= containerPos.top;
      const ll = map.containerPointToLatLng([pos.left, pos.top]);
      dispatch.call('showaddmemory', this, ll.lat, ll.lng);
    });
    return M;
  };

  M.getMap = () => map;

  M.setYear = (newYear) => {
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

  const toggleLoadScreen = (status) => {
    const loadScreen = $('.loading-screen');
    const hideScreenClass = 'loading-screen--off';
    if (status) {
      loadScreen.removeClass(hideScreenClass);
    } else {
      loadScreen.addClass(hideScreenClass);
    }
  };



  M.setLayers = function setLayers(list) {
    const { init } = components;
    const { tileserver } = init;
    // don't do things if layer list hasn't changed
    let skip = true;
    list.forEach((l) => {
      if (layers.indexOf(l) === -1) skip = false;
    });
    layers.forEach((l) => {
      if (list.indexOf(l) === -1) skip = false;
    });
    if (skip) return M;

    layers = list;

    setLoadScreen();

    tileLayer
      .off('load', removeLoadIfTimePassed);

    tileLayer
      .setUrl(`${tileserver}${year}/${layers.join(',')}/{z}/{x}/{y}.png`)
      .on('load', removeLoadIfTimePassed);
    return M;
  };

  // highlight legend features
  M.highlightFeature = function highlightFeature(geojson) {
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

  M.removeHighlight = () => {
    const { probes } = components;
    probes.hideMapProbe();

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

  // draw search feature
  M.drawFeature = (name, probeContent, zoomTo) => {
    const { init } = components;
    const { server } = init;

    M.clearSelected();
    $.getJSON(`${server}draw/${year}/${encodeURIComponent(name)}`, (json) => {
      M.drawLoadedFeature(json, probeContent, zoomTo);
    });
  };

  M.drawPlanFeature = (name) => {
    const { init } = components;
    const { server } = init;

    $.getJSON(`${server}plan/${encodeURI(name)}`, (json) => {
      const { features } = json;
      if (features.length > 0) {
        M.drawLoadedFeature(json);
      }
    });
  };

  M.drawLoadedFeature = (geojson, probeContent, zoomTo) => {
    const { probes, init } = components;
    const { mapProbe, hideMapProbe } = probes;
    const { mobile } = init;
    // console.log('geojson', geojson);

    highlightLayerBottom = L.geoJson(geojson, {
      style: () => highlightBottomStyle,
      pointToLayer: (pt, latlng) => L.circleMarker(latlng, highlightMarkerBottomStyle),
    }).addTo(map);


    // test page position, decide on coordinates to use based on this
    highlightLayerTop = L.geoJson(geojson, {
      style: () => highlightTopStyle,
      pointToLayer: (pt, latlng) => L.circleMarker(latlng, highlightMarkerTopStyle),
    }).addTo(map);

    const highlightMouseover = (e) => {
      const mapContainerPosition = $('#map').position();
      const x = e.containerPoint.x + mapContainerPosition.left;
      const y = e.containerPoint.y + mapContainerPosition.top;
      const probeCoords = { x, y };
      mapProbe(probeCoords, probeContent);
    };

    const highlightMouseout = () => {
      hideMapProbe();
    };

    highlightLayerTop.on('mouseover', highlightMouseover);
    highlightLayerTop.on('mouseout', highlightMouseout);


    const addProbe = () => {
      const bounds = L.geoJson(geojson).getBounds();
      const NEPoint = map.latLngToContainerPoint(bounds._northEast);
      const SWPoint = map.latLngToContainerPoint(bounds._southWest);

      const mapContainerPosition = $('#map').position();


      const x = ((NEPoint.x + mapContainerPosition.left) / window.innerWidth) > 0.75 ?
        ((NEPoint.x + SWPoint.x) / 2) + mapContainerPosition.left :
        NEPoint.x + mapContainerPosition.left;

      const y = ((SWPoint.y + mapContainerPosition.top) / window.innerHeight) > 0.75 ?
        ((NEPoint.y + SWPoint.y) / 2) + mapContainerPosition.top :
        SWPoint.y + mapContainerPosition.top;

      const probeCoords = { x, y };
      mapProbe(probeCoords, probeContent);
    };
    if (zoomTo) {
      map.fitBounds(highlightLayerBottom.getBounds());
    }
    // if (!mobile) {
    //   if (zoomTo) {
    //     map.fitBounds(highlightLayerBottom.getBounds());
    //   }
    // }
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

  M.getView = () => [map.getCenter(), map.getZoom()];


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


  function getPulse(pos) {
    const imgWidth = 60;

    const pulse = $('<img>')
      .attr('src', `img/pulse.gif?a=${Math.random()}`)
      .attr('class', 'pulse-animation')
      .css({
        position: 'absolute',
        left: `${pos.x - (imgWidth / 2)}px`,
        top: `${pos.y - (imgWidth / 2)}px`,
        'z-index': 10000,
      });
    return pulse;
  }

  M.getPulse = getPulse;

  function probe(e) {
    const { init, dispatch, probes } = components;
    const { server } = init;

    init.mapProbing = true;

    if ($('main').hasClass('searching-area')) return;

    const pos = e.layerPoint;
    
    getPulse(pos)
      .one('load', function removeAfterPlay() {
        setTimeout(() => {
          $(this).remove();
        }, 900);
      })
      .appendTo($('.leaflet-marker-pane'));

    probes.hideMapProbe();
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
      dispatch.call('showresults', this, _.indexBy(json, 'name'), 'click');
      init.mapProbing = false;
    });
  }

  return M;
};
export default getMap;
