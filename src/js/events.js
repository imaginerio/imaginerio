// events
let Dispatch = d3.dispatch('changeyear', 'highlightfeature', 'removehighlight', 'addoverlay', 'removeoverlay', 'setlayers', 'viewshedclick');

Dispatch.on('changeyear', function (newYear) {
  year = newYear;
  Map.setYear(newYear);
  Legend.setYear(newYear);
  Filmstrip.setYear(newYear);
  Search.setYear(newYear);
});

Dispatch.on('highlightfeature', function (json) {
  Map.highlightFeature(json);
});

Dispatch.on('removehighlight', function (json) {
  Map.removeHighlight();
  $('.layer-existing.highlighted, .layer-plans.highlighted').removeClass('highlighted');
});

Dispatch.on('addoverlay', function (p) {
  Map.addOverlay(p.data.overlay);
  rasterProbe(p);
});

Dispatch.on('removeoverlay', function () {
  Map.removeOverlay();
  $('#fixed-probe').hide();
});

Dispatch.on('setlayers', function (list) {
  Map.setLayers(list);
});

Dispatch.on('viewshedclick', function (id) {
  let raster = _.find(Filmstrip.getRasters(), function (r) { return r.id == id });
  if (raster) rasterProbe(raster.photo);
});