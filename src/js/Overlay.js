// map overlay
// photo
const getOverlay = (components) => {
  let Overlay = function (data) {
    let O = {};
  
    O.data = data;
  
    let coordString = data.bbox.match(/\(\((.+)\)\)/);
    if (coordString && coordString[1]) {
      let coords = _.map(coordString[1].split(','), function (pair) {
        return _.map(pair.split(' '), function (d) {
          return +d;
        });
      });
      let f = {type: 'Feature', 
        geometry: {
          type: 'Polygon',
          coordinates: [coords]
        }
      };
      O.bbox = L.geoJson(f).getBounds();
    }
    
    let _layer = L.tileLayer(rasterserver + data.file + '/{z}/{x}/{y}.png', {opacity: .9});
  
    O.layer = function () {
      return _layer;
    }
  
    O.opacity = function () {
      return _layer.options.opacity;
    }
  
    return O;
  };
  return Overlay;
};
export default getOverlay;

