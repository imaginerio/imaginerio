const server = 'http://54.190.53.18:3000/';
const tileserver = 'http://54.190.53.18:3001/tiles/';
const rasterserver = 'http://54.190.53.18:3001/raster/';

const thumbnaillUrl = 'http://mdxdv.artstor.org/thumb/imgstor/size1/sslps/c7730355/';

var years;
var year;

// runtime stuff

$.getJSON(server + 'timeline', initialize);

function initialize (yearsData) {
  years = yearsData;
  year = yearsData[0];
  Map.initialize('map').setYear(year);
  Timeline.initialize(years, 'timeline').setYear(year);
  Filmstrip.initialize().setYear(year);
  Legend.initialize();
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
}