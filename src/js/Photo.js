
const getPhoto = (components) => {
  const Photo = (data, thumbUrl) => {
    const P = {};

    // private and public methods: get thumb, full image, Leaflet marker, etc.

    P.data = data;

    const file = data.file.replace('SSID', '');
    const tempImages = [];
    P.metadata = {};

    const divs = [];

    let request;

    function getMetadata() {
      request = $.getJSON( 'https://www.sscommons.org/openlibrary/secure/imagefpx/' + data.id + '/7731849/5', (json) => {
        P.metadata = json[0];
        P.metadata.imageServer = P.metadata.imageServer.replace(/^http/, 'https');
        tempImages.forEach((img) => {
          img.div.empty().css('background-image', 'url(' + getUrl(img.size) + ')');
          if (img.setDimensions) {
            let s = P.getScaled(img.size);
            img.div.css('width', s[0] + 'px').css('height', s[1] + 'px');
          }
        });
  
        request = $.ajax( 'https://www.sscommons.org/openlibrary/secure/metadata/' + data.id + '?_method=FpHtml',{
          dataType : 'html',
          success : function( html )
          {
            P.href  = $( html ).find( 'td' ).last().text().replace( /\s/gm, '' );
          }
        });
      });
    }
  
    getMetadata();
  
    function getUrl(size) {
      const scaled = P.getScaled(size);
      return P.metadata.imageServer + P.metadata.imageUrl + '&&wid=' + scaled[0] + '&hei=' + scaled[1] + '&rgnn=0,0,1,1&cvt=JPEG';
    }
  
    P.getImage = (size, setDimensionsOnLoad) => {
      const div = $('<div>')
        .append('<i class="icon-circle-notch animate-spin"></i>')
        .bind('destroyed', () => {
          divs.splice(divs.indexOf(div), 1);
          if (!divs.length && request && request.readyState != 4) {
            request.abort();
            request = null;
          }
        });
      divs.push(div);
      if (!P.metadata.imageServer) {
        tempImages.push({ div, size, setDimensions: setDimensionsOnLoad });
        if (!request) {
          getMetadata();
        }
      } else {
        div.empty().css('background-image', 'url(' + getUrl(size) + ')');
      }
      return div;
    }
  
    P.getScaled = (size) => {
      let newSize = [];
      const ratio = P.metadata.width / P.metadata.height;
      if (size.length === 1) {
        if (ratio >= 1) {
          newSize = [size[0] * ratio, size[0]];
        } else {
          newSize = [size[0], size[0] / ratio];
        }
      } else if (size[0] / ratio > size[1]) {
        newSize = [size[1] * ratio, size[1]];
      } else {
        newSize = [size[0], size[0] / ratio];
      }
      return newSize;
    };
  
    return P;
  };
  return Photo;
};

export default getPhoto;
