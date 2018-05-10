const getSearch = (components) => {
  const S = {};

  let container;
  let searchInput;
  let request;
  let year = 2015;
  let resultsContainer;
  let searchResults = {};
  let searchVal;
  let layers = ['all']; // either 'all' or a list of DISABLED layers
  const imageLayers = [
    'viewsheds',
    'plans',
    'maps',
    'surveys',
  ];

  S.setLayers = (list) => {
    layers = list;
  };

  function closeSearch() {
    $('#legend').removeClass('search');
    $(document).off('click.search');
  }

  function closeSearchSidebar() {
    const { Legend } = components;
    closeSearch();
    Legend.closeSidebar();
  }

  function setSearchExit() {
    $(document).on('click.search', (ee) => {
      const inSearchBox = $.contains(document.getElementById('search'), ee.target);
      const isSearchInput = $(ee.target).hasClass('search-input');

      if (!inSearchBox && !isSearchInput) {
        console.log('CLOSE SEARCH');
        S.clear();
        closeSearch();
      }
    });
  }

  function initEvents() {
    $('#search-button').click((e) => {
      e.stopPropagation();
      $('#legend').addClass('search');
      $('.search-input').focus();
      setSearchExit();
    });
    searchInput.on('keyup', function keyup() {
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
    console.log('toggle search results');
    const { Legend } = components;
    if ($('#legend').hasClass('collapsed')) {
      Legend.openSidebar();
    }
    
    $('#legend').addClass('search');
    setSearchExit();
  }

  function setSearchByArea() {
    const { Map, probes, init } = components;
    const { mobile } = init;
    const leafletMap = Map.getMap();
    const drawnShape = new L.FeatureGroup().addTo(leafletMap);
    const searchColor = '#337164';
    const stopSearching = () => {
      $('main').removeClass('searching-area');
    };

    leafletMap.on(L.Draw.Event.CREATED, (e) => {
      const { layer } = e;
      const searchAreaVal = layer.getLatLngs();

      const getCoordString = latLng => `${latLng.lng},${latLng.lat}`;

      const topLeft = getCoordString(searchAreaVal[0][3]);
      const bottomRight = getCoordString(searchAreaVal[0][1]);

      doAreaSearch(topLeft, bottomRight);
      stopSearching();
    });

    L.drawLocal.draw.handlers.rectangle.tooltip.start = 'Click+drag to explore an area';
    L.drawLocal.draw.handlers.simpleshape.tooltip.end = 'Release to search';

    drawnShape.addTo(leafletMap);
    let rectangle;
    const areaProbeButton = mobile ? $('.probe-area--mobile') : $('.probe-area');
    areaProbeButton.on('click', () => {
      $('main').addClass('searching-area');
      probes.hideHintProbe();
      rectangle = new L.Draw.Rectangle(leafletMap, {
        edit: {
          featureGroup: drawnShape,
        },
        shapeOptions: {
          color: searchColor,
          fillColor: searchColor,
        },
      });
      rectangle.enable();
    });

    $('.probe-area > .icon-times')
      .on('click', (e) => {
        e.stopPropagation(); // prevent click from triggering new rectangle
        if (rectangle !== undefined) {
          rectangle.disable();
          stopSearching();
        }
      });
  }

  function doAreaSearch(topLeft, bottomRight) {
    const { init, dispatch } = components;
    const { server } = init;
    const off = layers[0] === 'all' ? '' : layers.join(',');
    const searchUrl = `${server}box/${year}/${topLeft}/${bottomRight}/${off}`;

    $.getJSON(searchUrl, (data) => {
      S.showResults(_.indexBy(data, 'name'), true);
    });
  }


  function doSearch(val) {
    const { init } = components;
    const { server } = init;
    if (val !== searchVal) {
      searchVal = val;
      // abort if search is already underway
      if (request !== undefined && request.readyState !== 4) request.abort();
      request = $.getJSON(`${server}search/${year}/${val}`, S.showResults);
    } else if (searchVal) {
      S.showResults(searchResults);
    }
  }

  S.showResults = function showResults(results, clicked) {
    const { dispatch, init } = components;
    const {
      mobile,
      names,
    } = init;
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
      _.mapObject(results, (r, k) => _.extend(r, { name: k }));
      const groups = _.groupBy(searchResults, 'layer');
      console.log('groups', groups);
      // list of layer names, putting image layers first
      const groupsList = [
        ...Object.keys(groups).filter(d => imageLayers.includes(d)),
        ...Object.keys(groups).filter(d => !imageLayers.includes(d)),
      ];
      $('.results-group').remove();
      resultsContainer.show();
      // _.each(groups, (g, gName) => {
      groupsList.forEach((gName) => {
        const g = groups[gName];
        console.log('g', g);
        console.log('gName', gName);
        const groupContainer = $('<div>')
          .attr('class', 'results-group')
          .append('<span>' + names[gName.toLowerCase()] || gName + '</span>')
          .appendTo(resultsContainer);
        // draw results row for each record found
        _.each(g, (r) => {
          const row = $('<div>')
            .attr('class', 'search-result')
            .appendTo(groupContainer);

          if (imageLayers.includes(r.layer)) {
            drawViewshedResultsRow({
              row,
              data: r,
            });
          } else {
            drawNormalResultsRow({
              row,
              data: r,
            });
          }
        });
      });

      if ($('.search-result').length === 1 && clicked) {
        // if only one result from map click, select it
        $('.search-result span').first().click();
      }
    } else {
      // if there are no results
      resultsContainer.hide();
      dispatch.call('removehighlight', this);
    }
  };

  function drawViewshedResultsRow({ row, data }) {
    const {
      dispatch,
      init,
      Photo,
      Overlay,
      probes,
    } = components;
    const { rasterProbe } = probes;
    const { thumbnaillUrl, mobile } = init;

    data.photo = Photo(data, thumbnaillUrl);
    data.overlay = Overlay(data);
    // console.log('photo', photo.data.overlay.layer());
    // console.log('data', data);
    row.addClass('search-result--thumbnail');
    const thumb = data.photo.getImage([100])
      .attr('class', 'search-thumbnail')
      .click(function click() {
        if (!data.photo.metadata.width) return;
        if (data.photo.data.layer !== 'viewsheds') {
          dispatch.call('addoverlay', this, data.photo);
        } else {
          rasterProbe(data.photo);
        }
        if (mobile) {
          closeSearchSidebar();
        }
      });

    const imagePaths = {
      viewsheds: 'img/legend/viewshed-small.png',
      plans: 'img/legend/plan.png',
      maps: 'img/legend/map.png',
      surveys: 'img/legend/survey.png',
    };

    const thumbIcon = $('<img>')
      .addClass('thumbnail-icon')
      .attr('src', imagePaths[data.layer]);

    const title = $('<div>')
      .addClass('search-thumbnail-name')
      .html(data.name);

    row.append(thumb);
    row.append(title);
    row.append(thumbIcon);
  }

  function drawNormalResultsRow({ row, data }) {
    const { dispatch, init, Legend } = components;
    const { server, mobile } = init;

    row
      .append('<i class="icon-right-dir"></i>')
      .append('<i class="icon-down-dir"></i>');

    $(`<span>${data.name}</span>`)
      .appendTo(row)
      .on('click', function click() {
        // if row isn't selected clear previous selection, select new row...
        if (!row.hasClass('selected')) {
          $('.search-result.selected')
            .removeClass('selected');

          row.addClass('selected');

          if (!row.hasClass('expanded')) {
            // expand if isn't expanded
            $(this).prev().click();
          }
          if (mobile) {
            closeSearchSidebar();
          }
          

          dispatch
            .call('drawfeature', this, data);
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
          $.getJSON(`${server}details/${data.id[0]}`, (response) => {
            if (!response.length) return;
            if (response[0].creator) $('<p>Creator: <span>' + response[0].creator + '</span></p>').appendTo(details);
            if (response[0].year) $('<p>Mapped: <span>' + response[0].year + '</span></p>').appendTo(details);
          });
        }
      }
    });
  }

  S.initialize = function initialize(containerId) {
    container = $(`#${containerId}`);
    searchInput = $('.search-input');

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
