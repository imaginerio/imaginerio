// photo
let Photo = function (data, thumbUrl) {
  let P = {};

  // private and public methods: get thumb, full image, Leaflet marker, etc.

  P.data = data;

  let file = data.file.replace('SSID', '');
  let tempImages = [];
  P.metadata = {};

  let divs = [];

  let request;

  function getMetadata() {
    window.fetch(`https://dmi.rice.edu:8443/rest/handle/${P.data.id}`, { credentials : 'include' })
      .then(res => res.json())
      .then((meta) => {
        window.fetch(`https://dmi.rice.edu:8443/rest/items/${meta.uuid}/bitstreams`, { credentials: 'include' })
          .then(res => res.text())
          .then((text) => {
            const json = JSON.parse(text);
            if (json.length > 1) {
              P.metadata = json.find(i => i.mimeType.match(/image/));
            } else {
              [P.metadata] = json;
            }
            tempImages.forEach((img) => {
              const image = new Image();
                image.onload = function () {
                  img.div.empty().css('background-image', `url(${getUrl()})`);
                  P.metadata.width = this.width;
                  P.metadata.height = this.height;
                  img.div.empty().css('background-image', `url(${getUrl(img.size)})`);
                  if (img.setDimensions) {
                    const s = P.getScaled(img.size);
                    img.div.css('width', `${s[0]}px`).css('height', `${s[1]}px`);
                  }
                }
                image.src = getUrl();
            });
            P.href = `https://library.artstor.org/#/asset/${P.data.repository}`;
          });
      });
  }

  getMetadata();

  function getUrl() {
    return `https://dmi.rice.edu:8443${P.metadata.retrieveLink}`;
  }

  P.getImage = function (size, setDimensionsOnLoad) {
    let div = $('<div>')
      .append('<i class="icon-circle-notch animate-spin"></i>')
      .bind('destroyed', function(){ 
        divs.splice(divs.indexOf(div), 1);
        if (!divs.length && request && request.readyState != 4) {
          request.abort();
          request = null;
        }
      });
    divs.push(div);
    if (!P.metadata.imageServer) {
      tempImages.push({div: div, size: size, setDimensions: setDimensionsOnLoad});
      if (!request) {
        getMetadata();
      }
    }
    else div.empty().css('background-image', 'url(' + getUrl(size) + ')');
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