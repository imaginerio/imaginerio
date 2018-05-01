const getSearch = (components) => {
  const S = {};

  let container;
  let request;
  let year = 2015;
  let resultsContainer;
  let searchResults = {};
  let searchVal;
  let layers = ['all']; // either 'all' or a list of DISABLED layers

  S.setLayers = (list) => {
    layers = list;
  };

  function setSearchExit() {
    // need something here to detect if click is a new search.
    // if new search, do not remove 'search' class
    $(document).on('click.search', (ee) => {
      if (!$.contains(document.getElementById('search'), ee.target)) {
        S.clear();
        $('#legend').removeClass('search');
        $(document).off('click.search');
      }
    });
  }

  function initEvents() {
    $('#search-button').click((e) => {
      e.stopPropagation();
      $('#legend').addClass('search');
      $('#search input').focus();
      setSearchExit();
    });
    $('input', container).on('keyup', function keyup() {
      const val = $(this).val();
      if (val.length > 2) {
        doSearch(val);
      } else {
        S.clear();
      }
    });
    setSearchByArea();
  }

  function toggleSearchResults() {
    const { Legend } = components;
    Legend.openSidebar();
    $('#legend').addClass('search');
    setSearchExit();
  }

  function setSearchByArea() {
    const { Map } = components;
    const leafletMap = Map.getMap();
    const drawnShape = new L.FeatureGroup().addTo(leafletMap);
    const searchColor = '#337164';

    // leafletMap.on('draw:drawstart', () => {
      
    // });

    leafletMap.on(L.Draw.Event.CREATED, (e) => {
      const { layer } = e;
      const searchAreaVal = layer.getLatLngs();
      $('main').removeClass('searching-area');
      console.log('search area', searchAreaVal);
      const getCoordString = latLng => `${latLng.lng},${latLng.lat}`;
      // top left, bottom right
      const topLeft = getCoordString(searchAreaVal[0][3]);
      const bottomRight = getCoordString(searchAreaVal[0][1]);

      doAreaSearch(topLeft, bottomRight);
      toggleSearchResults();
    });

    L.drawLocal.draw.handlers.rectangle.tooltip.start = 'Click+drag to explore an area';
    drawnShape.addTo(leafletMap);
    $('.probe-area').on('click', () => {
      $('main').addClass('searching-area');
      new L.Draw.Rectangle(leafletMap, {
        edit: {
          featureGroup: drawnShape,
        },
        shapeOptions: {
          color: searchColor,
          fillColor: searchColor,
        },
      }).enable();
    });
  }

  function doAreaSearch(topLeft, bottomRight) {
    const { init, dispatch } = components;
    const { server } = init;
    const off = layers[0] === 'all' ? '' : layers.join(',');
    // const probeUrl = `${server}probe/${year}/${probeZoom}/${e.latlng.lng},${e.latlng.lat}/${off}`;
    // http://imaginerio.axismaps.io:3000/box/2003/-43.2192,-22.886/-43.167,-22.92/roads/
    const searchUrl = `${server}box/${year}/${topLeft}/${bottomRight}/${off}`;
    console.log('url', searchUrl);
    $.getJSON(searchUrl, (data) => {
      console.log('area search data', data);
      S.showResults(_.indexBy(data, 'name'), true);
    });
  }


  function doSearch(val) {
    const { init } = components;
    const { server } = init;
    console.log('do search', request);
    if (val !== searchVal) {
      searchVal = val;
      // abort if search is already underway
      if (request !== undefined && request.readyState !== 4) request.abort();
      request = $.getJSON(server + 'search/' + year + '/' + val, S.showResults);
    } else if (searchVal) {
      S.showResults(searchResults);
    }
  }

  S.showResults = function showResults(results, clicked) {
    const { dispatch, init } = components;
    const { mobile, names, server } = init;
    console.log('show results');
    toggleSearchResults();
    searchResults = results;
    console.log('search results', results);
    // if there are results
    if (_.size(searchResults) !== 0) {
      resultsContainer
        .css('margin-right', $('#overlay-info').is(':visible') ? '65px' : 0);

      dispatch.call('removeprobe', this);
      dispatch.call('removehighlight', this);
      
      if (mobile) $('header').addClass('search');
      const array = _.mapObject(results, (r, k) => _.extend(r, { name: k }));
      const groups = _.groupBy(searchResults, 'layer');
      $('.results-group').remove();
      resultsContainer.show();
      _.each(groups, (g, gName) => {
        const groupContainer = $('<div>')
          .attr('class', 'results-group')
          .append('<span>' + names[gName.toLowerCase()] || gName + '</span>')
          .appendTo(resultsContainer);
        _.each(g, (r) => {
          const row = $('<div>').attr('class', 'search-result')
            .append('<i class="icon-right-dir"></i>')
            .append('<i class="icon-down-dir"></i>')
            .appendTo(groupContainer);
          $('<span>' + r.name + '</span>')
            .appendTo(row)
            .on('click', function click() {
              if (!row.hasClass('selected')) {
                $('.search-result.selected').removeClass('selected');
                row.addClass('selected');
                if (!row.hasClass('expanded')) $(this).prev().click();
                dispatch.call('drawfeature', this, r);
              } else {
                row.removeClass('selected');
                if (row.hasClass('expanded')) $(this).prev().click();
                dispatch.call('removehighlight', this);
              }
              
            })
            .prepend('<i class="icon-binoculars">');
          $('i.icon-right-dir, i.icon-down-dir', row).on('click', () => {
            if (row.hasClass('expanded')) {
              row.removeClass('expanded');
            } else {
              row.addClass('expanded');
              if (!$('.result-details', row).length) {
                const details = $('<div>')
                  .attr('class', 'result-details')
                  .appendTo(row);
                $.getJSON(server + 'details/' + r.id[0], (response) => {
                  if (!response.length) return;
                  if (response[0].creator) $('<p>Creator: <span>' + response[0].creator + '</span></p>').appendTo(details);
                  if (response[0].year) $('<p>Mapped: <span>' + response[0].year + '</span></p>').appendTo(details);
                });
              }
            }
          });
        });
      });

      if ($('.search-result').length == 1 && clicked) {
        // if only one result from map click, select it
        $('.search-result span').first().click();
      }
    } else {
      // if there are no results
      resultsContainer.hide();
      dispatch.call('removehighlight', this);
    }
  };

  S.initialize = function initialize(containerId) {
    container = $(`#${containerId}`);

    resultsContainer = $('<div>')
      .attr('class', 'search-results')
      .appendTo(container);
    initEvents();
    return S;
  };

  S.setYear = (newYear) => {
    year = newYear;
    if (resultsContainer === undefined) return;
    resultsContainer.hide();
    return S;
  };

  S.clear = function clear() {
    const { dispatch } = components;
    dispatch.call('removehighlight', this);
    $('.search-result.selected').removeClass('selected');
    if (resultsContainer) resultsContainer.hide();
  };

  return S;
};

export default getSearch;
