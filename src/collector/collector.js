/* imagineRio Cone Collector */

/* -------------------------*/
/* Config Vars */
/* -------------------------*/

let maxAngleAllowed = 170;
let tooltips = {
  firstPoint: 'Click map to place Focal point of Visual',
  secondPoint: 'Click map to place one side of the view cone',
  thirdPoint: 'Click map to place the other side of the view cone',
  fourthPoint: 'Click map to place the curve control point',
  edit: {
    subtext: 'Click cancel to remove the cone and start again.',
    text: 'Drag markers to adjust the visual cone.'
  }
};

/* -------------------------*/
/* Vars and Intialization */
/* -------------------------*/

let metaserver = 'https://beirut.axismaps.io';
let tileserver = 'https://beirut.axismaps.io/tiles/';
let year = 1950;
let minYear = 1800;
let maxYear = 2019;
let tiles = {};
let shown = {};

/* General Map */
let leafletMap = L.map('map', {
  center: [33.9, 35.5],
  maxBounds: [[33.8297,35.4142],[33.9509,35.56]],
  zoom: 16,
  minZoom: 14,
  maxZoom: 18,
  doubleClickZoom: false
});

let base = L.tileLayer(tileserver + year + '/all/{z}/{x}/{y}.png').addTo(leafletMap);

/* Slider */
let pipValues = _.range(minYear, 2025, 25);
pipValues.push(maxYear);

let slider = noUiSlider.create(document.querySelector('.slider'), {
  start: [minYear],
  connect: false,
  step: 1,
  range: {
    min: [minYear],
    max: [maxYear]
  },
  pips: {
    mode: 'values',
    filter: (val) => {
      if (val === maxYear) return 1;
      else if (val === 2000) return 0;
      else if (val % 50) {
        if (val % 25) return 0;
        else return 2;
      } else return 1;
    },
    values: pipValues,
    density: 2
  },
  tooltips: true,
  format: {
    to: (value) => value,
    from: (value) => parseInt(value)
  }
});

slider.on('set', (y) => {
  updateYear(y[0]);
});

/* Leaflet Draw */
let editableLayer = new L.FeatureGroup();
let nonEditableLayer = new L.FeatureGroup();
leafletMap.addLayer(editableLayer);
leafletMap.addLayer(nonEditableLayer);

let drawControl = new L.Control.Draw({
  draw: false,
  edit: {
    edit: false,
    featureGroup: editableLayer,
    remove: false
  }
});
leafletMap.addControl(drawControl);

/* Sidebar */

// Set form submit location
document.querySelector('.sidebar--form').setAttribute('action', metaserver + '/collector/');

let requiredInputs = document.querySelectorAll('.required');
for (let i = 0; i < requiredInputs.length; i++) {
  requiredInputs[i].addEventListener('change', function () {
    checkForm();
  });
}

// Submit Event
document.querySelector('.sidebar--submit').addEventListener('click', function (e) {
  //e.preventDefault();

  let formEl = document.querySelector('.sidebar--form');

  let request = new XMLHttpRequest();
  request.open('POST', metaserver + '/collector/', true);

  // Success
  request.addEventListener('load', function () {
    document.querySelector('.success-message').classList.add('show');

    setTimeout(function () {
      document.querySelector('.success-message').classList.remove('show');
    }, 3000);

    cancelEditing();
    newCone();

    // Clear form
    document.querySelectorAll('.sidebar--input, .sidebar--textarea').forEach(function (input) {
      input.value = '';
    });

    // Return submit button back to disabled state
    document.querySelector('.sidebar--submit').classList.add('disabled');
  });

  // Error
  request.addEventListener('error', function (e) {
    document.querySelector('.error-message > .message-response').textContent = e.responseText || 'There was an error submitting the viewcone to the server.';
    document.querySelector('.error-message').classList.add('show');

    setTimeout(function () {
      document.querySelector('.error-message').classList.remove('show');
    }, 3000);
  });

  
  var formData = new FormData(formEl);
  var object = {};
    formData.forEach(function(value, key){
    object[key] = value;
  });
  request.send(JSON.stringify(object));
});

