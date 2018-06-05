const getProbes = (components) => {
  function closeFixedProbe() {
    const { Map, dispatch } = components;
    // show probe-hint???
    $('#fixed-probe').hide();
    dispatch.call('removehighlight', this);
    Map.clearSelected();
  }

  function rasterProbe(p) {
    const {
      dispatch,
      Filmstrip,
      init,
      Map,
      Slider,
    } = components;
    console.log('raster probe', p);
    const { mobile } = init;
    const Dispatch = dispatch;

    const description = Object.prototype.hasOwnProperty.call(p.data, 'description') ? p.data.description : p.data.name;

    Dispatch.call('removeall', this);

    $('#fixed-probe .content').empty();
    $('#fixed-probe').show().removeClass('map-feature');

    const title = $('<div>')
      .attr('class', 'fixed-probe-title')
      .appendTo('#fixed-probe .content');

    // probe descriptive text
    $('<div>')
      .attr('class', 'fixed-probe-description')
      .html(description)
      .appendTo(title);

    const rightMenuContainer = $('<div>')
      .attr('class', 'fixed-probe-title-right')
      .appendTo(title);

    if (p.data.layer === 'viewsheds') {
      const photos = _.filter(Filmstrip.getRasters(), r => r.layer === 'viewsheds');
      if (photos.length > 1) {
        const stepperContainer = $('<div>')
          .attr('class', 'fixed-probe-stepper-container stepper')
          .appendTo(rightMenuContainer);

        stepperContainer
          .append('<i class="icon-angle-left">')
          .append('<i class="icon-angle-right">');

        const i = photos.indexOf(p.data);
        $('i.icon-angle-left', title).click(() => {
          if (i == 0) rasterProbe(photos[photos.length - 1].photo);
          else rasterProbe(photos[i - 1].photo);
        });
        $('i.icon-angle-right', title).click(() => {
          if (i == photos.length - 1) rasterProbe(photos[0].photo);
          else rasterProbe(photos[i + 1].photo);
        });
      }
    }

    $('<i class="icon-times">')
      .on('click', closeFixedProbe)
      .appendTo(rightMenuContainer);

    const dimensions = mobile ? [160, 160] : [400, 300];
    const size = p.getScaled(dimensions);
    let slider;
    if (!mobile) {
      $('#fixed-probe .content').css('width', `${size[0]}px`);
    } else {
      $('#fixed-probe .content').css('width', 'auto');
    }

    const getProbeCredits = () => {
      const { formatYear } = init;
      let text = '';
      if (p.data.creator) text += p.data.creator + '<br>';
      if (p.data.description) text += '<span class="image-title">' + p.data.description + '</span><br>';
      if (p.data.date) text += formatYear(p.data.date);
      if (p.data.credits) text += `<span class="image-credit"> [${p.data.credits}]</span>`;
      return text;
    };
    const text = getProbeCredits();
    const probeContent = $('#fixed-probe .content');
    const img = p.getImage(dimensions, true)
      .attr('class', 'fixed-image')
      .css('width', `${size[0]}px`)
      .css('height', `${size[1]}px`)
      .appendTo(probeContent)
      .click(function click() {
        Dispatch.call('removeall', this);

        $('.lightbox').css('display', 'flex');
        $('.lightbox .content > div').remove();

        const div = $('<div>')
          .attr('class', 'inner-content')
          .appendTo('.lightbox .content');

        const w = window.innerWidth * 0.75;
        const h = window.innerHeight - 300;
        const sizeInner = p.getScaled([w, h], true);
        p.getImage([w, h])
          .attr('class', 'lightbox-image')
          .css('width', `${sizeInner[0]}px`)
          .css('height', `${sizeInner[1]}px`)
          .appendTo(div);

        const textRow = $('<div>')
          .attr('class', 'lightbox-content-row')
          .appendTo(div);

        // MOVE TO OWN FUNCTION
        
  
        $('<div>')
          .html(text)
          .appendTo(textRow);

        const buttonContainer = $('<div>')
          .attr('class', 'blue-button-container')
          .appendTo(textRow);

        $('<a>')
          .attr('class', 'image blue-button')
          .attr('href', 'https://www.sscommons.org/openlibrary/' + p.href + '&fs=true')
          .attr('target', 'blank')
          .html('View image on SharedShelf Commons')
          .appendTo(buttonContainer);
      });

    const textRow = $('<div>')
      .attr('class', 'probe-credits-row')
      .appendTo(probeContent);

    textRow.append(text);

    if (p.data.layer !== 'viewsheds' && mobile) {
      $('<div>').attr('class', 'blue-button slider-toggle').html('<i class="icon-sliders"></i>').appendTo('#fixed-probe .content')
        .click(() => {
          $('.slider, .button.red', '#fixed-probe .content').toggle();
          $('.blue-button.more').insertBefore('.slider');
          slider.val(p.data.overlay.opacity());
        });
    }
    if (p.data.layer !== 'viewsheds') {
      slider = Slider('#fixed-probe .content').val(p.data.overlay.opacity()).on('sliderchange', function sliderChange(e, d) { 
        Dispatch.call('setopacity', this, d);
      });
      $('<div>').attr('class', 'blue-button more').html('More...').appendTo('#fixed-probe .content')
        .click(() => {
          img.click();
        });
      $('<hr>').appendTo('#fixed-probe .content');
      $('<div>')
        .attr('class', 'button red')
        .html('Remove Overlay')
        .appendTo('#fixed-probe .content')
        .click(function click() {
          Dispatch.call('removeoverlay', this);
        });
      $('#fixed-probe').css('margin-right', '0');
    } else {
      Map.zoomToView(p.data);
      $('#fixed-probe')
        .css('margin-right', $('#overlay-info').is(':visible') && !mobile ? '65px' : 0);
    }
  }

  function filmstripProbe(photo) {
    const offset = $(this).offset();
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

  function mapProbe(event, content) {
    // console.log('mapProbe');
    // console.log('event', event);
    // console.log('content', content);
    const probe = $('#map-probe').show();
    $('#map-probe .content').empty().html(content);
    let x;
    let y;
    if (Object.prototype.hasOwnProperty.call(event, 'originalEvent')) {
      x = event.originalEvent.pageX;
      y = event.originalEvent.pageY;
      if (x > window.innerWidth / 2) x -= probe.outerWidth() + 10;
      else x += 10;
      
      if (y > window.innerHeight / 2) y -= probe.outerHeight() + 10;
      else y += 10;
    } else {
      ({ x, y } = event);
    }

    
    probe.css({
      top: y + 'px',
      left: x + 'px',
    });
  }

  function detailsProbe(name, content) {
    const { dispatch } = components;

    console.log('details probe', name, content);
    const fixedProbe = $('#fixed-probe');
    const fixedProbeContent = $('#fixed-probe .content');
    fixedProbeContent
      .empty()
      .css('width', 'auto');

    fixedProbe
      .show()
      .css('margin-right', $('#overlay-info').is(':visible') ? '65px' : 0)
      .addClass('map-feature');

    $('.search-results').hide();

    const fixedProbeTitleRow = $('<div>')
      .attr('class', 'fixed-probe-title-row')
      .appendTo(fixedProbeContent);

    $('<div>')
      .attr('class', 'fixed-probe-title')
      .html(name).appendTo(fixedProbeTitleRow);

    $('<i>')
      .attr('class', 'icon-times')
      .on('click', () => {
        // CLEAR HIGHLIGHTED FEATURE HERE
        dispatch.call('removehighlight', this);
        fixedProbe.hide();
      })
      .appendTo(fixedProbeTitleRow);
  
    // does this mean if content !== undefined ??
    if (content) {
      $('#fixed-probe .content').append(content);
    }
  }

  function hideHintProbe() {
    const { init } = components;
    const { mobile } = init;
    if (mobile) {
      $('.probe-hint--mobile').hide();
    } else {
      $('.probe-hint-container').addClass('probe-hint--no-hint');
    }
  }

  function minimizeAreaSearch() {
    $('.probe-hint-container').addClass('probe-hint--min-area');
  }

  function hideMapProbe() {
    $('#map-probe').hide();
  }

  return {
    rasterProbe,
    filmstripProbe,
    mapProbe,
    detailsProbe,
    hideHintProbe,
    hideMapProbe,
    minimizeAreaSearch,
  };
};

export default getProbes;
