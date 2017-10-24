function overlayProbe (data) {
  console.log(data)
  $('#fixed-probe').empty().show();
  $('<p>').attr('class', 'fixed-probe-title').html(data.description).appendTo('#fixed-probe');
  $('<img>')
    .attr('src', imageUrl + data.file.replace('SSID', '') + '.jpg')
    .appendTo('#fixed-probe');
  $('<div>')
    .attr('class', 'button red')
    .html('Remove Overlay')
    .appendTo('#fixed-probe')
    .click(function () {
    Dispatch.call('removeoverlay', this);
  });
}