// Cancel event
document.querySelector('.sidebar--cancel').addEventListener('click', function (e) {
  e.preventDefault();

  cancelEditing();
  newCone();

  // Clear form
  document.querySelectorAll('.sidebar--input, .sidebar--textarea').forEach(function (input) {
    input.value = '';
  });
});

/* -------------------------*/
/* Functions */
/* -------------------------*/

/* General Functions */
function updateYear(y) {
  if (year == y) return false;
  year = y;

  loadBase();
  loadTiles();
}

function mapLoading(show) {
  if (show && document.querySelector('.loading') == null) {
    let loading = document.createElement('div');
    loading.classList.add('loading');
    document.querySelector('.map').appendChild(loading);

    leafletMap.dragging.disable();
    leafletMap.touchZoom.disable();
    leafletMap.doubleClickZoom.disable();
    leafletMap.scrollWheelZoom.disable();
  } else if (show === false) {
    document.querySelector('.loading').remove();
    leafletMap.dragging.enable();
    leafletMap.touchZoom.enable();
    leafletMap.doubleClickZoom.enable();
    leafletMap.scrollWheelZoom.enable();
  }
}

/* Tile functions */

function loadBase() {
  if (leafletMap.hasLayer(base)) leafletMap.removeLayer(base);

  if (year == maxYear) {
    base = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(leafletMap);
  } else {
    base = L.tileLayer(tileserver + year + '/base/{z}/{x}/{y}.png').addTo(leafletMap);
  }
}

function loadTiles() {
  mapLoading(true);
  if (tiles[year]) {
    leafletMap.addLayer(tiles[year].setOpacity(0));
  } else {
    var t = L.tileLayer(tileserver  + year + '/all/{z}/{x}/{y}.png')
       .addTo(leafletMap)
       .setOpacity(0)
       .on('load', function () {
        showTiles(this);
      });

    tiles[year] = t;
  }
}

function showTiles(tile) {
  if (!_.isEqual(shown.tiles, tile)) {
    if (shown.tiles) leafletMap.removeLayer(tileFadeOut(shown.tiles));
    shown.tiles = tileFadeIn(tile);
  }
}

function tileFadeOut(tileOut) {
  var i = 1;
  var timer = setInterval(function () {
    i -= 0.1;
    if (i <= 0) clearInterval(timer);
    tileOut.setOpacity(Math.max(0, i));
  }, 50);

  return tileOut;
}

function tileFadeIn(tileIn) {
  var i = 0;
  var timer = setInterval(function () {
    i += 0.1;
    if (i >= 1) {
      clearInterval(timer);
      mapLoading(false);
    }

    tileIn.setOpacity(Math.min(1, i));
  }, 50);

  return tileIn;
}

/* Leaflet Draw Functions */
let tooling;
let editing;
let genericIcon = L.divIcon({ className: 'cone-guidepoint', iconSize: 10 });
let majorPoints = [];
let line1;
let line2;
let line3;
let finalCone;

leafletMap.on('draw:canceled', function (e) {
  cancelEditing();
  newCone();
});

function newCone() {
  let firstPointIcon = L.divIcon({ className: 'cone-point', iconSize: 10 });

  // Set tooltip text
  L.drawLocal.draw.handlers.marker.tooltip.start = tooltips.firstPoint;

  tooling = new L.Draw.Marker(leafletMap, { icon: firstPointIcon });
  tooling.enable();

  leafletMap.on('draw:created', firstPointCreated);
}

function cancelEditing() {
  // Clear cones
  editableLayer.clearLayers();
  nonEditableLayer.clearLayers();
  if (tooling) tooling.disable();
  tooling = null;
  if (editing) editing.disable();
  editing = null;

  leafletMap.off('draw:created');
  leafletMap.off('mousemove');
}

