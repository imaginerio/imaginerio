// photo
let Photo = function (data, thumbUrl) {
  let P = {};

  // private and public methods: get thumb, full image, Leaflet marker, etc.

  P.data = data;

  let file = data.file.replace('SSID', '');
  let _thumb = $('<div>')
    .attr('class', 'filmstrip-thumbnail')
    .css('background-image', 'url(' + thumbUrl + file + '.jpg)');

  P.thumb = function () {
    return _thumb;
  }

  P.getImage = function () {
    return $('<img>').attr('src', thumbUrl.replace('size1', 'size0') + file + '.jpg');
  }

  return P;
};