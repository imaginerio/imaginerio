const server = 'http://54.190.53.18:3000/';
const tileserver = 'http://54.190.53.18:3001/tiles/';
const rasterserver = 'http://54.190.53.18:3001/raster/';

const thumbnaillUrl = 'http://mdxdv.artstor.org/thumb/imgstor/size1/sslps/c7730355/';
const imageUrl = 'http://mdxdv.artstor.org/thumb/imgstor/size2/sslps/c7730355/';

var years;
var year;

var names;

var currentEra = eras[0];

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

var mobile = window.innerWidth <= 600;

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
  year = 1910; // a year that actually has something
  Map.initialize('map').setYear(year);
  Timeline.initialize(years, eras, 'timeline').setYear(year);
  Filmstrip.initialize();//.setYear(year);
  Legend.initialize().setYear(year);
  Search.initialize('search').setYear(year);
  init_ui();
}

function init_ui () {
  if (mobile) {
    $('#legend .mobile-header .icon-times').click(function () {
      $('#legend').toggleClass('collapsed');
    });
    $('#search .icon-left-big').click(function () {
      Search.clear();
      $('header').removeClass('search');
    });
    $('#filmstrip').addClass('collapsed').insertBefore('#map');
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
    if ((e.target == this && !$('.memory')[0]) || $(e.target).hasClass('icon-times')) $('.lightbox').hide();
  });

  eras.forEach(function (e, i) {
    let div = $('<div>').attr('class', 'era-tag')
      .click(function () {
        showEra(i);
      });
    $('<div>').attr('class', 'era-' + i).appendTo(div);
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

  $('.go-button').on('click', function () {
    Filmstrip.setYear(year);
    $('main').removeClass('eras');
    updateEra();
  });

  $('#eras-button').click(function () {
    Dispatch.call('removeall', this);
    $('main').addClass('eras');
    $('#legend').addClass('collapsed');
    showEra(eras.indexOf(currentEra));
  });

  $('#overlay-info').click(function () {
    rasterProbe($(this).data('p'));
  });

  $('.search-results .icon-times').click(function () {
    Search.clear();
  })
}

function updateEra () {
  eras.forEach(function (e) {
    if (year >= e.dates[0] && year <= e.dates[1]) {
      currentEra = e;
      $('#eras-button div.desktop span').html(e.name);
    }
  });
}

function showEra (i) {
  let e = eras[i];
  Filmstrip.setYear(e.dates[0], e.dates[1]);
  Map.setYear(e.dates[0]);
  $('#intro h1').html(e.name);
  $('.era-description').html(e.description);
  $('.go-button').html('Go to Map').toggleClass('era', !mobile)
    .off('click')
    .on('click', function () {
      $('main').removeClass('eras');
      Dispatch.call('setyear', this, e.dates[0]);
    });
  $('#era-tags').hide();
  $('#era-stepper').show();
  $('.era-years').html(e.dates.join(' – '));
  $('#intro').data('era', i);
  $('#era-stepper .icon-angle-left').toggleClass('disabled', (i == 0));
  $('#era-stepper .icon-angle-right').toggleClass('disabled', (i == eras.length-1));
}

function showAddMemory () {

  $('.lightbox').css('display', 'flex');
  $('.lightbox .content > div').remove();
  let div = $('<div>').attr('class', 'memory').appendTo('.lightbox .content');
  div.append('<iframe class="airtable-embed" src="https://airtable.com/embed/shra9blqc8Ab48RaN?backgroundColor=blue" frameborder="0" onmousewheel="" width="100%" height="100%" style="background: transparent;"></iframe>');
}

function upload(files) {
  $('.memory').removeClass('dragover');
  var f = files[0];

  // Only process image files.
  if (!f.type.match('image/jpeg') && !f.type.match('image/png')) {
       alert('The file must be a jpeg or png image') ;
       return false ;
  }
  var reader = new FileReader();

  // When the image is loaded,
  // run handleReaderLoad function
  reader.onload = function(e){
    $('<img>').attr('src', e.target.result).insertAfter('.memory p').attr('class', 'memory-image');
  }
  // Read in the image file as a data URL.
  reader.readAsDataURL(f);            
}

$('#add-memory-button').click(showAddMemory);