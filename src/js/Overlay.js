// map overlay
// photo
let Overlay = function (data) {
  let O = {};

  O.data = data;

  let _layer = L.tileLayer(rasterserver + data.file + '/{z}/{x}/{y}.png');

  O.layer = function () {
    return _layer;
  }

  return O;
};