function firstPointCreated(e) {
  // Add point
  editableLayer.addLayer(e.layer);
  majorPoints[0] = e.layer.getLatLng();
  e.layer.dependentLayers = ['line1', 'line2', 'finalCone']; // for easier access during editing stage
  e.layer.pointIndex = 0;
  tooling.disable();

  // Turn off old events
  leafletMap.off('draw:created');

  // Set tooltip text
  L.drawLocal.draw.handlers.marker.tooltip.start = tooltips.secondPoint;

  // Start new point
  tooling = new L.Draw.Marker(leafletMap, { icon: genericIcon });
  tooling.enable();

  // Draw line between points
  line1 = L.polyline([], { className: 'cone-guideline' }).addTo(nonEditableLayer);

  // New events
  leafletMap.on('mousemove', (e) => updateLine(line1, e.latlng));
  leafletMap.on('draw:created', secondPointCreated);
}

function secondPointCreated(e) {
  // Add point
  editableLayer.addLayer(e.layer);
  majorPoints[1] = e.layer.getLatLng();
  e.layer.dependentLayers = ['line1', 'finalCone']; // for easier access during editing stage
  e.layer.pointIndex = 1;
  tooling.disable();

  // Turn off old events
  leafletMap.off('draw:created');
  leafletMap.off('mousemove');

  // Set tooltip text
  L.drawLocal.draw.handlers.marker.tooltip.start = tooltips.thirdPoint;

  // Start new point
  tooling = new L.Draw.Marker(leafletMap, { icon: genericIcon });
  tooling.enable();

  // Draw line between points
  line2 = L.polyline([], { className: 'cone-guideline' }).addTo(nonEditableLayer);

  // New events
  leafletMap.on('mousemove', (e) => {
    updateLine(line2, e.latlng);
    tooling._marker.setLatLng(snapSidePoint(e.layerPoint, majorPoints[1], line2));
  });
  leafletMap.on('draw:created', thirdPointCreated);
}

function thirdPointCreated(e) {
  // Add point
  editableLayer.addLayer(e.layer);
  majorPoints[2] = e.layer.getLatLng();
  e.layer.dependentLayers = ['line2', 'finalCone']; // for easier access during editing stage
  e.layer.pointIndex = 2;
  tooling.disable();

  // Turn off old events
  leafletMap.off('draw:created');
  leafletMap.off('mousemove');

  // Set tooltip text
  L.drawLocal.draw.handlers.marker.tooltip.start = tooltips.fourthPoint;

  // Start new point
  tooling = new L.Draw.Marker(leafletMap, { icon: genericIcon });
  tooling.enable();

  // Draw invisble line between point 0 and halfwayPoint - used for snapping
  let halfwayPoint = L.latLng((majorPoints[1].lat - majorPoints[2].lat) / 2 + majorPoints[2].lat, (majorPoints[1].lng - majorPoints[2].lng) / 2 + majorPoints[2].lng);
  line3 = L.polyline([], { className: 'cone-guideline--invisible' }).addTo(nonEditableLayer);
  updateLine(line3, halfwayPoint);

  // Draw polygon between points
  finalCone = L.polygon([], { className: 'cone-guidepolygon' }).addTo(nonEditableLayer);

  // New events
  leafletMap.on('mousemove', (e) => {
    let snappedPoint = snapFourthPoint(e.layerPoint);
    tooling._marker.setLatLng(snappedPoint);
    updatePolygon(snappedPoint);
  });
  leafletMap.on('draw:created', fourthPointCreated);
}

