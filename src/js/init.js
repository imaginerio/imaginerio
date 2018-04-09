let server = 'https://instituterice.axismaps.io/';
let tileserver = 'https://instituterice.axismaps.io/tiles/';
let rasterserver = 'https://instituterice.axismaps.io/raster/';

const thumbnaillUrl = 'https://mdxdv.artstor.org/thumb/imgstor/size1/sslps/c7730355/';
const imageUrl = 'https://mdxdv.artstor.org/thumb/imgstor/size2/sslps/c7730355/';

var years;
var year;

var names;

var currentEra = eras[0];

let params = {};

(function($){
  $.event.special.destroyed = {
    remove: function(o) {
      if (o.handler) {
        o.handler()
      }
    }
  }
})(jQuery)

// runtime stuff

var mobile = window.innerWidth <= 700;

if( gup( 'dev' ) == 'true' ){
  server = "http://instituterice-dev.axismaps.io/";
  tileserver = "http://instituterice-dev.axismaps.io/tiles/";
  rasterserver = "http://instituterice-dev.axismaps.io/raster/";
}

$.getJSON(server + 'timeline', function(yearsData) {
  years = yearsData;
  while (years[0] < eras[0].dates[0]) years.shift();  // force min year and first era to match
  if (names) initialize();
});
$.getJSON(server + 'names/en', function(namesData) {
  names = namesData;
  if (years) initialize();
});

function initialize () {
  eras[eras.length-1].dates[1] = new Date().getFullYear();
  check_hash();
  year = params.year || 1912; // a year that actually has something
  Map.initialize('map').setYear(year);
  Timeline.initialize([eras[0].dates[0], eras[eras.length-1].dates[1]], eras, 'timeline').setYear(year);
  Filmstrip.initialize();//.setYear(year);
  Legend.initialize().setYear(year);
  Search.initialize('search').setYear(year);
  init_ui();
  updateEra();

  if (params.year) {
    Filmstrip.setYear(year);
    $('main').removeClass('eras');
  }

  if (params.zoom) {
    Map.setView(params.center, params.zoom);
  }
  if (params.layers) {
    let v = false;
    if (params.layers.indexOf('views') != -1) {
      v = true;
      params.layers.splice(params.layers.indexOf('views'), 1);
      if (!params.layers.length) params.layers = ['all'];
    }
    Legend.layers(params.layers);
    if (v) {
      $('input[value="views"]').attr('checked', null);
      Legend.hasViews = false;
      Map.hideViews();
    }
  }
  if (params.raster) {
    Filmstrip.setRaster(params.raster);
  }
}

function init_ui () {
  if (mobile) {
    $('#legend .mobile-header .icon-times').click(function () {
      $('#legend').toggleClass('collapsed');
    });
    $('#search .icon-left-big').click(function () {
      if ($('main').hasClass('eras')) {
        goToStart();
        return;
      }
      Search.clear();
      $('header').removeClass('search');
    });
    $('#filmstrip').addClass('collapsed').insertBefore('#map');
    $('#era-tags').appendTo('.start-intro-second');
  } else {
    $('.mobile').hide();
  }
  $('#search-button').click(function (e) {
    e.stopPropagation();
    $('header').addClass('search');
    $('#search input').focus();
    $(document).on('click.search', function (e) {
      if (!$.contains(document.getElementById('search'), e.target)) {
        Search.clear();
        $('header').removeClass('search');
        $(document).off('click.search');
      }
    });
  });

  $('#fixed-probe .icon-times').click(function () {
    $('#fixed-probe').hide();
    Dispatch.call('removehighlight', this);
    Map.clearSelected();
  });

  $('.lightbox').click(function (e) {
    // close on background click except when uploading memory (too easy/annoying to close by accident)
    if ((e.target == this && !$('.lightbox .add-memory')[0]) || $(e.target).hasClass('icon-times')) {
      $('.lightbox').hide();
      Dispatch.call('cancelmemory', this);
    } 
  });

  eras.forEach(function (e, i) {
    let div = $('<div>').attr('class', 'era-tag')
      .click(function () {
        showEra(i, true);
      });
    $('<p>').html(e.name + ' (' + e.dates.join(' – ') + ')').appendTo(div);
    div.appendTo('#era-tags');
  });

  $('#era-stepper .icon-angle-left').click(function (){
    if ($(this).hasClass('disabled')) return;
    showEra(+$('#intro').data('era') - 1);
  });

  $('#era-stepper .icon-angle-right').click(function (){
    if ($(this).hasClass('disabled')) return;
    showEra(+$('#intro').data('era') + 1);
  });

  $('.go-button').on('click', goButtonClick);

  $('#eras-button').click(function () {
    if ($('main').hasClass('eras')) {
      goToStart();
      return;
    }
    Dispatch.call('removeall', this);
    Dispatch.call('removeoverlay', this);
    $('main').addClass('eras');
    $('#legend').addClass('collapsed');
    showEra(eras.indexOf(currentEra), true);
  });

  $('#overlay-info').click(function () {
    rasterProbe($(this).data('p'));
  });

  $('.search-results .icon-times').click(function () {
    Search.clear();
  });

  $('#export').click(export_map);
}

