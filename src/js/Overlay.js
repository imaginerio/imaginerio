// map overlay
// photo
let Overlay = function (data) {
  let O = {};

  O.data = data;

  let _layer = L.tileLayer(rasterserver + data.file + '/{z}/{x}/{y}.png', {opacity: .9});

  O.layer = function () {
    return _layer;
  }

  O.opacity = function () {
    return _layer.options.opacity;
  }

  return O;
};