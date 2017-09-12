let Filmstrip = (function($, dispatch) {
  
  let F = {};

  let filmstrip = $('#filmstrip');

  function init_events () {
    $('.filmstrip-toggle').click(function () {
      filmstrip.toggleClass('collapsed');
    });
  }

  F.initialize = function () {
    init_events();
  }

  return F;
})(jQuery, Dispatch);