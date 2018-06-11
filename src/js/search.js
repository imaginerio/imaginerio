const getSearch = (components) => {
  const S = {};

  let container;
  let searchInput;
  let request;
  let year = 2015;
  let resultsContainer;
  let searchResults = {};
  let searchVal;
  let pulse;
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

  const clearInput = () => {
    searchVal = '';
    searchInput.val('');
  };

  function closeSearch() {
    clearInput();
    $('#legend').removeClass('search');
    $('#legend').removeClass('click-search');
    $('#legend').removeClass('enter-search');
    $(document).off('click.search');
  }

  function closeSearchSidebar() {
    const { Legend } = components;
    closeSearch();
    Legend.closeSidebar();
  }

  S.clearAndClose = () => {
    S.clear();
    closeSearch();
  };

  function setSearchExit() {
    $('.close-search-button')
      .on('click', () => {
        S.clearAndClose();
      });
  }

  const getInputValue = () => searchInput.val();

  function initEvents() {
    $('#search-button').click((e) => {
      e.stopPropagation();
      // $('#legend').addClass('search');
      $('#legend').addClass('enter-search');
      searchInput.focus();
      setSearchExit();
    });

    $('.search-clear-button')
      .on('click', S.clearAndClose);

    searchInput.on('keyup', () => {
      const val = getInputValue();
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
    if ($('#legend').hasClass('collapsed')) {
      Legend.openSidebar();
    }
    
    $('#legend').addClass('search');
    setSearchExit();
  }

  function setSearchByArea() {
    const { Map, probes, init } = components;
    const { mobile, darkBlue } = init;


    const leafletMap = Map.getMap();
    const drawnShape = new L.FeatureGroup().addTo(leafletMap);


    const areaProbeButton = mobile ? $('.probe-area--mobile') : $('.probe-area');
    const areaMobileHintProbe = $('.probe-area-hint');

    const stopSearching = () => {
      $('main').removeClass('searching-area');
    };

    leafletMap.on(L.Draw.Event.CREATED, (e) => {
      console.log('e', e);

      // const center = e.target.getBounds().getCenter();
      // console.log('center', center);
      // const pixelCenter = leafletMap.latLngToLayerPoint(center);
      // console.log('pos', pixelCenter);
      const { layer } = e;
      const searchAreaVal = layer.getLatLngs();
      if (searchAreaVal[0].length !== 4) {
        stopSearching();
        return;
      }

      leafletMap.off('touchstart', searchTouchStart);

      const getCoordString = latLng => `${latLng.lng},${latLng.lat}`;

      const topLeft = getCoordString(searchAreaVal[0][3]);
      const bottomRight = getCoordString(searchAreaVal[0][1]);

      const center = {
        lat: (searchAreaVal[0][3].lat + searchAreaVal[0][1].lat) / 2,
        lng: (searchAreaVal[0][3].lng + searchAreaVal[0][1].lng) / 2,
      };

      const pixelCenter = leafletMap.latLngToLayerPoint(center);
      pulse = Map.getPulse(pixelCenter).appendTo($('.leaflet-marker-pane'));

      doAreaSearch(topLeft, bottomRight);
      // probes.minimizeAreaSearch();
      stopSearching();
    });
    // console.log('draw', L.Draw.Event);

    const startText = 'Click+drag to explore an area';
    const endText = 'Release to search';

    L.drawLocal.draw.handlers.rectangle.tooltip.start = startText;
    L.drawLocal.draw.handlers.simpleshape.tooltip.end = endText;


    drawnShape.addTo(leafletMap);
    let rectangle;

    function stopAreaSearch() {
      if (rectangle !== undefined) {
        rectangle.disable();
        stopSearching();
      }
    }

    function searchTouchStart() {
      areaMobileHintProbe.text(endText);
    }

    function searchTouchEnd() {
      // timeout is to get this to go to end of queue,
      // otherwise search is disabled before it can go through
      setTimeout(() => {
        $(document).off('touchend touchcancel', searchTouchEnd);
        rectangle.disable();
        stopSearching();
      }, 0);
    }
    
    areaProbeButton
      .on('click', () => {
        // if currently searching, end area search
        areaMobileHintProbe.text(startText);
        if ($('main').hasClass('searching-area')) {
          stopAreaSearch();
          return;
        }
        $('main').addClass('searching-area');
        probes.hideHintProbe();
        rectangle = new L.Draw.Rectangle(leafletMap, {
          edit: {
            featureGroup: drawnShape,
          },
          shapeOptions: {
            color: darkBlue,
            fillColor: darkBlue,
            className: 'search-rectangle',
          },
        });
        $(document).on('touchend touchcancel', searchTouchEnd);
        leafletMap.on('touchstart', searchTouchStart);
        
        rectangle.enable();
      });

    $(document).keyup((ee) => {
      if (ee.keyCode === 27) {
        stopAreaSearch();
      }
    });
    // set click event for area search close button
    $('.probe-area > .icon-times')
      .on('click', (e) => {
        e.stopPropagation(); // prevent click from triggering new rectangle
        stopAreaSearch();
      });
  }

  function doAreaSearch(topLeft, bottomRight) {
    const { init, dispatch } = components;
    const { server } = init;
    const off = layers[0] === 'all' ? '' : layers.join(',');
    const searchUrl = `${server}box/${year}/${topLeft}/${bottomRight}/${off}`;

    $.getJSON(searchUrl, (data) => {
      S.showResults(_.indexBy(data, 'name'), 'area');
    });
  }


  function doSearch(val, changedYear = false) {
    const { init } = components;
    const { server } = init;
    // console.log('val searchval', val, searchVal);
    if (val !== searchVal || changedYear) {
      searchVal = val;
      // abort if search is already underway
      if (request !== undefined && request.readyState !== 4) request.abort();
      request = $.getJSON(`${server}search/${year}/${val}`, S.showResults);
      // console.log('request');
    } else if (searchVal) {
      // console.log('already have results');
      S.showResults(searchResults);
    }
  }

  function getCategories() {
    const {
      Legend,
    } = components;

    return Object.keys(Legend.getLayersData());
  }

  // returns object lookup table to find category for given layer
  function getLayerDataTable() {
    const {
      Legend,
    } = components;

    const legendData = Legend.getLayersData();
    const categories = getCategories();

    return categories.reduce((accumulator, category) => {
      Object.keys(legendData[category])
        .forEach((layer) => {
          accumulator[layer] = legendData[category][layer];
        });
      return accumulator;
    }, {});
  }

  function addStylesToResults(results) {
    const { init } = components;
    // console.log('names', names);
    const layersDataTable = getLayerDataTable();
    // console.log('layer data table', layersDataTable);
    Object.keys(results)
      .forEach((resultName) => {
        const result = results[resultName];
        const layerName = result.layer;
        const resultType = result.featuretyp;
        const layerData = layersDataTable[layerName];
        if (layerData === undefined) {
          result.style = null;
        } else if (Array.isArray(layerData.features) &&
          Object.prototype.hasOwnProperty.call(layerData, 'style')) {
          result.style = layerData.style;
        } else if (resultType !== null) {
          const subLayerDetails = layerData.features[resultType];

          if (subLayerDetails !== undefined && Object.prototype.hasOwnProperty.call(subLayerDetails, 'style')) {
            result.style = subLayerDetails.style;
          } else {
            // layer type is not found in legend
            result.style = null;
          }
        } else {
          // add fallbacks (at least for buildings)
          result.style = null;
        }
      });
  }

  S.showResults = function showResults(results, searchType) {
    const {
      dispatch,
      init,
      Map,
    } = components;
    const {
      mobile,
      names,
    } = init;

    console.log('show results');

    addStylesToResults(results);

    // set search back button
    const legend = $('#legend');
    if (searchType === 'click' || searchType === 'area') {
      legend.addClass('click-search');
      legend.removeClass('enter-search');
      clearInput();
    }

    // clear old results
    $('.legend-category[data-category="search"]').remove();

    const cat = $('<div>')
      .attr('class', 'legend-category')
      .attr('data-category', 'search')
      .prependTo('.legend-contents');

    cat.append(`
      <div id="search">
      </div>
    `);

    resultsContainer = $('<div>')
      .attr('class', 'search-results')
      .appendTo($('#search'));

    // open legend, set back to legend button events
    toggleSearchResults();
    $('.no-results-text').remove();
    $('.results-group').remove();
    searchResults = results;

    if (_.size(searchResults) !== 0) {
      resultsContainer
        .css('margin-right', $('#overlay-info').is(':visible') ? '65px' : 0);

      dispatch.call('removeprobe', this);
      dispatch.call('removehighlight', this);
      
      if (mobile) $('header').addClass('search');
      _.mapObject(results, (r, k) => _.extend(r, { name: k }));
      const groups = _.groupBy(searchResults, 'layer');
      // list of layer names, putting image layers first
      const groupsList = [
        ...Object.keys(groups).filter(d => imageLayers.includes(d)),
        ...Object.keys(groups).filter(d => !imageLayers.includes(d)),
      ];

      groupsList.forEach((gName) => {
        const g = groups[gName];
        const groupContainer = $('<div>')
          .attr('class', 'results-group')
          .append('<span>' + names[gName.toLowerCase()] || gName + '</span>')
          .appendTo(resultsContainer);
        // draw results row for each record found
        _.each(g, (r) => {
          const row = $('<div>')
            .attr('class', 'search-result')
            // .data(r)
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
          // if (r.style !== null) {
          //   Legend.addSwatch(r.style)
          //     .appendTo(row);
          // }
        });
      });

      if (($('.search-result').length === 1 && searchType === 'click') ||
        ($('.search-result').length === 1 && searchType === 'area')
      ) {
        // if only one result from map click, select it
        const singleFeature = groups[groupsList[0]][0];
        dispatch.call('drawfeature', this, singleFeature, false);
        const row = $('.search-result').first();
        row.addClass('selected');
        if (!row.hasClass('expanded')) {
          expandRow(row, singleFeature.id[0]);
        }
        if (mobile) {
          $('#legend').addClass('collapsed');
        }
      }
    } else {
      // if there are no results
      $('<div>')
        .attr('class', 'no-results-text')
        .text('No results found')
        .appendTo(resultsContainer);
      dispatch.call('removehighlight', this);
    }
    resultsContainer.show();
    if (searchType === 'area') {
      pulse.remove();
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
    const { mobile } = init;

    row
      .append('<i class="icon-right-dir"></i>')
      .append('<i class="icon-down-dir"></i>');

    $(`<span class="result-text">${data.name}</span>`)
      .appendTo(row)
      .data(data)
      .on('click', function click() {
        // if row isn't selected clear previous selection, select new row...
        if (!row.hasClass('selected')) {
          $('.search-result.selected')
            .removeClass('selected');

          row.addClass('selected');

          if (!row.hasClass('expanded')) {
            // expand if isn't expanded
            // $(this).prev() returns triangle button
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
        expandRow(row, data.id[0]);
      }
    });

    if (data.style !== null) {
      Legend.addSwatch(data.style, true)
        .appendTo(row);
      $('.swatch', row)
        .css({
          'margin-top': '10px',
        });
    }
  }

  S.setSelectedFeature = (id) => {
    $('.result-text').each(function setResultButton() {
      const button = $(this);
      const row = button.parent();
      const data = button.data();
      if (data.id.includes(id)) {
        row.addClass('selected');
        if (!row.hasClass('expanded')) {
          button.prev().click();
        }
      } else {
        row.removeClass('selected');
        row.removeClass('expanded');
      }
    });
  };

  function expandRow(row, id) {
    const { init } = components;
    const { server } = init;
    row.addClass('expanded');
    if (!$('.result-details', row).length) {
      const details = $('<div>')
        .attr('class', 'result-details')
        .appendTo(row);
      $.getJSON(`${server}details/${id}`, (response) => {
        if (!response.length) return;
        if (response[0].creator) $('<p>Creator: <span>' + response[0].creator + '</span></p>').appendTo(details);
        if (response[0].year) $('<p>Mapped: <span>' + response[0].year + '</span></p>').appendTo(details);
      });
    }
  }

  S.initialize = function initialize() {
    searchInput = $('.search-input');
    initEvents();
    return S;
  };

  S.setYear = (newYear) => {
    year = newYear;
    const val = getInputValue();
    if (val.length > 0) {
      doSearch(val, true);
    } else {
      S.clearAndClose();
    }

    return S;
  };

  S.clear = function clear() {
    const { dispatch } = components;
    dispatch.call('removehighlight', this);
    $('.search-result.selected').removeClass('selected');

    $('.results-group').remove();
    $('.no-results-text').remove();
  };

  return S;
};

export default getSearch;
