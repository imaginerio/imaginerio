const server = 'http://54.190.53.18:3000/';
const tileserver = 'http://54.190.53.18:3001/tiles/';
const rasterserver = 'http://54.190.53.18:3001/raster/';

const thumbnaillUrl = 'http://mdxdv.artstor.org/thumb/imgstor/size1/sslps/c7730355/';
const imageUrl = 'http://mdxdv.artstor.org/thumb/imgstor/size2/sslps/c7730355/';

var years;
var year;

var names;

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

  function showEra (i) {
    let e = eras[i];
    Filmstrip.setYear(e.dates[0], e.dates[1]);
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
    $('.era-tag').first().click();
  });

  $('#eras-button').click(function () {
    $('main').addClass('eras');
  });
}

function showAddMemory () {
  $('.lightbox').show();
  $('.lightbox .content > div').remove();
  let div = $('<div>').attr('class', 'memory').appendTo('.lightbox .content');
  div.append('<h2>Add a memory</h2>');
  let inputRow = $('<div>').attr('class', 'input-row').appendTo(div);
  inputRow.append('<div><h3>Name</h3><input type="text" placeholder="Enter name (optional)"/></div>');
  inputRow.append('<div><h3>Graduation date</h3><select><option value="" selected>Year</option></select></div>');
  let now = new Date().getFullYear();
  for (let y = 1900; y <= now; y ++) {
    $('select', inputRow).append('<option value="' + y + '">' + y + '</option>');
  }
  div
    .append('<h3>Memory text</h3>')
    .append('<p><i class="icon-picture"></i>Drag images (PNG or JPG) to this window to include with your memory.</p>')
    .append('<textarea placeholder="Enter your memory...">');

  $('<div>').attr('class', 'submit').html('Submit').appendTo(div);  // to do: submit handler
  $('<div>').attr('class', 'cancel').html('Cancel').appendTo(div).click(function () { $('.lightbox').hide(); });

  div
    .on('drop', function (e){ e.preventDefault(); upload(e.originalEvent.dataTransfer.files);})
    .on('dragover', function(e){ e.preventDefault(); div.addClass('dragover'); })
    .on('dragleave', function(e){ e.preventDefault(); div.removeClass('dragover'); })
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