function fourthPointCreated(e) {
  // Add point
  editableLayer.addLayer(e.layer);
  majorPoints[3] = e.layer.getLatLng();
  e.layer.dependentLayers = ['line3', 'finalCone']; // for easier access during editing stage
  e.layer.pointIndex = 3;
  tooling.disable();

  // Update form
  checkForm();

  // Turn off old events
  leafletMap.off('draw:created');
  leafletMap.off('mousemove');

  // Set tooltip text
  L.drawLocal.edit.handlers.edit.tooltip.subtext = tooltips.edit.subtext;
  L.drawLocal.edit.handlers.edit.tooltip.text = tooltips.edit.text;

  // Start editing
  editing = new L.EditToolbar.Edit(leafletMap, { featureGroup: editableLayer });
  editing.enable();

  editableLayer.eachLayer(function (layer) {
    layer.on('drag', function (e) {
      let dependentLayers = e.target.dependentLayers;
      let layerPoint = leafletMap.latLngToLayerPoint(e.latlng);

      // update point location
      majorPoints[e.target.pointIndex] = e.target.getLatLng();

      // update any lines affected
      let newLinePoint = e.target.pointIndex ? e.target.getLatLng() : null;

      if (dependentLayers.indexOf('line1') >= 0) {
        updateLine(line1, newLinePoint);

        // snapPoint and update markers accordingly
        let snappedPoint = snapSidePoint(layerPoint, majorPoints[2], line1);
        editing._featureGroup.eachLayer(function (l) {
          if (l.pointIndex === 1) l.setLatLng(snappedPoint); // update visible marker
        });

        line1._latlngs[1] = snappedPoint; // update line
        majorPoints[1] = snappedPoint; // update majorPoints to snapped version
      }

      if (dependentLayers.indexOf('line2') >= 0) {
        updateLine(line2, newLinePoint);

        // snapPoint and update markers accordingly
        let snappedPoint = snapSidePoint(layerPoint, majorPoints[1], line2);
        editing._featureGroup.eachLayer(function (l) {
          if (l.pointIndex === 2) l.setLatLng(snappedPoint); // update visible marker
        });

        line2._latlngs[1] = snappedPoint; // update line
        majorPoints[2] = snappedPoint; // update majorPoints to snapped version
      }

      // Update curve point based on the movement of the two lines
      if (dependentLayers.indexOf('line1') || dependentLayers.indexOf('line2')) {
        let halfwayPoint = L.latLng((majorPoints[1].lat - majorPoints[2].lat) / 2 + majorPoints[2].lat, (majorPoints[1].lng - majorPoints[2].lng) / 2 + majorPoints[2].lng);
        updateLine(line3, halfwayPoint);

        // snapPoint and update markers accordingly
        let snappedPoint = snapFourthPoint(leafletMap.latLngToLayerPoint(majorPoints[3]));
        editing._featureGroup.eachLayer(function (l) {
          if (l.pointIndex === 3) l.setLatLng(snappedPoint); // update visible marker
        });

        line3._latlngs[1] = snappedPoint; // update line
        majorPoints[3] = snappedPoint; // update majorPoints to snapped version
      }

      if (dependentLayers.indexOf('line3') >= 0) {
        let halfwayPoint = L.latLng((majorPoints[1].lat - majorPoints[2].lat) / 2 + majorPoints[2].lat, (majorPoints[1].lng - majorPoints[2].lng) / 2 + majorPoints[2].lng);
        updateLine(line3, halfwayPoint);

        // snapPoint and update markers accordingly
        let snappedPoint = snapFourthPoint(leafletMap.latLngToLayerPoint(e.latlng));
        e.target.setLatLng(snappedPoint); // update visible marker
        line3._latlngs[1] = snappedPoint; // update line
        majorPoints[3] = snappedPoint; // update majorPoints to snapped version
      }

      // update the cone polygon
      if (dependentLayers.indexOf('finalCone') >= 0) {
        updatePolygon();
      }
    });
  });
}

function updateLine(line, midPoint) {
  if (!midPoint) midPoint = line.getLatLngs()[1]; // if no midPoint, then updated point was majorPoints[0]

  let c = getMapEdgePoint(leafletMap.latLngToLayerPoint(majorPoints[0]), leafletMap.latLngToLayerPoint(midPoint));
  let previousLineLatLngs = line.getLatLngs();
  line.setLatLngs([majorPoints[0], midPoint, leafletMap.layerPointToLatLng(c)]);

  // Don't allow the line to extend beyond a given angle
  if (line1 && line2 && getAngle(line1, line2) > maxAngleAllowed) line.setLatLngs(previousLineLatLngs);
}

