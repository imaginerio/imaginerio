const server = 'http://54.190.53.18:3000/';
const tileserver = 'http://54.190.53.18:3001/tiles/';
const rasterserver = 'http://54.190.53.18:3001/raster/';

const thumbnaillUrl = 'http://mdxdv.artstor.org/thumb/imgstor/size1/sslps/c7730355/';
const imageUrl = 'http://mdxdv.artstor.org/thumb/imgstor/size2/sslps/c7730355/';

var years;
var year;

var names;

// runtime stuff

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
  Filmstrip.initialize().setYear(year);
  Legend.initialize().setYear(year);
  Search.initialize('search').setYear(year);
  init_ui();
}

function init_ui () {
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
    Dispatch.call('removeoverlay', this);
    Dispatch.call('removehighlight', this);
  });

  $('.lightbox').click(function (e) {
    if (e.target == this || $(e.target).hasClass('icon-times')) $('.lightbox').hide();
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

  function showEra (i) {
    let e = eras[i];
    $('#intro h1').html(e.name);
    $('.era-description').html(e.description);
    $('.go-button').html('Go to Map').addClass('era')
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

  $('#era-stepper .icon-angle-left').click(function (){
    if ($(this).hasClass('disabled')) return;
    showEra(+$('#intro').data('era') - 1);
  });

  $('#era-stepper .icon-angle-right').click(function (){
    if ($(this).hasClass('disabled')) return;
    showEra(+$('#intro').data('era') + 1);
  });

  $('.go-button').on('click', function () {
    $('main').removeClass('eras');
  });

  $('#eras-button').click(function () {
    $('main').addClass('eras');
  });
}