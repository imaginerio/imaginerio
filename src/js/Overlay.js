// map overlay
// photo
const getOverlay = (components) => {
  const Overlay = (data) => {
    const { rasterserver } = components.init;
    const O = {};
  
    O.data = data;

    const coordString = data.bbox.match(/\(\((.+)\)\)/);
    if (coordString && coordString[1]) {
      const coords = _.map(coordString[1].split(','), (pair) => {
        return _.map(pair.split(' '), (d) => {
          return +d;
        });
      });
      const f = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coords],
        },
      };
      O.bbox = L.geoJson(f).getBounds();
    }

    const _layer = L.tileLayer(rasterserver + data.file + '/{z}/{x}/{y}.png', { opacity: 0.9 });

    O.layer = () => _layer;

    O.opacity = () => _layer.options.opacity;

    return O;
  };
  return Overlay;
};
export default getOverlay;