function snapSidePoint(mousePoint, equivalentPoint, line) {
  let point0 = leafletMap.latLngToLayerPoint(majorPoints[0]);
  let point1 = leafletMap.latLngToLayerPoint(equivalentPoint);
  let dist = Math.sqrt(Math.pow(point1.x - point0.x, 2) + Math.pow(point1.y - point0.y, 2));
  let pointAlongLine = findPointAlongLine(line, dist);

  let pointToUse = mousePoint;
  if (mousePoint.distanceTo(pointAlongLine) <= 10 || getAngle(line1, line2) > maxAngleAllowed) pointToUse = pointAlongLine;
  return leafletMap.layerPointToLatLng(pointToUse);
}

function snapFourthPoint(mousePoint) {
  const line3LLs = line3.getLatLngs();

  let point0 = leafletMap.latLngToLayerPoint(line3LLs[0]);
  let point1 = leafletMap.latLngToLayerPoint(line3LLs[2]);
  let snappedPoint = L.LineUtil.closestPointOnSegment(mousePoint, point0, point1);

  let pointToUse = mousePoint;
  if (mousePoint.distanceTo(snappedPoint) <= 10) pointToUse = snappedPoint;

  let pointToUseLL = leafletMap.layerPointToLatLng(pointToUse);

  if (isLeft(majorPoints[1], majorPoints[2], majorPoints[0]) === isLeft(majorPoints[1], majorPoints[2], pointToUseLL)) pointToUseLL = line3LLs[1];
  if (isLeft(majorPoints[0], majorPoints[1], line3LLs[1]) !== isLeft(majorPoints[0], majorPoints[1], pointToUseLL)) pointToUseLL = line3LLs[1];
  if (isLeft(majorPoints[0], majorPoints[2], line3LLs[1]) !== isLeft(majorPoints[0], majorPoints[2], pointToUseLL)) pointToUseLL = line3LLs[1];
  return pointToUseLL;
}

// assumes that line[0] is the beginning point of distance
function findPointAlongLine(line, distance) {
  let line0Point = leafletMap.latLngToLayerPoint(line.getLatLngs()[0]);
  let line1Point = leafletMap.latLngToLayerPoint(line.getLatLngs()[1]);
  let originVector = [line1Point.x - line0Point.x, line1Point.y - line0Point.y];
  let unitVectorDenominator = Math.sqrt(Math.pow(originVector[0], 2) + Math.pow(originVector[1], 2));
  let unitVector = [originVector[0] / unitVectorDenominator, originVector[1] / unitVectorDenominator];
  let distanceVector = [distance * unitVector[0], distance * unitVector[1]];
  return L.point(line0Point.x + distanceVector[0], line0Point.y + distanceVector[1]);
}

function updatePolygon(curvePoint) {
  if (!curvePoint) curvePoint = majorPoints[3];
  let newPoints = [[majorPoints[0].lat, majorPoints[0].lng]].concat(generateCurvePoints([majorPoints[1], curvePoint, majorPoints[2]]));
  finalCone.setLatLngs(newPoints);

  savePolygonToForm();
}

function getMapEdgePoint(a, b) {
  let length = Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  let c = {};
  c.x = b.x + (b.x - a.x) / length * window.outerWidth;
  c.y = b.y + (b.y - a.y) / length * window.outerWidth;
  return c;
}

function getAngle(l1, l2) {
  let l1Points = l1.getLatLngs().map((ll) => leafletMap.latLngToLayerPoint(ll));
  let l2Points = l2.getLatLngs().map((ll) => leafletMap.latLngToLayerPoint(ll));
  let angle1 = Math.atan2(l1Points[0].y - l1Points[1].y, l1Points[0].x - l1Points[1].x);
  let angle2 = Math.atan2(l2Points[0].y - l2Points[1].y, l2Points[0].x - l2Points[1].x);

  let returnAngle = Math.round(Math.abs(angle1 - angle2) * 180 / Math.PI);
  return returnAngle > 180 ? 360 - returnAngle : returnAngle;
}