function goButtonClick () {
  if ($('main').hasClass('second') || !mobile) goToMap();
  else {
    $('main').addClass('second');
    $('.go-button').html('Go to Map');
  }
}

function goToStart () {
  $('main').addClass('start').removeClass('second');
  $('.title-container h1').html('instituteRice');
  $('.go-button')
    .html('Begin Exploring')
    .removeClass('era')
    .off('click')
    .on('click', goButtonClick);
  window.location.hash = '';
}

function goToMap () {
  Dispatch.call('setyear', this, year);
  $('main').removeClass('eras').removeClass('start');
  update_hash();
  updateEra();
}

function updateEra () {
  eras.forEach(function (e) {
    if (year >= e.dates[0] && year <= e.dates[1]) {
      currentEra = e;
      $('#eras-button div.desktop span').html(e.name);
    }
  });
}

function showEra (i, noTransition) {
  $('main').removeClass('start');
  $('#eras-button div.desktop span').html('start');
  let e = eras[i];
  Filmstrip.setYear(e.dates[0], e.dates[1]);
  Map.setYear(e.dates[0]);
  
  if (noTransition) {
    $('.era-intro .era-description-inner').remove();
    $('<div class="era-description-inner">')
      .append('<p class="era-description">' + e.description + '<p>')
      .appendTo('.era-description-container')
      .css('margin-left', '0%');
    $('.era-years').html(e.dates.join(' – '))
      .css('margin-left', '0%');
    $('#intro h1').html(e.name)
      .css('margin-left', '0%');
  } else {
    let dur = 500;
    let endOld = i < $('#intro').data('era') ? '100%' : '-100%';
    let startNew = i < $('#intro').data('era') ? '-100%' : '0%';
    let newDesc = $('<div class="era-description-inner">')
       .append('<p class="era-description">' + e.description + '<p>')
       .css('margin-left', startNew);
    let newYear = $('<p class="era-years">')
       .html(e.dates.join(' – '))
       .css('margin-left', startNew);
    let newTitle = $('<h1>' + e.name + '</h1>')
      .css('margin-left', startNew);
    if (startNew == '-100%') {
      newDesc.prependTo('.era-description-container')
        .animate({
           'margin-left': '0%'
        }, dur, function () {
          $('.era-description-inner').last().remove();
        });
      newYear.prependTo('.era-years-container')
        .animate({
           'margin-left': '0%'
        }, dur, function () {
          $('.era-years').last().remove()
        });
      newTitle.prependTo('.title-container')
        .animate({
           'margin-left': '0%'
        }, dur, function () {
          $('.title-container h1').last().remove()
        });
    } else {
      $('.era-description-inner').last()
        .animate({
          'margin-left': endOld
        }, dur, function () {
          $(this).remove();
        });
      $('.era-years').last()
        .animate({
          'margin-left': endOld
        }, dur, function () {
          $(this).remove();
        });
      $('.title-container h1').last()
        .animate({
          'margin-left': endOld
        }, dur, function () {
          $(this).remove();
        });
      newDesc.appendTo('.era-description-container');
      newYear.appendTo('.era-years-container');
      newTitle.appendTo('.title-container');
    }
  }
  
  $('.go-button').html('Go to Map').toggleClass('era', !mobile)
    .off('click')
    .on('click', function () {
      goToEra(e);
    });
  $('#intro').data('era', i);
  $('#era-stepper .icon-angle-left').toggleClass('disabled', (i == 0));
  $('#era-stepper .icon-angle-right').toggleClass('disabled', (i == eras.length-1));
}

