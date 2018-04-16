const getLegend = (components) => {
  
  const Lg = {};

  const legend = $('#legend');

  let year = 2015;

  let tempLayers;

  Lg.hasViews = true;

  let layers;
  let plans;

  function initEvents() {
    const { dispatch } = components;
    $('.legend-toggle').click(() => {
      legend.toggleClass('collapsed').addClass('subsequent');
    });
    $('.legend-contents').on('change', function onChange() {
      // checkbox clicks
      dispatch.call('setlayers', this, Lg.layers());
    });
  }

  function updateYear(y) {
    const {
      init,
    } = components;
    const {
      server,
    } = init;

    if (y == year) return;
    year = y;
    $('.legend-contents').empty();
    $.getJSON(server + 'layers/' + year, (layersJson) => {
      const { dispatch } = components;
      
      layers = layersJson;
      // plans = plansJson;
      _.each(layersJson, (category, categoryName) => {
        const cat = $('<div>').attr('class', 'legend-category').appendTo('.legend-contents');
        $('<div>').attr('class', 'category-title').html(categoryName.toUpperCase()).appendTo(cat);
        _.each(category, (obj, objName) => { // there's an extra level here
          if (obj.features) addLayerGroup(obj, objName);
          else _.each(obj, addLayerGroup);
      });

        function addLayerGroup(group, groupName) {
          const { names } = init;

          const gr = $('<div>').attr('class', 'legend-group').attr('data-group', groupName).appendTo(cat);
          const groupTitle = $('<div>').attr('class', 'group-title').appendTo(gr);
          $('<label>')
            .html(names[groupName.toLowerCase()] || groupName)
            .prepend('<input type="checkbox" value="' + groupName + '"checked>')
            .appendTo(groupTitle);
          _.each(group.features, (feature, key) => {
            let layer = $('<div>').attr('class', 'layer').appendTo(gr);
            addLayerExisting(feature, key, layer);
            if (feature.style) {
              add_swatch(feature.style).appendTo(layer);
              layer.addClass('styled');
            }
          });

          let swatch = add_swatch(group.style).appendTo(groupTitle);
        }
      });
      dispatch.call('setlayers', this, Lg.layers());
      dispatch.call('statechange', this);

      if (tempLayers) {
        Lg.layers(tempLayers);
        tempLayers = null;
        dispatch.call('setlayers', this, Lg.layers());
        dispatch.call('statechange', this);
      }
    });
  }

  function getPlansForLayer (layer) {
    if (!plans) return;
    let planArray;
    plans.forEach((plan) => {
      if (plan.features.indexOf(layer) !== -1) {
        if (!planArray) planArray = [];
        planArray.push(plan);
      }
    });
    return planArray;
  }

  function addLayerExisting(feature, key, container, notpresent) {
    const name = feature.id ? key : feature;
    const l = $('<div>')
      .attr('class', 'layer-existing')
      .attr('data-name',name)
      .data('name', name)
      .html(name)
      .appendTo(container)
      .prepend('<i class="icon-binoculars">')
      .click(layerClick);
  }

  function layerClick() {
    const { dispatch, init } = components;
    const { mobile } = init;
    if (!$(this).hasClass('highlighted')) {
      highlightFeature($(this).data('name'));
      $(this).toggleClass('highlighted');
      if (mobile) legend.addClass('collapsed');
    } else {
      dispatch.call('removehighlight', this);
    }
  }

  function highlightFeature(feature) {
    const { dispatch, init } = components;
    const { server } = init;
    dispatch.call('removehighlight', this);
    dispatch.call('removeprobe', this);
    $.getJSON(server + 'feature/' + year + '/' + encodeURIComponent(feature), function highlight(json) {
      dispatch.call('highlightfeature', this, json);
    });
  }

  function add_swatch( style )
  {
    if (!style || !style.shape) return $('<div>');
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
    $('.legend-category[data-category="views"]').remove();
    let cat = $('<div>').attr('class', 'legend-category').attr('data-category', 'views').prependTo('.legend-contents');
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
        Lg.hasViews = $(this).is(':checked');
        dispatch.call('statechange', this);
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
    initEvents();

    return Lg;
  }

  Lg.setYear = function (newYear) {
    updateYear(newYear);

    return Lg;
  }

  return Lg;
};

export default getLegend;
