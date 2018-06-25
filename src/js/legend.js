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
      toggleSidebar();
    });
    $('.legend-contents').on('change', function onChange() {
      // checkbox clicks
      dispatch.call('setlayers', this, Lg.layers());
    });
  }

  function toggleSidebar() {
    legend.toggleClass('collapsed').addClass('subsequent');
    resizeLegendButton();
  }

  function openSidebar() {
    if (legend.hasClass('collapsed')) {
      toggleSidebar();
    }
  }

  Lg.closeSidebar = () => {
    $('#legend').addClass('collapsed');
  };
  Lg.openSidebar = openSidebar;

  function drawSidebarContent() {
    const {
      init,
    } = components;
    const {
      server,
    } = init;

    setCurrentPlans();
    resizeLegendButton();

    $('.legend-contents').empty();
    // get layer data
    $.getJSON(`${server}layers/${year}`, (layersJson) => {
      const { dispatch } = components;
      const { names } = init;
      // console.log('names', names);

      layers = layersJson;
      // console.log('legend layers', layersJson);

      _.each(layersJson, (category, categoryName) => {
        const cat = $('<div>')
          .attr('class', 'legend-category')
          .attr('data-category', 'feature')
          .appendTo('.legend-contents');
        // console.log('layers', layersJson);
        // console.log('cat name', categoryName);

        const title = names[categoryName.toLowerCase()].toUpperCase();
        $('<div>')
          .attr('class', 'category-title')
          .html(title)
          .appendTo(cat);

        _.each(category, (obj, objName) => { // there's an extra level here
          if (obj.features) addLayerGroup(obj, objName);
          else _.each(obj, addLayerGroup);
        });

        function addLayerGroup(group, groupName) {
          const { names } = init;

          const value = group.id !== undefined ? group.id :
            [...new Set(Object.keys(group.features).map(d => group.features[d].id))]
              .join('&');

          const gr = $('<div>').attr('class', 'legend-group').attr('data-group', groupName).appendTo(cat);
          const groupTitle = $('<div>').attr('class', 'group-title').appendTo(gr);
          $('<label>')
            // .html(names[groupName.toLowerCase()] || groupName)
            .prepend(`<input type="checkbox" value="${value}"checked>`)
            .appendTo(groupTitle);

          _.each(group.features, (feature, key) => {
            const layer = $('<div>').attr('class', 'layer').appendTo(gr);
            addLayerExisting(feature, key, layer);
            // console.log(feature, key);
            if (feature.style) {
              addSwatch(feature.style).appendTo(layer);
              layer.addClass('styled');
            }
          });
          // console.log('group', group);

          addSwatch(group.style).appendTo(groupTitle);

          $('<div>')
            .attr('class', 'group-name')
            .html(names[groupName.toLowerCase()] || groupName)
            .appendTo(groupTitle);
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
      if (plans.length > 0) {
        addPlans();
      }
    });
  }

  function updateYear(y) {
    if (y === year) return;
    year = y;
  }

  function addPlans() {
    const {
      dispatch,
      translations,
      init,
    } = components;

    const { language } = init;

    const cat = $('<div>')
      .attr('class', 'legend-category')
      .attr('data-category', 'feature')
      .prependTo('.legend-contents');
    

    $('<div>')
      .attr('class', 'category-title')
      .html(translations.find(d => d.name === 'plans')[language].toUpperCase())
      .appendTo(cat);
    

    plans.forEach((plan) => {
      const row = $('<div>').attr('class', 'search-result plan-legend-row')
        .append('<i class="icon-right-dir"></i>')
        .append('<i class="icon-down-dir"></i>')
        .appendTo(cat);

      $(`<span>${plan.planname}</span>`)
        .appendTo(row)
        .on('click', function click() {
          if (!row.hasClass('selected')) {
            $('.search-result.selected').removeClass('selected');
            row.addClass('selected');
            if (!row.hasClass('expanded')) $(this).prev().click();
            dispatch.call('drawplanfeature', this, plan);
          } else {
            row.removeClass('selected');
            if (row.hasClass('expanded')) $(this).prev().click();
            dispatch.call('removehighlight', this);
          }
        })
        .prepend('<i class="icon-binoculars">');

      $('i.icon-right-dir, i.icon-down-dir', row).on('click', () => {
        if (row.hasClass('expanded')) {
          row.removeClass('expanded');
        } else {
          row.addClass('expanded');
          if (!$('.result-details', row).length) {
            const details = $('<div>')
              .attr('class', 'result-details')
              .appendTo(row);
            details.html(plan.planyear);
          }
        }
      });
    });
  }

  function setCurrentPlans() {
    const { init } = components;
    // filter to find plans for selected year
    plans = init.plans.filter((d) => {
      if (d.years.length === 1) {
        return d.years[0] === year;
      }
      return d.years[0] <= year && d.years[1] >= year;
    });
  }

  function getPlansForLayer(layer) {
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
    const { init } = components;
    const { names } = init;

    const name = feature.id ? key : feature;
    // console.log(names[name.toLowerCase()]);
    const l = $('<div>')
      .attr('class', 'layer-existing')
      .attr('data-name', name)
      .data('name', name)
      .html(names[name.toLowerCase()])
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

  function addSwatch(style) {
    if (!style || !style.shape) {
      return $('<div>');
    }
    // console.log(style);
    const swatch = $('<div>')
      .addClass('swatch')
      .css({ float: 'right' })
      .addClass(style.shape.slice(0, style.shape.indexOf('.')));
    
    if (style.shape.match(/svg$/)) {
      swatch.load(`img/legend/${style.shape}`);
    } else {
      swatch
        .append($('<img>').attr('src', `img/legend/${style.shape}`));
    }

    if (style.fill || style.stroke) {
      swatch.css(style);
    }

    return swatch;
  }

  Lg.addSwatch = addSwatch;

  Lg.addViews = () => {
    const { dispatch, init } = components;
    const { language } = init;
    $('.legend-category[data-category="views"]').remove();
    const cat = $('<div>')
      .attr('class', 'legend-category')
      .attr('data-category', 'views')
      .prependTo('.legend-contents');

    const title = language === 'en' ? 'VIEWS' : 'VISTAS';
    $('<div>')
      .attr('class', 'category-title')
      .html(title)
      .appendTo(cat);

    const gr = $('<div>')
      .attr('class', 'legend-group')
      .attr('data-group', 'views')
      .appendTo(cat);

    const groupTitle = $('<div>')
      .attr('class', 'group-title')
      .appendTo(gr);

    const label = $('<label>')
      .html('Cones of vision')
      .appendTo(groupTitle);

    $('<input type="checkbox" value="views">')
      .attr('checked', Lg.hasViews ? 'checked' : null)
      .on('change', function onChange() {
        if ($(this).is(':checked')) dispatch.call('showviews', this);
        else dispatch.call('hideviews', this);
        Lg.hasViews = $(this).is(':checked');
        dispatch.call('statechange', this);
      })
      .prependTo(label);
    addSwatch({ shape: 'viewshed2.png' })
      .appendTo(groupTitle);
    $('img', groupTitle).addClass('viewshed-icon');
    // Lg.addSearch();
  };

  Lg.layers = function lgLayers(list) {
    // if no list is provided
    if (!list) {
      let layers = [];
      $('.legend-contents input').each(function checked() {
        if (!$(this).is(':checked') &&
          $(this).attr('value') !== 'views' &&
          $(this).attr('class') !== 'search-input') {
          $(this).attr('value')
            .split('&')
            .forEach((layer) => {
              layers.push(layer);
            });
          // layers.push($(this).attr('value'));
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

    if (list[0] === 'all') {
      $('.legend-contents input').attr('checked', 'checked');
      if (!Lg.hasViews) $('input[value="views"]').attr('checked', null);
    } else {
      list.forEach((l) => {
        $('.legend-group[data-group="' + l + '"] input').attr('checked', null);
      });
    }
    return Lg;
  };

  Lg.getLayersData = () => layers;

  function resizeLegendButton() {
    const { init } = components;
    const { language, mobile } = init;
    const legendButton = $('#legend .legend-toggle');
    if (mobile) return;
    if (!$('#legend').hasClass('subsequent')) {
      const width = language === 'pr' ? '170px' : '160px';
      
      legendButton.css({ width });
    } else {
      legendButton.css({ width: '10px' });
    }
  }

  Lg.initialize = () => {
    initEvents();
    return Lg;
  };

  Lg.setYear = (newYear) => {
    updateYear(newYear);
    drawSidebarContent();
    return Lg;
  };

  Lg.updateLanguage = () => {
    drawSidebarContent();
    return Lg;
  };

  return Lg;
};

export default getLegend;
