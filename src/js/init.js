const server = 'http://54.190.53.18:3000/';
const tileserver = 'http://54.190.53.18:3001/tiles/';
const rasterserver = server + 'raster/';

// runtime stuff

function initialize () {
  Map.initialize('map');
  Timeline.initialize('timeline');
  // etc.
}

initialize();