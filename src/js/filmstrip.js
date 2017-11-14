let Filmstrip = (function($, _, dispatch) {
  
  let F = {};

  let filmstrip = $('#filmstrip');
  let rasters = [];
  let photos = [];
  let year = 2015;

  let selectedType = 'viewsheds';

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
    $.getJSON(server + 'raster/' + year + (max ? ('?max=' + max) : ''), function(json) {
      filmstrip.show();
      rasters = _.reject(json, function(r){ return r.id === null });
      $('.mini-thumbs', filmstrip).empty();
      $('.filmstrip-thumbnails').empty();
      if (!rasters.length) {
        $('.filmstrip-showall').hide();
        $('.raster-types i.selected').removeClass('selected');
        $('.filmstrip-thumbnails').append('<p class="no-data">No views, maps, plans, or aerials are available for this year.</p>')
        $('.filmstrip-toggle span', filmstrip).html('<em>NONE</em>');
      }
      else {
        $('.filmstrip-showall').show();
        _.each(rasters, function (r) {
          r.photo = Photo(r, thumbnaillUrl);
          r.overlay = Overlay(r);
        });
        let minis = rasters.slice(0, Math.min(3, rasters.length));
        _.each(minis, function (m) {
          m.photo.getImage([20])
            .appendTo($('.mini-thumbs', filmstrip));
        })
      }
      $('.icon-camera, .raster-type-labels span.views', filmstrip).toggleClass('disabled', !_.some(rasters, function(r){ return r.layer === 'viewsheds'}));
      $('.icon-flight, .raster-type-labels span.aerials', filmstrip).toggleClass('disabled', !_.some(rasters, function(r){ return r.layer === 'aerials'}));
      $('.icon-tsquare, .raster-type-labels span.plans', filmstrip).toggleClass('disabled', !_.some(rasters, function(r){ return r.layer === 'plans'}));
      $('.icon-map-o, .raster-type-labels span.maps', filmstrip).toggleClass('disabled', !_.some(rasters, function(r){ return r.layer === 'maps'}));
      showThumbs();
      if ($('.raster-types i.selected', filmstrip).hasClass('disabled') || !$('.raster-types i.selected', filmstrip).length) $('.raster-types i').not('.disabled').first().click();
    });
  }

  function filterTypes (e) {
    if ($(e.target).hasClass('disabled')) return;
    $('.raster-types i.selected').removeClass('selected');
    let c = $(e.target).attr('class');
    let type;
    if (c == 'icon-camera') type = 'viewsheds';
    else if (c == 'icon-flight') type = 'aerials';
    else if (c == 'icon-tsquare') type = 'plans';
    else if (c == 'icon-map-o') type = 'maps';
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
    $('.filmstrip-toggle span', filmstrip).html(title.toUpperCase());
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
    if (groups.aerials) addThumbSection(groups.aerials, 'Aerials', 'icon-flight', container);
  }

  function addThumbSection (group, title, icon, container) {
    let section = $('<div>').attr('class', 'thumbs-section').appendTo(container);
      $('<p>').attr('class', 'thumbs-title')
        .html(' ' + title)
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
   // updateYear(newYear, maxYear);

    return F;
  }

  F.getRasters = function () {
    return rasters;
  }

  return F;
})(jQuery, _, Dispatch);