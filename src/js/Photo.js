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
    window.fetch('https://library.artstor.org/api/secure/userinfo', { credentials: 'include' })
      .then(() => {
        window.fetch(`https://library.artstor.org/api/v1/metadata?object_ids=${data.id}&openlib=true`, { credentials: 'include' })
          .then(res => res.text())
          .then((text) => {
            const json = JSON.parse(text);
            [P.metadata] = json.metadata;
            tempImages.forEach((img) => {
              img.div.empty().css('background-image', `url(${getUrl(img.size)})`);
              if (img.setDimensions) {
                const s = P.getScaled(img.size);
                img.div.css('width', `${s[0]}px`).css('height', `${s[1]}px`);
              }
            });
            P.href = `https://library.artstor.org/#/asset/${P.metadata.object_id}`;
          });
      });
  }

  getMetadata();

  function getUrl(size) {
    const scaled = P.getScaled(size);
    let imgPath;
    if (P.metadata.image_url.lastIndexOf('.fpx') > -1) {
      imgPath = `/${P.metadata.image_url.substring(0, P.metadata.image_url.lastIndexOf('.fpx') + 4)}`;
    } else {
      imgPath = `/${P.metadata.image_url}`;
    }
    return `https://tsprod.artstor.org/rosa-iiif-endpoint-1.0-SNAPSHOT/fpx${encodeURIComponent(imgPath)}/full/${Math.round(scaled[0])},${Math.round(scaled[1])}/0/native.jpg`;
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