const getSearch = (components) => {
  const S = {};

  let container;
  let request;
  let year = 2015;
  let resultsContainer;
  let searchResults = {};
  let searchVal;

  function initEvents() {
    $('#search-button').click((e) => {
      console.log('search button click');
      e.stopPropagation();
      $('#legend').addClass('search');
      $('#search input').focus();
      $(document).on('click.search', (ee) => {
        if (!$.contains(document.getElementById('search'), ee.target)) {
          S.clear();
          $('#legend').removeClass('search');
          $(document).off('click.search');
        }
      });
    });
    $('input', container).on('keyup', function keyup(e) {
      const val = $(this).val();
      if (val.length > 2) {
        doSearch(val);
      } else {
        S.clear();
      }
    });
  }

  function doSearch(val) {
    const { init } = components;
    const { server } = init;
    console.log('request', request);
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
      // .append('<i class="icon-times">')
      .appendTo(container);
    initEvents();
    return S;
  };

  S.setYear = (newYear) => {
    year = newYear;
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
