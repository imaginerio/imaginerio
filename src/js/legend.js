let Legend = (function($, dispatch) {
  
  let Lg = {};

  let legend = $('#legend');

  let year = 2015;

  function init_events () {
    $('.legend-toggle').click(function () {
      legend.toggleClass('collapsed').addClass('subsequent');
    });
  }

  function updateYear (y) {
    if (y == year) return;
    year = y;
    $('.legend-contents').empty();
    $.getJSON(server + 'layers/' + year, function(json) {
      _.each(json, function (category, categoryName) {
        let cat = $('<div>').attr('class', 'legend-category').appendTo('.legend-contents');
        $('<div>').attr('class', 'category-title').html(categoryName).appendTo(cat);
        _.each(category, function (obj) { // there's an extra level here
          _.each(obj, function (group, groupName) {
            console.log(group)
            let gr = $('<div>').attr('class', 'legend-group').appendTo(cat);
            $('<div>').attr('class', 'group-title').html(groupName).appendTo(gr);
            _.each(group.features, function (feature) {
              $('<div>').attr('class', 'layer').html(feature).appendTo(gr);
            });
          });
        });
      });
    });
  }

  Lg.initialize = function () {
    init_events();

    return Lg;
  }

  Lg.setYear = function (newYear) {
    updateYear(newYear);

    return Lg;
  }

  return Lg;
})(jQuery, Dispatch);