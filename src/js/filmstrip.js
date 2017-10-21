let Filmstrip = (function($, _, dispatch) {
  
  let F = {};

  let filmstrip = $('#filmstrip');
  let rasters = [];
  let photos = [];
  let year = 2015;

  let selectedType = 'viewsheds';

  function init_events () {
    $('.filmstrip-toggle').click(function () {
      filmstrip.toggleClass('collapsed');
    });

    $('.raster-types i').click(filterTypes);
  }

  function updateYear (y) {
    year = y;
    $.getJSON(server + 'raster/' + year, function(json) {
      rasters = json;
      if (!rasters.length) $('.filmstrip-showall').hide();
      else $('.filmstrip-showall').show();
      showThumbs();
    });
  }

  function filterTypes (e) {
    let c = $(e.target).attr('class');
    let type;
    if (c == 'icon-camera') type = 'viewsheds';
    else if (c == 'icon-flight') type = 'aerials';
    else if (c == 'icon-tsquare') type = 'plans';
    else if (c == 'icon-map-o') type = 'maps';
    selectedType = type;
    showThumbs();
  }

  function showThumbs () {
    $('.filmstrip-thumbnails').empty();
    let photos = _.map(_.filter(rasters, function(r){ return r.layer === selectedType }), function (r) {
      return Photo(r, thumbnaillUrl);
    });
    photos.forEach(function (p) {
      $('.filmstrip-thumbnails').append(p.getThumb())
    });
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
})(jQuery, _, Dispatch);