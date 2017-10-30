// photo
let Photo = function (data, thumbUrl) {
  let P = {};

  // private and public methods: get thumb, full image, Leaflet marker, etc.

  P.data = data;

  let file = data.file.replace('SSID', '');
  let _thumb = $('<div>')
    .attr('class', 'filmstrip-thumbnail');
  let tempImages = [];
  P.metadata = {};

  $.getJSON( 'http://www.sscommons.org/openlibrary/secure/imagefpx/' + data.id + '/7730355/5', function( json ){
    P.metadata = json[0];
    tempImages.forEach(function (img) {
      img.div.css('background-image', 'url(' + getUrl(img.size) + ')');
    });

    $.ajax( 'http://www.sscommons.org/openlibrary/secure/metadata/' + data.id + '?_method=FpHtml',{
      dataType : 'html',
      success : function( html )
      {
        P.href  = $( html ).find( 'td' ).last().text().replace( /\s/gm, '' );
        //_thumb.css('background-image', 'url(' + getUrl([130,130]) + ')');
      }
    });
  });

  function getUrl (size) {
    let scaled = P.getScaled(size);
    return P.metadata.imageServer + P.metadata.imageUrl + '&&wid=' + scaled[0] + '&hei=' + scaled[1] + '&rgnn=0,0,1,1&cvt=JPEG';
  }

  P.thumb = function () {
    return _thumb;
  }

  P.getImage = function (size) {
    let div = $('<div>');
    if (!P.metadata.imageServer) tempImages.push({div: div, size: size});
    else div.css('background-image', 'url(' + getUrl(size) + ')');
    return div;
  }

  P.getScaled = function (size) {
    let newSize = [];
    let ratio = P.metadata.width / P.metadata.height;
    if (size.length == 1) {
      if (ratio >= 1) newSize = [size[0] * ratio, size[0]];
      else newSize = [size[0], size[0] / ratio];
    } else {
      if (size[0] / ratio > size[1]) newSize = [size[1] * ratio, size[1]];
      else newSize = [size[0], size[0] / ratio];
    }
    return newSize;
  }

  return P;
};