const server = 'http://54.190.53.18:3000/';
const tileserver = 'http://54.190.53.18:3001/tiles/';
const rasterserver = server + 'raster/';

var years;
var year;

// runtime stuff

$.getJSON(server + 'timeline', initialize);

function initialize (yearsData) {
  years = yearsData;
  year = yearsData[0];
  Map.initialize('map').setYear(year);
  Timeline.initialize(years, 'timeline');
  Filmstrip.initialize();
  Legend.initialize();
  // etc.
}