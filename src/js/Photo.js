// photo
let Photo = function (data, thumbUrl) {
  let P = {};

  // private and public methods: get thumb, full image, Leaflet marker, etc.

  P.data = data;

  let file = data.file.replace('SSID', '');

  P.getThumb = function () {
    let thumb = $('<div>')
      .attr('class', 'filmstrip-thumbnail')
      .css('background-image', 'url(' + thumbUrl + file + '.jpg)');
    return thumb;
  }

  return P;
};