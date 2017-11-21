let Legend = (function($, dispatch) {
  
  let Lg = {};

  let legend = $('#legend');

  let year = 2015;

  let tempLayers;

  Lg.hasViews = true;

  let layers;
  let plans;

  function init_events () {
    $('.legend-toggle').click(function () {
      legend.toggleClass('collapsed').addClass('subsequent');
    });
    $('.legend-contents').on('change', function (){
      // checkbox clicks
      dispatch.call('setlayers', this, Lg.layers());
    });
  }

  function updateYear (y) {
    if (y == year) return;
    year = y;
    $('.legend-contents').empty();
    $.getJSON(server + 'layers/' + year, function(layersJson) {
      $.getJSON(server + 'plans/' + year, function(plansJson) {
        layers = layersJson;
        plans = plansJson;
        _.each(layersJson, function (category, categoryName) {
          let cat = $('<div>').attr('class', 'legend-category').appendTo('.legend-contents');
          $('<div>').attr('class', 'category-title').html(categoryName.toUpperCase()).appendTo(cat);
          _.each(category, function (obj) { // there's an extra level here
            _.each(obj, function (group, groupName) {
              let gr = $('<div>').attr('class', 'legend-group').attr('data-group', groupName).appendTo(cat);
              let groupTitle = $('<div>').attr('class', 'group-title').appendTo(gr);
              $('<label>')
                .html(names[groupName.toLowerCase()] || groupName)
                .prepend('<input type="checkbox" value="' + groupName + '"checked>')
                .appendTo(groupTitle);
              _.each(group.features, function (feature) {
                let layer = $('<div>').attr('class', 'layer').appendTo(gr);
                addLayerExisting(feature, layer);
                let plan = getPlansForLayer(feature);
                if (plan) {
                  addLayerPlanned(feature, layer, plan);
                }
              });
              // plans for layers not currently existing
              // if (plansJson['Planned' + groupName]) {
              //   _.each(plansJson['Planned' + groupName], function (plan) {
              //     if (_.contains(group.features, plan.featuretyp.replace('Planned', ''))) return;
              //     let layer = $('<div>').attr('class', 'layer').appendTo(gr);
              //     addLayerExisting(plan.featuretyp, layer, true);
              //     addLayerPlanned(plan.featuretyp, layer);
              //   }); 
              // }
              let swatch = add_swatch(group.style).appendTo(groupTitle);
            });
          });
        });

        // plans for groups not currently existing
        // _.each(plansJson, function (planLayer, key) {
        //   if ($('.legend-group[data-group="' + key.replace('Planned', '') + '"]').length) return;
        //   let gr = $('<div>').attr('class', 'legend-group planned').attr('data-group', key).appendTo('.legend-contents');
        //   let groupTitle = $('<div>').attr('class', 'group-title').appendTo(gr);
        //   $('<label>')
        //     .html(names[key.toLowerCase()] || key)
        //     .prepend('<input type="checkbox" checked>')
        //     .appendTo(groupTitle);
        //   _.each(planLayer, function (plan) {
        //     let layer = $('<div>').attr('class', 'layer').appendTo(gr);
        //     addLayerExisting(plan.featuretyp, layer, true);
        //     addLayerPlanned(plan.featuretyp, layer);
        //   })
        // });

        dispatch.call('setlayers', this, Lg.layers());
        dispatch.call('statechange', this);

        if (tempLayers) {
          Lg.layers(tempLayers);
          tempLayers = null;
          dispatch.call('setlayers', this, Lg.layers());
          dispatch.call('statechange', this);
        }
      });
    });
  }

  function getPlansForLayer (layer) {
    if (!plans) return;
    let planArray;
    plans.forEach(function (plan) {
      if (plan.features.indexOf(layer) !== -1) {
        if (!planArray) planArray = [];
        planArray.push(plan);
      }
    });
    return planArray;
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

  function addLayerPlanned (name, container, planArray) {
    let div = $('<div>')
      .attr('class', 'layer-plans')
      .data('name', name)
      .data('plans', _.pluck(planArray, 'name'))
      .html('Plans')
      .prepend('<i class="icon-tsquare">')
      .appendTo(container)
      .click(function(e) {
        e.stopPropagation();
        if ($('.plans-dropdown')[0] && $('.plans-dropdown').data('layer') == name) {
          $('.plans-dropdown').remove();
          $('body').off('click.plans');
          return;
        }
        let menu = $('<div>')
          .attr('class', 'plans-dropdown')
          .data('layer', name)
          .appendTo('main')
        planArray.forEach(function (p) {
          $('<p>')
            .attr('class', 'plan-menu-item' + (div.data('selected-plan') == p.name ? ' highlighted' : ''))
            .html(p.name)
            .appendTo(menu)
            .click(function (e) {
              if (div.data('selected-plan') == p.name) {
                div.data('selected-plan', null);
                dispatch.call('removehighlight', this);
              } else {
                highlightPlan(p.name, name);
                div.addClass('highlighted');
                div.data('selected-plan', p.name);
              }
            });
        });
        if (div.data('selected-plan')) {
          $('<p>')
            .attr('class', 'plan-menu-item')
            .html('<i class="icon-times"></i> Remove plans from map')
            .prependTo(menu)
            .click(function () {
              div.data('selected-plan', null);
              dispatch.call('removehighlight', this);
            })
        }
        if (!mobile) {
          menu
            .css('left', $(this).offset().left + $(this).outerWidth() + 5 + 'px')
            .css('bottom', window.innerHeight - ($(this).offset().top + $(this).outerHeight()));
          } else {
            menu
              .css('top', window.innerHeight / 2 - menu.outerHeight() / 2 + 'px');
          }
        
        $('body').on('click.plans', function () {
          menu.remove();
          $('body').off('click.plans');
        });
      });
  }

  function layerClick () {
    if (!$(this).hasClass('highlighted')) {
      highlightFeature($(this).data('name'));
      $(this).toggleClass('highlighted');
      if (mobile) legend.addClass('collapsed');
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

  function highlightPlan (planName, feature) {
    dispatch.call('removehighlight', this);
    $.getJSON(server + 'plan?name=' + encodeURIComponent(planName) + '&feature=' + feature, function (json) {
      dispatch.call('highlightfeature', this, json);
      if (mobile) legend.addClass('collapsed');
    });
  }

  function add_swatch( style )
  {
    var swatch = $( document.createElement( 'div' ) ).addClass( "swatch" ).addClass(style.shape.slice(0, style.shape.indexOf('.')));
    if( style.shape.match( /svg$/ ) )
    {
      swatch.load( "img/legend/" + style.shape );
    }
    else
    {
      swatch.append(
        $( document.createElement( 'img' ) ).attr( "src", "img/legend/" + style.shape )
      );
    }

    if( style.fill || style.stroke ) swatch.css( style );

    return swatch;
  }

  Lg.addViews = function () {
    let cat = $('<div>').attr('class', 'legend-category').prependTo('.legend-contents');
    $('<div>').attr('class', 'category-title').html('VIEWS').appendTo(cat);
    let gr = $('<div>').attr('class', 'legend-group').attr('data-group', 'views').appendTo(cat);
    let groupTitle = $('<div>').attr('class', 'group-title').appendTo(gr);
    let label = $('<label>')
      .html('Cones of vision')
      .appendTo(groupTitle);
    $('<input type="checkbox" value="views">')
      .attr('checked', Lg.hasViews ? 'checked' : null)
      .on('change', function () {
        if ($(this).is(':checked')) dispatch.call('showviews', this);
        else dispatch.call('hideviews', this);
      })
      .prependTo(label);
    add_swatch({shape:'viewshed.png'}).appendTo(groupTitle);
  }

  Lg.layers = function (list) {
    if (!list) {
      let layers = [];
      $('.legend-contents input').each(function () {
        if (!$(this).is(':checked') && $(this).attr('value') != 'views') {
          layers.push($(this).attr('value'));
        }
      });
      if (!layers.length) layers = ['all'];
      return layers;
    }

    if (!$('.legend-contents input').length) {
      // loaded in from URL before checkboxes exist
      tempLayers = list;
      return Lg;
    }

    if (list[0] == 'all') {
      $('.legend-contents input').attr('checked', 'checked');
      if (!Lg.hasViews) $('input[value="views"]').attr('checked', null);
    } else {
      list.forEach(function (l) {
        $('.legend-group[data-group="' + l + '"] input').attr('checked', null);
      });
    }
    return Lg;
    
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