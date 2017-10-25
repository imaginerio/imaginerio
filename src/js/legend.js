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
    $.getJSON(server + 'layers/' + year, function(layersJson) {
      $.getJSON(server + 'plans/' + year, function(plansJson) {
        _.each(layersJson, function (category, categoryName) {
          let cat = $('<div>').attr('class', 'legend-category').appendTo('.legend-contents');
          $('<div>').attr('class', 'category-title').html(categoryName).appendTo(cat);
          _.each(category, function (obj) { // there's an extra level here
            _.each(obj, function (group, groupName) {
              let gr = $('<div>').attr('class', 'legend-group').attr('data-group', groupName).appendTo(cat);
              let groupTitle = $('<div>').attr('class', 'group-title').appendTo(gr);
              $('<label>')
                .html(names[groupName.toLowerCase()] || groupName)
                .prepend('<input type="checkbox" checked>')
                .appendTo(groupTitle);
              _.each(group.features, function (feature) {
                let layer = $('<div>').attr('class', 'layer').appendTo(gr);
                addLayerExisting(feature, layer);
                if (plansJson['Planned' + groupName]) {
                  let plan = _.find(plansJson['Planned' + groupName], function (d) {
                    return d.featuretyp == 'Planned' + feature;
                  });
                  if (plan) {
                    addLayerPlanned(plan.featuretyp, layer);
                  }
                }
              });
              // plans for layers not currently existing
              if (plansJson['Planned' + groupName]) {
                _.each(plansJson['Planned' + groupName], function (plan) {
                  if (_.contains(group.features, plan.featuretyp.replace('Planned', ''))) return;
                  let layer = $('<div>').attr('class', 'layer').appendTo(gr);
                  addLayerExisting(plan.featuretyp, layer, true);
                  addLayerPlanned(plan.featuretyp, layer);
                }); 
              }
            });
          });
        });

        // plans for groups not currently existing
        _.each(plansJson, function (planLayer, key) {
          if ($('.legend-group[data-group="' + key.replace('Planned', '') + '"]').length) return;
          let gr = $('<div>').attr('class', 'legend-group planned').attr('data-group', key).appendTo('.legend-contents');
          let groupTitle = $('<div>').attr('class', 'group-title').appendTo(gr);
          $('<label>')
            .html(names[key.toLowerCase()] || key)
            .prepend('<input type="checkbox" checked>')
            .appendTo(groupTitle);
          _.each(planLayer, function (plan) {
            let layer = $('<div>').attr('class', 'layer').appendTo(gr);
            addLayerExisting(plan.featuretyp, layer, true);
            addLayerPlanned(plan.featuretyp, layer);
          })
        });
      });
    });
  }

  function addLayerExisting (name, container, notpresent) {
    let l = $('<div>')
      .attr('class', 'layer-existing')
      .data('name', name)
      .html(name.replace('Planned', ''))
      .appendTo(container);
    if (!notpresent) {
      l
        .prepend('<i class="icon-binoculars">')
        .click(layerClick);
      } else {
        l.addClass('not-present');
      }
  }

  function addLayerPlanned (name, container) {
    $('<div>')
      .attr('class', 'layer-plans')
      .data('name', name)
      .html('Plans')
      .prepend('<i class="icon-tsquare">')
      .appendTo(container)
      .click(layerClick);
  }

  function layerClick () {
    if (!$(this).hasClass('highlighted')) {
      highlightFeature($(this).data('name'));
      $(this).toggleClass('highlighted');
    } else {
      dispatch.call('removehighlight', this);
    }
  }

  function highlightFeature (feature) {
    dispatch.call('removehighlight', this);
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