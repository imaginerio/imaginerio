function rasterProbe (p) {
  $('#fixed-probe .content').empty();
  $('#fixed-probe').show();
  $('<p>').attr('class', 'fixed-probe-title').html(p.data.description).appendTo('#fixed-probe .content');
  let size = p.getScaled([300, 190]);
  p.getImage([300, 190])
    .attr('class', 'fixed-image')
    .css('width', size[0] + 'px')
    .css('height', size[1] + 'px')
    .appendTo('#fixed-probe .content');
  if (p.data.layer != 'viewsheds') {
    $('<div>')
      .attr('class', 'button red')
      .html('Remove Overlay')
      .appendTo('#fixed-probe .content')
      .click(function () {
      Dispatch.call('removeoverlay', this);
    });
  }
}

function filmstripProbe (photo) {
  let offset = $(this).offset();
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