let Filmstrip = (function($, dispatch) {
  
  let F = {};

  let filmstrip = $('#filmstrip');
  let rasters = [];
  let year = 2015;

  function init_events () {
    $('.filmstrip-toggle').click(function () {
      filmstrip.toggleClass('collapsed');
    });
  }

  function updateYear (y) {
    year = y;
    // $.getJSON(server + 'raster/' + year, function(json) {
    //   console.log(json)
    // })
  }

  F.initialize = function () {
    init_events();

    return F;
  }

  F.setYear = function (newYear) {
    updateYear(newYear);

    return F;
  }

  return F;
})(jQuery, Dispatch);