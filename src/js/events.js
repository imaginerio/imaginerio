// events
let Dispatch = d3.dispatch('changeyear');

Dispatch.on('changeyear', function (newYear) {
  year = newYear;
  Map.setYear(newYear);
  Filmstrip.setYear(newYear);
  Search.setYear(newYear);
});