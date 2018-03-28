let Filmstrip = (function($, _, dispatch) {
  
  let F = {};

  let filmstrip = $('#filmstrip');
  let rasters = [];
  let photos = [];
  let year = 2015;
  let maxYear;

  let allRasters = {};

  let selectedType = 'viewsheds';

  let tempRaster;

  function init_events () {
    $('.filmstrip-toggle').click(function () {
      if (!mobile)
        filmstrip.toggleClass('collapsed');
      else 
        filmstrip.toggleClass('partial');
    });

    $('.raster-types i').click(filterTypes);

    $('.filmstrip-showall').click(showAll);
  }

  function updateYear (y, max) {
    year = y;
    maxYear = max;
    rasters = [];
    $.getJSON(server + 'raster/' + year + (max ? ('?max=' + max) : ''), function(json) {
      filmstrip.show();
      json = _.reject(json, function(r){ return r.id === null });
      $('.mini-thumbs', filmstrip).empty();
      $('.filmstrip-thumbnails').empty();
      if (!json.length) {
        $('.filmstrip-showall').hide();
        $('.raster-types i.selected').removeClass('selected');
        $('.filmstrip-thumbnails').append('<p class="no-data">No views, maps, plans, or aerials are available for this year.</p>')
        $('.filmstrip-toggle span', filmstrip).html('<em>NONE</em>');
        filmstrip.addClass('collapsed')
      }
      else {
        $('.filmstrip-showall').show();
        _.each(json, function (r) {
          if (!allRasters[r.id]) {
            allRasters[r.id] = r;
            r.photo = Photo(r, thumbnaillUrl);
            r.overlay = Overlay(r);
          }
          rasters.push(allRasters[r.id]);
        });
        let minis = rasters.slice(0, Math.min(3, rasters.length));
        _.each(minis, function (m) {
          m.photo.getImage([20])
            .appendTo($('.mini-thumbs', filmstrip));
        });
        showThumbs();
      }
      $('.icon-camera, .raster-type-labels span.views', filmstrip).toggleClass('disabled', !_.some(rasters, function(r){ return r.layer === 'viewsheds'}));
      $('.icon-survey, .raster-type-labels span.surveys', filmstrip).toggleClass('disabled', !_.some(rasters, function(r){ return r.layer === 'surveys'}));
      $('.icon-tsquare, .raster-type-labels span.plans', filmstrip).toggleClass('disabled', !_.some(rasters, function(r){ return r.layer === 'plans'}));
      $('.icon-map-o, .raster-type-labels span.maps', filmstrip).toggleClass('disabled', !_.some(rasters, function(r){ return r.layer === 'maps'}));
      
      if (!$('.icon-camera, .raster-type-labels span.views', filmstrip).hasClass('disabled')) dispatch.call('addviews', this);
      else dispatch.call('resetviews', this);
      
      if ($('.raster-types i.selected', filmstrip).hasClass('disabled') || !$('.raster-types i.selected', filmstrip).length) $('.raster-types i').not('.disabled').first().click();
      
      if (tempRaster) {
        F.setRaster(tempRaster);
        tempRaster = null;
        dispatch.call('statechange', this);
      }
    });
  }

  function filterTypes (e) {
    if ($(e.target).hasClass('disabled')) return;
    $('.raster-types i.selected').removeClass('selected');
    let c = $(e.target).attr('class');
    let type = $(e.target).attr('data-layer');
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

  function showThumbs () {
    $('.filmstrip-thumbnails').empty();
    let title = selectedType == 'viewsheds' ? 'views' : selectedType;
    $('.filmstrip-toggle span', filmstrip).html('Historical Overlays (' + formatYear(year) + (maxYear !== undefined ? (' – ' + formatYear(maxYear)) : '') + ')');
    let photos = _.chain(rasters)
      .filter(function(r){ return r.layer === selectedType })
      .sortBy('date')
      .pluck('photo')
      .value();
    photos.forEach(function (p) {
      addPhoto(p, $('.filmstrip-thumbnails'));
    });
  }

  function addPhoto (p, container) {
    let thumb = p.getImage([130])
      .attr('class', 'filmstrip-thumbnail')
      .attr('data-raster', p.data.id)
      .data('p', p)
      .click(function () {
        if (!p.metadata.width) return;
        if ($('main').hasClass('eras')) dispatch.call('setyear', this, p.data.date);
        if (p.data.layer != 'viewsheds') {
          dispatch.call('addoverlay', this, p);
        } else {
          rasterProbe(p);
        }
      })
      .mouseover(function () {
        filmstripProbe.call(this, p);
      })
      .mouseout(function () {
        $('#filmstrip-probe').hide();
      });
    container.append(thumb);
    return thumb;
  }

  function showAll () {
    filmstrip.removeClass('partial');
    $('.lightbox').css('display', 'flex');
    $('.lightbox .content > div').remove();
    let container = $('<div>').attr('class', 'all-thumbs').appendTo('.lightbox .content');
    let rast = _.chain(rasters)
      .sortBy('date')
      .value();
    let groups = _.groupBy(rast, 'layer');
    if (groups.viewsheds) addThumbSection(groups.viewsheds, 'Views', 'icon-camera', container);
    if (groups.maps) addThumbSection(groups.maps, 'Maps', 'icon-map-o', container);
    if (groups.plans) addThumbSection(groups.plans, 'Plans', 'icon-tsquare', container);
    if (groups.surveys) addThumbSection(groups.surveys, 'Surveys', 'icon-survey', container);
  }

  function addThumbSection (group, title, icon, container) {
    let section = $('<div>').attr('class', 'thumbs-section').appendTo(container);
      $('<p>').attr('class', 'thumbs-title')
        .html(' ' + title + ' (' + year + ')')
        .prepend('<i class="' + icon + '"></i>')
        .appendTo(section)
      let photos = _.pluck(group, 'photo');
      photos.forEach(function (p) {
        addPhoto(p, section);
      });
  }

  F.initialize = function () {
    init_events();

    return F;
  }

  F.setYear = function (newYear, maxYear) {
    updateYear(newYear, maxYear);

    return F;
  }

  F.getRasters = function () {
    return rasters;
  }

  F.setRaster = function (id) {
    if (!rasters.length) {
      // loaded in from URL before data exists
      tempRaster = id;
      return F;
    }
    let raster = _.find(rasters, function(rast){ return rast.id == id });
    if (raster) {
      if (!$('.raster-types i[data-layer="' + raster.layer + '"]').hasClass('selected')) {
        $('.raster-types i[data-layer="' + raster.layer + '"]').click();
        dispatch.call('addoverlay', this, $('.filmstrip-thumbnail[data-raster="' + raster.id + '"]').data('p'));
      }
    }
  }

  return F;
})(jQuery, _, Dispatch);