function goToEra (e) {
  $('main').removeClass('eras');
  Dispatch.call('setyear', this, e.dates[0]);
  update_hash();
}

function showAddMemory (lat, lng) {

  $('.lightbox').css('display', 'flex');
  $('.lightbox .content > div').remove();
  let div = $('.add-memory').clone().appendTo('.lightbox .content');
  div.data('latlng', [lat,lng]);
  let data;
  $('textarea, input', div).on('keyup', function () {
    data = {
      story: $('.lightbox .memory-story').val(),
      name: $('.lightbox .memory-name').val(),
      email: $('.lightbox .memory-email').val(),
      class: $('.lightbox .memory-class').val(),
      lat: lat,
      lng: lng
    }
    $('.memory-submit', div).toggleClass('disabled', !data.story || !data.name || !data.email);
  });
  $('.memory-submit', div).click(function () {
    if ($(this).hasClass('disabled')) return;
    // submit form
    let data = {
      story: $('.lightbox .memory-story').val(),
      name: $('.lightbox .memory-name').val(),
      email: $('.lightbox .memory-email').val(),
      class: $('.lightbox .memory-class').val(),
      lat: lat,
      lng: lng,
      year: year
    }
    $.post(server + 'memory', data, function (response) {
      $('.lightbox').hide();
      Dispatch.call('cancelmemory', this);
    });
  });
  //div.append('<iframe class="airtable-embed" src="https://airtable.com/embed/shra9blqc8Ab48RaN?backgroundColor=blue" frameborder="0" onmousewheel="" width="100%" height="100%" style="background: transparent;"></iframe>');
}

$('#add-memory-button').click(function () {
  $('.memory-icon').show();
});

function gup (name) {
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return results[1];
}

function check_hash () {
  var hash = window.location.hash.replace( '#', '' ).replace(/\?.+$/, '').split( '/' );
  params.year = hash[ 0 ] ? parseInt( hash[ 0 ], 10 ) : '';
  params.zoom = hash[ 1 ] ? parseInt( hash[ 1 ] ) : '';
  params.center = hash[ 2 ] && hash[ 3 ] ? [ parseFloat( hash[ 2 ] ), parseFloat( hash[ 3 ] ) ] : '';
  params.layers = hash[ 4 ] ? hash[ 4 ].split( '&' ) : [];
  params.raster = hash[ 5 ] ? hash[ 5 ] : '';
}

function update_hash () {
  if ($('main').hasClass('eras')) {
    window.location.hash = '';
    return;
  }
  let layers = Legend.layers();
  if (!Legend.hasViews) {
    if (layers[0] == 'all') layers = ['views'];
    else layers.push('views');
  }
  layers = layers.join('&');
  let raster = $('#overlay-info').data('p') ? $('#overlay-info').data('p').data.id : '';

  let mapView = Map.getView();

  window.location.hash = year + "/" + mapView[1] + "/" + mapView[0].lat + "/" + mapView[0].lng + "/" + layers + "/" + raster;

  $('.twitter').attr('href', $('.twitter').attr('data-href') + 'text=instituteRice' + '&url=' + encodeURIComponent(window.location.href));
  $('.fb-share-btn').attr('href', $('.fb-share-btn').attr('data-href') + '&u=' + encodeURIComponent(window.location.href));
  // Update Social Media links
  //$( '.twitter-button a' ).attr( 'href', 'https://twitter.com/intent/tweet?url=' + encodeURIComponent( window.location.href ) );

 // $( '.facebook-button a' ).attr('href', 'http://www.facebook.com/sharer/sharer.php?u=imaginerio.org/' + encodeURIComponent( window.location.hash ) + '&title=Imagine Rio');
}

function export_map () {
  $( '#export' ).attr('class', 'icon-circle-notch animate-spin');
  let layers = Legend.layers().sort().join( ',' );
  let raster = $('#overlay-info').data('p') ? $('#overlay-info').data('p').data.file : 'null';
  var url = server + 'export/en/' + year + '/' + layers + '/' + raster + '/' + Map.getBounds().toBBoxString() + '/';
  console.log(url)
  document.getElementById( 'download_iframe' ).src = url;
  window.setTimeout( function(){ $( '#export' ).attr('class', 'icon-down-circle'); }, 2000 );
}