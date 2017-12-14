// events
let Dispatch = d3.dispatch('changeyear', 'setyear', 'highlightfeature', 'removehighlight', 'addoverlay', 'removeoverlay', 'addviews', 'showviews', 'hideviews', 'resetviews', 'setopacity', 'setlayers', 'viewshedclick', 'showresults', 'removeprobe', 'drawfeature', 'removeall', 'statechange', 'cancelmemory', 'showaddmemory');

Dispatch.on('changeyear', function (newYear) {
  year = newYear;
  Map.setYear(newYear);
  Legend.setYear(newYear);
  Filmstrip.setYear(newYear);
  Search.setYear(newYear);
  Dispatch.call('removeoverlay', this);
  updateEra();
  update_hash();
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
  $('.layer-plans').data('selected-plan', null);
});

Dispatch.on('addoverlay', function (p) {
  Map.addOverlay(p.data.overlay);
  rasterProbe(p);
  $('#overlay-info').data('p', p).show();
  $('.probe-hint').css('margin-right', '65px');
  update_hash();
});

Dispatch.on('removeoverlay', function () {
  Map.removeOverlay();
  $('#fixed-probe').hide();
  $('#overlay-info').data('p', null).hide();
  $('.probe-hint').css('margin-right', '0');
  update_hash();
});

Dispatch.on('setopacity', function (val) {
  Map.setOverlayOpacity(val);
});

Dispatch.on('setlayers', function (list) {
  Map.setLayers(list);
  update_hash();
});

Dispatch.on('viewshedclick', function (id) {
  let raster = _.find(Filmstrip.getRasters(), function (r) { return r.id == id });
  if (raster) rasterProbe(raster.photo);
});

Dispatch.on('showresults', function (results, clicked) {
  Search.showResults(results, clicked);
});

Dispatch.on('removeprobe', function () {
  Search.clear();
  Map.clearSelected();
  $('#fixed-probe').hide();
});

Dispatch.on('drawfeature', function (data) {
  Map.drawFeature(data.name);
  if (mobile) $('#search .icon-left-big').click();
  $.getJSON(server + 'details/' + data.id[0], function(response) {
    let content = '';
    if (response.length) {
      if (response[0].creator) content += '<p>Creator: <span>' + response[0].creator + '</span></p>';
      if (response[0].year) content += '<p>Mapped: <span>' + response[0].year + '</span></p>';
    }
    if (mobile) detailsProbe(data.name, content);
  });
});

Dispatch.on('removeall', function () {
  $('.probe').hide();
  $('.lightbox').hide();
  $('main').removeClass('eras');
  Map.clearSelected();
});

Dispatch.on('statechange', function () {
  update_hash();
});

Dispatch.on('addviews', function () {
  Legend.addViews();
});

Dispatch.on('showviews', function () {
  Map.showViews();
});

Dispatch.on('hideviews', function () {
  Map.hideViews();
});

Dispatch.on('resetviews', function () {
  Map.showViews();
  Legend.hasViews = true;
});

Dispatch.on('cancelmemory', function () {
  $('.memory-icon').hide();
});

Dispatch.on('showaddmemory', function (lat, lng) {
  showAddMemory(lat, lng);
});
