// events
let Dispatch = d3.dispatch('changeyear', 'setyear', 'highlightfeature', 'removehighlight', 'addoverlay', 'removeoverlay', 'setlayers', 'viewshedclick', 'showresults', 'drawfeature');

Dispatch.on('changeyear', function (newYear) {
  year = newYear;
  Map.setYear(newYear);
  Legend.setYear(newYear);
  Filmstrip.setYear(newYear);
  Search.setYear(newYear);
});

Dispatch.on('setyear', function (newYear) {
  Timeline.setYear(newYear);
  Dispatch.call('changeyear', this, newYear);
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

Dispatch.on('showresults', function (results) {
  Search.showResults(results);
});

Dispatch.on('drawfeature', function (data) {
  Map.drawFeature(data.name);
  Search.clear();
  $.getJSON(server + 'details/' + data.id[0], function(response) {
    let content = '';
    if (response.length) {
      if (response[0].creator) content += '<p>Creator: <span>' + response[0].creator + '</span></p>';
      if (response[0].year) content += '<p>Mapped: <span>' + response[0].year + '</span></p>';
    }
    detailsProbe(data.name, content);
  });
})