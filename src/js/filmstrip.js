const getFilmstrip = (components) => {
  const F = {};

  const filmstrip = $('#filmstrip');
  let rasters = [];
  const photos = [];
  let year = 2015;
  let maxYear;

  const allRasters = {};

  let selectedType = 'viewsheds';

  let tempRaster;

  function initEvents() {
    const { init } = components;
    const { mobile } = init;
    $('.filmstrip-toggle').click(() => {
      if (!mobile) {
        filmstrip.toggleClass('collapsed');
      } else {
        filmstrip.toggleClass('partial');
      }
    });

    $('.raster-types i').click(filterTypes);

    $('.filmstrip-showall').click(showAll);
  }

  function updateYear(y, max) {
    const {
      init,
      dispatch,
    } = components;
    const {
      server,
      thumbnaillUrl,
    } = init;
    year = y;
    maxYear = max;
    // clear current rasters
    rasters = [];
    const rasterUrl = `${server}raster/${year}${(max ? (`?max=${max}`) : '')}`;
    console.log(`${server}raster/${year}${(max ? (`?max=${max}`) : '')}`);
    // console.log('rasterUrl', `${server}raster/${year}${(max ? (`?max=${max}`) : '')}`);
    $.getJSON(rasterUrl, (json) => {
      const {
        Photo,
        Overlay,
      } = components;
      filmstrip.show();
      json = _.reject(json, r => r.id === null);

      $('.mini-thumbs', filmstrip).empty();
      $('.filmstrip-thumbnails').empty();
      // if no rasters
      if (!json.length) {
        $('.filmstrip-showall').hide();
        $('.raster-types i.selected').removeClass('selected');
        $('.filmstrip-thumbnails').append('<p class="no-data">No views, maps, plans, or aerials are available for this year.</p>')
        $('.filmstrip-toggle span', filmstrip).html('<em>NONE</em>');
        filmstrip.addClass('collapsed');
      } else {
        $('.filmstrip-showall').show();
        _.each(json, (r) => {
          if (!allRasters[r.id]) {
            // if allRasters doesn't have item, add
            allRasters[r.id] = r;
            // add photo and overlay to item
            r.photo = Photo(r, thumbnaillUrl);
            r.overlay = Overlay(r);
          }
          // add to current rasters
          rasters.push(allRasters[r.id]);
        });
        // copy raster. Max 3 for mini icon display
        const minis = rasters.slice(0, Math.min(3, rasters.length));
        // console.log('rasters', rasters);
        _.each(minis, (m) => {
          // [20] -- Image size
          m.photo.getImage([20])
            .appendTo($('.mini-thumbs', filmstrip));
        });
        showThumbs();
      }
      $('.icon-camera, .raster-type-labels span.views', filmstrip)
        .toggleClass('disabled', !_.some(rasters, r => r.layer === 'viewsheds'));
      $('.icon-flight, .raster-type-labels span.surveys', filmstrip)
        .toggleClass('disabled', !_.some(rasters, r => r.layer === 'surveys'));
      $('.icon-tsquare, .raster-type-labels span.plans', filmstrip)
        .toggleClass('disabled', !_.some(rasters, r => r.layer === 'plans'));
      $('.icon-map-o, .raster-type-labels span.maps', filmstrip)
        .toggleClass('disabled', !_.some(rasters, r => r.layer === 'maps'));

      // This is here because adding views to legend needs to happen after raster is loaded
      // Need to replace with centralized state management system

      // if not disabled, add views to legend
      if (!$('.icon-camera, .raster-type-labels span.views', filmstrip).hasClass('disabled')) {
        dispatch.call('addviews', this);
      } else {
        dispatch.call('resetviews', this);
      }
      
      // open first filmstrip category that isn't disabled (???)
      if ($('.raster-types i.selected', filmstrip).hasClass('disabled') || !$('.raster-types i.selected', filmstrip).length) {
        $('.raster-types i').not('.disabled').first().click();
      }
      
      if (tempRaster) {
        F.setRaster(tempRaster);
        tempRaster = null;
        dispatch.call('statechange', this);
      }
    });
  }

  function filterTypes(e) {
    const { init } = components;
    const { mobile } = init;
    if ($(e.target).hasClass('disabled')) return;
    $('.raster-types i.selected').removeClass('selected');
    const c = $(e.target).attr('class');
    const type = $(e.target).attr('data-layer');
    selectedType = type;
    if (e.originalEvent) {
      if (mobile) {
        showAll();
        $('.all-thumbs').scrollTop($('.' + c, '.lightbox .content').position().top);
        return;
      }
    }
    showThumbs();
    $(e.target).addClass('selected');
  }

  function showThumbs() {
    const { init } = components;
    const { formatYear } = init;
    $('.filmstrip-thumbnails').empty();
    const title = selectedType == 'viewsheds' ? 'views' : selectedType;
    $('.filmstrip-toggle span', filmstrip).html('Historical Overlays (' + formatYear(year) + (maxYear !== undefined ? (' – ' + formatYear(maxYear)) : '') + ')');
    const photosInner = _.chain(rasters)
      .filter(r => r.layer === selectedType)
      .sortBy('date')
      .pluck('photo')
      .value();
    photosInner.forEach((p) => {
      addPhoto(p, $('.filmstrip-thumbnails'));
    });
  }

  function addPhoto(p, container) {
    const {
      probes,
      dispatch,
    } = components;
    const {
      filmstripProbe,
      rasterProbe,
    } = probes;
    const thumb = p.getImage([130])
      .attr('class', 'filmstrip-thumbnail')
      .attr('data-raster', p.data.id)
      .data('p', p)
      .click(function click() {
        // checking if width is undefined or 0?
        if (!p.metadata.width) return;
        if ($('main').hasClass('eras')) dispatch.call('setyear', this, p.data.date);
        if (p.data.layer !== 'viewsheds') {
          dispatch.call('addoverlay', this, p);
        } else {
          rasterProbe(p);
        }
      })
      .mouseover(function mouseover() {
        filmstripProbe.call(this, p);
      })
      .mouseout(() => {
        $('#filmstrip-probe').hide();
      });
    container.append(thumb);
    return thumb;
  }

  function showAll() {
    filmstrip.removeClass('partial');
    $('.lightbox').css('display', 'flex');
    $('.lightbox .content > div').remove();
    const container = $('<div>').attr('class', 'all-thumbs').appendTo('.lightbox .content');
    const rast = _.chain(rasters)
      .sortBy('date')
      .value();

    const groups = _.groupBy(rast, 'layer');

    if (groups.viewsheds) addThumbSection(groups.viewsheds, 'Views', 'icon-camera', container);
    if (groups.maps) addThumbSection(groups.maps, 'Maps', 'icon-map-o', container);
    if (groups.plans) addThumbSection(groups.plans, 'Plans', 'icon-tsquare', container);
    if (groups.surveys) addThumbSection(groups.surveys, 'Surveys', 'icon-flight', container);
  }

  function addThumbSection(group, title, icon, container) {
    const section = $('<div>').attr('class', 'thumbs-section').appendTo(container);
    $('<p>').attr('class', 'thumbs-title')
      .html(' ' + title + ' (' + year + ')')
      .prepend('<i class="' + icon + '"></i>')
      .appendTo(section)
    const innerPhotos = _.pluck(group, 'photo');
    innerPhotos.forEach((p) => {
      addPhoto(p, section);
    });
  }

  F.initialize = () => {
    initEvents();

    return F;
  };

  F.setYear = (newYear, maxYear2) => {
    updateYear(newYear, maxYear2);

    return F;
  };

  F.getRasters = () => rasters;

  F.setRaster = (id) => {
    const { dispatch } = components;
    if (!rasters.length) {
      // loaded in from URL before data exists
      tempRaster = id;
      return F;
    }
    const raster = _.find(rasters, rast => rast.id == id);
    if (raster) {
      if (!$('.raster-types i[data-layer="' + raster.layer + '"]').hasClass('selected')) {
        $('.raster-types i[data-layer="' + raster.layer + '"]').click();
        dispatch.call('addoverlay', this, $('.filmstrip-thumbnail[data-raster="' + raster.id + '"]').data('p'));
      }
    }
  };

  return F;
};

export default getFilmstrip;
