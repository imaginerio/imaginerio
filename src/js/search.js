let Search = (function($, dispatch) {
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
      }
    });
  }

  function doSearch (val) {
    if (val != searchVal) {
      searchVal = val;
      if (request && request.readyState != 4) request.abort();
      request = $.getJSON(server + 'search/' + year + '/' + val, showResults);
    } else if (searchVal) {
      showResults(searchResults)
    }
  }

  function showResults (results) {
    searchResults = results;
    if (_.size(searchResults)) {
      let array = _.mapObject(results, function(r, k){ return _.extend(r, {name: k}); });
      let groups = _.groupBy(searchResults, 'layer');
      resultsContainer.empty().show();
      _.each(groups, function (g, gName) {
        let groupContainer = $('<div>')
          .attr('class', 'results-group')
          .append('<span>' + gName + '</span>')
          .appendTo(resultsContainer);
        _.each(g, function (r) {
          let row = $('<div>').attr('class', 'search-result')
            .append('<i class="icon-right-dir"></i>')
            .append('<span>' + r.name + '</span>')
            .appendTo(groupContainer);
        });
      });
      
    } else {
      resultsContainer.empty().hide();
    }
  }

  S.initialize = function (containerId) {
    container = $('#' + containerId);
    resultsContainer = $('<div>')
      .attr('class', 'search-results')
      .appendTo(container);
    init_events();

    return S;
  }

  S.setYear = function (newYear) {
    year = newYear;
    return S;
  }

  S.clear = function () {
    $('input', container).val(null);
    if (resultsContainer) resultsContainer.empty().hide();
  }

  return S;
})(jQuery, Dispatch);