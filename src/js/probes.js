function rasterProbe (p) {
  Dispatch.call('removeall', this);
  $('#fixed-probe .content').empty();
  $('#fixed-probe').show().removeClass('map-feature');
  $('.search-results').hide();
  let title = $('<p>').attr('class', 'fixed-probe-title').html(p.data.description).appendTo('#fixed-probe .content');
  console.log(p)
  if (p.data.layer == 'viewsheds') {
    console.log(Filmstrip.getRasters())
    let photos = _.filter(Filmstrip.getRasters(), function (r) { return r.layer == 'viewsheds'} );
    if (photos.length) {
      title.prepend('<i class="icon-angle-left">').prepend('<i class="icon-angle-right">').addClass('stepper');
      let i = photos.indexOf(p.data);
      $('i.icon-angle-left', title).click(function (){
        if (i == 0) rasterProbe(photos[photos.length - 1].photo);
        else rasterProbe(photos[i - 1].photo);
      });
      $('i.icon-angle-right', title).click(function (){
        if (i == photos.length - 1) rasterProbe(photos[0].photo);
        else rasterProbe(photos[i + 1].photo);
      });
    }
  }
  let dimensions = mobile ? [160,160] : [400, 300];
  let size = p.getScaled(dimensions);
  let slider;
  if (!mobile) $('#fixed-probe .content').css('width', size[0] + 'px');
  else $('#fixed-probe .content').css('width', 'auto');
  let img = p.getImage(dimensions, true)
    .attr('class', 'fixed-image')
    .css('width', size[0] + 'px')
    .css('height', size[1] + 'px')
    .appendTo('#fixed-probe .content')
    .click(function () {
      console.log(p)
      Dispatch.call('removeall', this);
      $('.lightbox').css('display', 'flex');
      $('.lightbox .content > div').remove();
      let div = $('<div>').appendTo('.lightbox .content');
      let w = window.innerWidth * .75;
      let h = window.innerHeight  - 300;
      let size = p.getScaled([w, h], true);
      p.getImage([w, h])
        .attr('class', 'lightbox-image')
        .css('width', size[0] + 'px')
        .css('height', size[1] + 'px')
        .appendTo(div);
      $('<a>')
        .attr('class', 'image blue-button')
        .attr('href', 'https://www.sscommons.org/openlibrary/' + p.href + '&fs=true')
        .attr('target', 'blank')
        .html('View image on Artstor')
        .appendTo(div);
      let text = '';
      if (p.data.creator) text += p.data.creator + '<br>';
      if (p.data.description) text += '<span class="image-title">' + p.data.description + '</span><br>';
      if (p.data.date) text += formatYear(p.data.date) + '<br>';
      if (p.data.credits) text += '<span class="image-credit">' + p.data.credits + '</span>';

      $('<p>')
        .html(text)
        .appendTo(div);
    });
  if (p.data.layer != 'viewsheds' && mobile) {
    $('<div>').attr('class', 'blue-button slider-toggle').html('<i class="icon-sliders"></i>').appendTo('#fixed-probe .content').click(function () {
      $('.slider, .button.red', '#fixed-probe .content').toggle();
      $('.blue-button.more').insertBefore('.slider');
      slider.val(p.data.overlay.opacity())
    });
  }
  if (p.data.layer != 'viewsheds') {
    slider = Slider('#fixed-probe .content').val(p.data.overlay.opacity()).on('sliderchange', function(e, d){ 
      Dispatch.call('setopacity', this, d);
    });
    $('<div>').attr('class', 'blue-button more').html('More...').appendTo('#fixed-probe .content').click(function () {
      img.click();
    });
    $('<hr>').appendTo('#fixed-probe .content');
    $('<div>')
      .attr('class', 'button red')
      .html('Remove Overlay')
      .appendTo('#fixed-probe .content')
      .click(function () {
      Dispatch.call('removeoverlay', this);
    });
    $('#fixed-probe').css('margin-right', '0');
  } else {
    Map.zoomToView(p.data);
    $('#fixed-probe').css('margin-right', $('#overlay-info').is(':visible') ? '65px' : 0);
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

function mapProbe (event, content) {
  let probe = $('#map-probe').show();
  $('#map-probe .content').empty().html(content);
  let x = event.originalEvent.pageX;
  if (x > window.innerWidth / 2) x -= probe.outerWidth() + 10;
  else x += 10;
  let y = event.originalEvent.pageY;
  if (y > window.innerHeight / 2) y -= probe.outerHeight() + 10;
  else y += 10;
  probe.css({
    top: y + 'px',
    left: x + 'px'
  });
}

function detailsProbe (name, content) {
  $('#fixed-probe .content').empty().css('width', 'auto');
  $('#fixed-probe').show().css('margin-right', $('#overlay-info').is(':visible') ? '65px' : 0).addClass('map-feature');
  $('.search-results').hide();
  $('<p>').attr('class', 'fixed-probe-title').html(name).appendTo('#fixed-probe .content');
  if (content) $('#fixed-probe .content').append(content);
}