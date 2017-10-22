// events
let Dispatch = d3.dispatch('changeyear', 'highlightfeature', 'removehighlight');

Dispatch.on('changeyear', function (newYear) {
  year = newYear;
  Map.setYear(newYear);
  Legend.setYear(newYear);
  Filmstrip.setYear(newYear);
  Search.setYear(newYear);
});

Dispatch.on('highlightfeature', function (json) {
  Map.highlightFeature(json);
});

Dispatch.on('removehighlight', function (json) {
  Map.removeHighlight();
});