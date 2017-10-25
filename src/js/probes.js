function overlayProbe (data) {
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

function filmstripProbe (photo) {
  let offset = photo.thumb().offset();
  $('#filmstrip-probe .content')
    .empty()
    .html('<p><strong>' + photo.data.description + '</strong></p><p>' + photo.data.date + '</p><p><em>Click to view on map</em></p>')
  $('#filmstrip-probe')
    .show()
    .css({
      top: offset.top - 10 - $('#filmstrip-probe').height() + 'px',
      left: offset.left + 65 - $('#filmstrip-probe').width()/2 + 'px'
    });
}