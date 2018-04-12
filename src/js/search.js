const getSearch = (components) => {
  let S = {};

  let container;
  let request;
  let year = 2015;
  let resultsContainer;
  let searchResults = {};
  let searchVal;

  function init_events () {
    $('input', container).on('keyup', function(e){ 
      let val = $(this).val();
      if (val.length > 2) {
        doSearch(val);
      } else {
        S.clear();
      }
    });
  }

  function doSearch (val) {
    if (val != searchVal) {
      searchVal = val;
      if (request && request.readyState != 4) request.abort();
      request = $.getJSON(server + 'search/' + year + '/' + val, S.showResults);
    } else if (searchVal) {
      S.showResults(searchResults)
    }
  }

  S.showResults = function (results, clicked) {
    searchResults = results;
    if (_.size(searchResults)) {
      resultsContainer.css('margin-right', $('#overlay-info').is(':visible') ? '65px' : 0);
      dispatch.call('removeprobe', this);
      dispatch.call('removehighlight', this);
      if (mobile) $('header').addClass('search');
      let array = _.mapObject(results, function(r, k){ return _.extend(r, {name: k}); });
      let groups = _.groupBy(searchResults, 'layer');
      $('.results-group').remove();
      resultsContainer.show();
      _.each(groups, function (g, gName) {
        let groupContainer = $('<div>')
          .attr('class', 'results-group')
          .append('<span>' + names[gName.toLowerCase()] || gName + '</span>')
          .appendTo(resultsContainer);
        _.each(g, function (r) {
          let row = $('<div>').attr('class', 'search-result')
            .append('<i class="icon-right-dir"></i>')
            .append('<i class="icon-down-dir"></i>')
            .appendTo(groupContainer);
          let span = $('<span>' + r.name + '</span>')
            .appendTo(row)
            .on('click', function () {
              //$('header').removeClass('search');
              if (!row.hasClass('selected')) {
                $('.search-result.selected').removeClass('selected');
                row.addClass('selected');
                if (!row.hasClass('expanded')) $(this).prev().click();
                Dispatch.call('drawfeature', this, r);
              } else {
                row.removeClass('selected');
                if (row.hasClass('expanded')) $(this).prev().click();
                Dispatch.call('removehighlight', this);
              }
              
            })
            .prepend('<i class="icon-binoculars">');
          $('i.icon-right-dir, i.icon-down-dir', row).on('click', function () {
              if (row.hasClass('expanded')) {
                row.removeClass('expanded');
              } else {
                row.addClass('expanded');
                if (!$('.result-details', row).length) {
                  let details = $('<div>')
                    .attr('class', 'result-details')
                    .appendTo(row);
                  $.getJSON(server + 'details/' + r.id[0], function(response) {
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
      resultsContainer.hide();
      dispatch.call('removehighlight', this);
    }
  }

  S.initialize = function (containerId) {
    container = $('#' + containerId);
    resultsContainer = $('<div>')
      .attr('class', 'search-results')
      .append('<i class="icon-times">')
      .appendTo(container);
    init_events();

    return S;
  }

  S.setYear = function (newYear) {
    year = newYear;
    resultsContainer.hide();
    return S;
  }

  S.clear = function () {
    Dispatch.call('removehighlight', this);
    $('.search-result.selected').removeClass('selected');
    //$('input', container).val(null);
    if (resultsContainer) resultsContainer.hide();
  }

  return S;
};

export default getSearch;