function isLeft(a, b, c) {
  return ((b.lng - a.lng) * (c.lat - a.lat) - (b.lat - a.lat) * (c.lng - a.lng)) > 0;
}

function generateCurvePoints(ptsArray) {
  let tension = 0.5;
  let numOfSegments = 32;

  let _pts;
  let result = [];
  let pl = ptsArray.length;

  // clone array so we don't change the original content
  _pts = _.flatten(ptsArray.map((pt) => [pt.lng, pt.lat]));

  // Add control point
  let halfwayPoint1 = [(ptsArray[0].lng - majorPoints[0].lng) / 2 + majorPoints[0].lng, (ptsArray[0].lat - majorPoints[0].lat) / 2 + majorPoints[0].lat];
  let point01Dist = [ptsArray[1].lng - ptsArray[0].lng, ptsArray[1].lat - ptsArray[0].lat];
  _pts.unshift(halfwayPoint1[1] - point01Dist[1]);
  _pts.unshift(halfwayPoint1[0] - point01Dist[0]);

  // Add second control point
  let halfwayPoint2 = [(ptsArray[2].lng - majorPoints[0].lng) / 2 + majorPoints[0].lng, (ptsArray[2].lat - majorPoints[0].lat) / 2 + majorPoints[0].lat];
  let point12Dist = [ptsArray[1].lng - ptsArray[2].lng, ptsArray[1].lat - ptsArray[2].lat];
  _pts.push(halfwayPoint2[0] - point12Dist[0], halfwayPoint2[1] - point12Dist[1]);

  // 1. loop goes through point array
  // 2. loop goes through each segment between the two points + one point before and after
  for (let i = 2; i < (_pts.length - 4); i += 2) {
    let p0 = _pts[i];
    let p1 = _pts[i + 1];
    let p2 = _pts[i + 2];
    let p3 = _pts[i + 3];

    // calc tension vectors
    let t1x = (p2 - _pts[i - 2]) * tension;
    let t2x = (_pts[i + 4] - p0) * tension;

    let t1y = (p3 - _pts[i - 1]) * tension;
    let t2y = (_pts[i + 5] - p1) * tension;

    for (let t = 0; t <= numOfSegments; t++) {
      // calc step
      let st = t / numOfSegments;

      let pow2 = Math.pow(st, 2);
      let pow3 = pow2 * st;
      let pow23 = pow2 * 3;
      let pow32 = pow3 * 2;

      // calc cardinals
      let c1 = pow32 - pow23 + 1;
      let c2 = pow23 - pow32;
      let c3 = pow3 - 2 * pow2 + st;
      let c4 = pow3 - pow2;

      // calc x and y cords with common control vectors
      let x = c1 * p0 + c2 * p2 + c3 * t1x + c4 * t2x;
      let y = c1 * p1 + c2 * p3 + c3 * t1y + c4 * t2y;

      // store points in array
      result.push([y, x]);
    }
  }

  return result;
}

function savePolygonToForm() {
  document.getElementById('form-polygon-data').value = JSON.stringify(finalCone.toGeoJSON());
  document.getElementById('form-point-lat').value = majorPoints[0].lat;
  document.getElementById('form-point-lon').value = majorPoints[0].lng;
  checkForm();
}

function checkForm() {
  let modifiedCount = 0

  // check form
  let required = document.querySelectorAll('.required');
  for (let i = 0; i < required.length; i++) {
    if (required[i].value !== '') modifiedCount += 1;
  }

  // check polygon is drawn
  if (majorPoints[3]) modifiedCount += 1;

  if (modifiedCount === 5) {
    document.querySelector('.sidebar--submit').classList.remove('disabled');
  }
}

/* -------------------------*/
/* Start */
/* -------------------------*/
slider.set(1950);
newCone();
