let Slider = function (container) {
  let slider = $('<div>').attr('class', 'slider').appendTo(container);
  let track = $('<div>').attr('class', 'track').appendTo(slider);
  let thumb = $('<div>').attr('class', 'thumb').appendTo(slider);

  thumb.on('mousedown touchstart', function () {
    var thumb = $(this);
    var track = thumb.siblings('.track');
    var baseX = thumb.siblings('.track').offset().left;
    var baseMax = baseX + track.width();
    var min = baseX;
    var max = baseMax;

    $(document).on('mousemove.slide touchmove.slide', function (e) {
      var x = Math.min(Math.max(e.pageX, min), max);
      thumb.css('left', x - baseX + 'px');
      thumb.parent().trigger('sliderchange', [thumb.position().left/track.width()]);
    }).on('mouseup.slide mouseleave.slide touchend.slide', function () {
      $(document).off('mousemove.slide mouseup.slide mouseleave.slide touchmove.slide touchend.slide');
    });
  });

  return slider;
}