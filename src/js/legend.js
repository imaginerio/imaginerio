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
            let gr = $('<div>').attr('class', 'legend-group').appendTo(cat);
            let groupTitle = $('<div>').attr('class', 'group-title').appendTo(gr);
            $('<label>')
              .html(groupName)
              .prepend('<input type="checkbox" checked>')
              .appendTo(groupTitle);
            _.each(group.features, function (feature) {
              let layer = $('<div>').attr('class', 'layer').appendTo(gr);
              $('<div>')
                .attr('class', 'layer-existing')
                .html(feature)
                .prepend('<i class="icon-binoculars">')
                .appendTo(layer)
                .click(function () {
                  dispatch.call('removehighlight', this);
                  if (!$(this).hasClass('highlighted')) {
                    $('.layer-existing.highlighted').removeClass('highlighted');
                    highlightFeature(feature);
                    $(this).toggleClass('highlighted');
                  } else {
                    $(this).removeClass('highlighted');
                  }
                });

              // how to know if this exists?
              $('<div>')
                .attr('class', 'layer-plans')
                .html('Plans')
                .prepend('<i class="icon-tsquare">')
                .appendTo(layer);
            });
          });
        });
      });
    });
  }

  function highlightFeature (feature) {
    $.getJSON(server + 'feature/' + year + '/' + feature, function (json) {
      dispatch.call('highlightfeature', this, json);
    })
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