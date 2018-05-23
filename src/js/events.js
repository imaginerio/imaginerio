// events
const getDispatch = (components) => {
  const Dispatch = d3.dispatch(
    'changeyear',
    'setyear',
    'setera',
    'highlightfeature',
    'removehighlight',
    'addoverlay',
    'removeoverlay',
    'addviews',
    'showviews',
    'hideviews',
    'resetviews',
    'setopacity',
    'setlayers',
    'viewshedclick',
    'showresults',
    'removeprobe',
    'drawfeature',
    'removeall',
    'statechange',
    'cancelmemory',
    'showaddmemory',
    'drawplanfeature',
    'updatelanguage',
  );

  Dispatch.on('updatelanguage', () => {
    const {
      Legend,
    } = components;


    Legend.updateLanguage();
  });

  Dispatch.on('changeyear', (newYear) => {
    const {
      Legend,
      Search,
      Filmstrip,
      init,
      Map,
    } = components;

    const {
      updateEra,
      updateHash,
    } = init;

    Map.setYear(newYear);
    Legend.setYear(newYear);
    Filmstrip.setYear(newYear);
    Search.setYear(newYear);
    init.setYear(newYear);
    Dispatch.call('removeoverlay', this);
    updateEra();
    updateHash();
  });

  Dispatch.on('setyear', (newYear) => {
    const { Timeline } = components;

    Timeline.setYear(newYear);
    Dispatch.call('changeyear', this, newYear);
  });

  Dispatch.on('highlightfeature', (json) => {
    const { Map } = components;

    Map.highlightFeature(json);
  });

  Dispatch.on('removehighlight', () => {
    const { Map } = components;
    Map.removeHighlight();
    $('.layer-existing.highlighted, .layer-plans.highlighted').removeClass('highlighted');
    $('.layer-plans').data('selected-plan', null);
  });

  Dispatch.on('addoverlay', (p) => {
    const {
      Map,
      init,
      probes,
    } = components;
    const { updateHash } = init;
    const { rasterProbe } = probes;
    
    $('main').addClass('overlay');

    Map.addOverlay(p.data.overlay);
    rasterProbe(p);
    $('#overlay-info').data('p', p).addClass('overlay-info--visible');
    updateHash();
  });

  Dispatch.on('removeoverlay', () => {
    const { Map, init } = components;
    const { updateHash } = init;
    $('main').removeClass('overlay');
    Map.removeOverlay();
    $('#fixed-probe').hide();
    $('#overlay-info').data('p', null).removeClass('overlay-info--visible');
    // $('.probe-hint').css('margin-right', '0');
    updateHash();
  });

  Dispatch.on('setopacity', (val) => {
    const { Map } = components;
    Map.setOverlayOpacity(val);
  });

  // set layers on map
  Dispatch.on('setlayers', (list) => {
    const { Map, Search, init } = components;
    const { updateHash } = init;
    Map.setLayers(list);
    Search.setLayers(list);
    updateHash();
  });

  Dispatch.on('viewshedclick', (id) => {
    const { Filmstrip, probes } = components;
    const { rasterProbe } = probes;
    const raster = _.find(Filmstrip.getRasters(), r => r.id == id);
    if (raster) rasterProbe(raster.photo);
  });

  Dispatch.on('showresults', (results, clicked) => {
    const { Search } = components;
    Search.showResults(results, clicked);
  });

  Dispatch.on('removeprobe', () => {
    const { Search, Map } = components;
    Search.clear();
    Map.clearSelected();
    $('#fixed-probe').hide();
  });

  Dispatch.on('drawplanfeature', (plan) => {
    const { Map } = components;
    Map.drawPlanFeature(plan.planname);
  });

  Dispatch.on('drawfeature', (data) => {
    const { Map, init, probes } = components;
    const { mobile, server } = init;
    const { detailsProbe } = probes;
    
    // move this into Map module
    $.getJSON(server + 'details/' + data.id[0], (response) => {
      // name--data.name
      // layer type--data.layer (but use layers list to find correct name/translation)
      // plan name / layer name / feature name...?
      let probeContent = `
        <div class="map-probe-row"><b>${data.name}</b></div>
      `;
      if (response[0].creator !== undefined && response[0].creator !== '') {
        probeContent += `<div class="map-probe-row">Creator: ${response[0].creator}</div>`;
      }
      if (response[0].year !== undefined && response[0].year !== '') {
        probeContent += `<div class="map-probe-row">Mapped: ${response[0].year}</div>`;
      }
      Map.drawFeature(data.name, probeContent);
      if (mobile) $('#search .icon-left-big').click();

      let content = '';
      if (response.length) {
        if (response[0].creator) content += '<p>Creator: <span>' + response[0].creator + '</span></p>';
        if (response[0].year) content += '<p>Mapped: <span>' + response[0].year + '</span></p>';
      }
      if (mobile) detailsProbe(data.name, content);
    });
  });

  Dispatch.on('removeall', () => {
    const { Map } = components;
    $('.probe').hide();
    $('.lightbox').hide();
    $('main').removeClass('eras');
    Map.clearSelected();
  });

  Dispatch.on('statechange', () => {
    const { init } = components;
    const { updateHash } = init;
    updateHash();
  });

  Dispatch.on('addviews', () => {
    const { Legend } = components;
    Legend.addViews();
    // Legend.addSearch();
  });

  Dispatch.on('showviews', () => {
    const { Map } = components;
    Map.showViews();
  });

  Dispatch.on('hideviews', () => {
    const { Map } = components;
    Map.hideViews();
  });

  Dispatch.on('resetviews', () => {
    console.log('reset reviews');
    const { Map, Legend } = components;
    Map.showViews();
    Legend.hasViews = true;
    // Legend.addSearch();
  });

  Dispatch.on('cancelmemory', () => {
    $('.memory-icon').hide();
  });

  Dispatch.on('showaddmemory', (lat, lng) => {
    // this doesn't exist anywhere???
    showAddMemory(lat, lng);
  });
  return Dispatch;
};

export default getDispatch;
