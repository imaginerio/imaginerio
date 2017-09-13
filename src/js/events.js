// events
let Dispatch = d3.dispatch('changeyear');

Dispatch.on('changeyear', function (year) {
  Map.setYear(year);
  Filmstrip.setYear(year);
});