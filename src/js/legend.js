let Legend = (function($, dispatch) {
  
  let Lg = {};

  let legend = $('#legend');

  function init_events () {
    $('.legend-toggle').click(function () {
      legend.toggleClass('collapsed').addClass('subsequent');
    });
  }

  Lg.initialize = function () {
    init_events();
  }

  return Lg;
})(jQuery, Dispatch);