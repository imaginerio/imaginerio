const getInit = (components) => {
  const {
    eras,
    Map,
    Timeline,
    Filmstrip,
    Legend,
    Search,
    dispatch,
    register,
  } = components;
  const Dispatch = dispatch;

  const Init = {};

  let server = 'https://irio.axismaps.io/';
  let tileserver = 'https://irio.axismaps.io/tiles/';
  let rasterserver = 'https://irio.axismaps.io/raster/';
  
  const thumbnaillUrl = 'https://mdxdv.artstor.org/thumb/imgstor/size1/sslps/c7731849/';
  const imageUrl = 'https://mdxdv.artstor.org/thumb/imgstor/size2/sslps/c7731849/';
  
  let years;
  let year;
  const minYear = 1830;
  let names;
  let currentEra = eras[0];
  let language = 'english';
  
  
  const params = {};
  
  (function($){
    $.event.special.destroyed = {
      remove: function(o) {
        if (o.handler) {
          o.handler()
        }
      }
    }
  })(jQuery)
  
  // runtime stuff
  
  const mobile = window.innerWidth <= 700;

  if (gup( 'dev' ) == 'true') {
    server = 'https://imaginerio-dev.axismaps.io:3000';
    tileserver = 'http://imaginerio-dev.axismaps.io:3001/tiles/';
    rasterserver = 'http://imaginerio-dev.axismaps.io:3001/raster/';
  }

  $.getJSON(`${server}timeline`, (yearsData) => {
    console.log('timeline', `${server}timeline`);
    years = yearsData;
    // while (years[0] < eras[0].dates[0]) years.shift();  // force min year and first era to match
    $.getJSON(`${server}names/en`, (namesData) => {
      Init.names = namesData;
      $.getJSON(`${server}plans/`, (plansList) => {
        // parse years
        Init.plans = plansList.map((d) => {
          const planCopy = Object.assign({}, d);
          planCopy.years = d.planyear.split('-').map(dd => parseInt(dd, 10));
          return planCopy;
        });

        initialize();
      });
    });
  });
  
  
  function initialize() {
    eras[eras.length - 1].dates[1] = new Date().getFullYear();
    checkHash();
    year = params.year || 1943; // a year that actually has something
    Map.initialize('map').setYear(year);
    Timeline.initialize(eras, 'timeline').setYear(year);
    Filmstrip.initialize();
    register.initialize();
    Legend.initialize().setYear(year);
    // Search.initialize('search').setYear(year);
    init_ui();
    updateEra();

  
    if (params.year) {
      Filmstrip.setYear(year);
      $('main').removeClass('eras');
    }
  
    if (params.zoom) {
      Map.setView(params.center, params.zoom);
    }
    if (params.layers) {
      let v = false;
      if (params.layers.indexOf('views') !== -1) {
        v = true;
        params.layers.splice(params.layers.indexOf('views'), 1);
        if (!params.layers.length) params.layers = ['all'];
      }
      Legend.layers(params.layers);

      if (v) {
        $('input[value="views"]').attr('checked', null);
        Legend.hasViews = false;
        Map.hideViews();
      }
    }
    if (params.raster) {
      Filmstrip.setRaster(params.raster);
    }
  }

  function setLanguageDropdown() {
    const languageOptions = {
      english: 'English Version',
      portuguese: 'Versão em Português',
    };
    const dropdownButton = $('.language-dropdown-button');
    const currentLanguage = $('.language-dropdown-current');
    const optionsContainer = $('.language-dropdown-content');
    const otherLanguage = $('.language-dropdown-option');

    dropdownButton.on('mouseover', () => {
      optionsContainer.addClass('language-dropdown-content--on');
    });

    optionsContainer.on('mouseout', () => {
      optionsContainer.removeClass('language-dropdown-content--on');
    });

    otherLanguage.on('click', function switchLanguage() {
      const newLanguage = $(this).attr('data-language');
      language = newLanguage;
      currentLanguage.text(languageOptions[language]);
      $('.language-dropdown-option').each(function toggle() {
        const option = $(this);
        const optionLanguage = option.attr('data-language');
        console.log(language, optionLanguage !== language);
        const display = optionLanguage !== language;
        console.log(optionLanguage, language);
        if (display) {
          option.removeClass('language-dropdown-option--hidden');
        } else {
          option.addClass('language-dropdown-option--hidden');
        }
      });
    });
  }
  function init_ui() {
    setLanguageDropdown();
    if (mobile) {
      $('#legend .mobile-header .icon-times').click(() => {
        $('#legend').toggleClass('collapsed');
      });
      $('#search .icon-left-big').click(() => {
        if ($('main').hasClass('eras')) {
          goToStart();
          return;
        }
        Search.clear();
        $('header').removeClass('search');
      });
      $('#filmstrip').addClass('collapsed').insertBefore('#map');
    } else {
      $('.mobile').hide();
    }
    
  
    $('#fixed-probe .icon-times').click(function onClick() {
      // show probe-hint???
      $('#fixed-probe').hide();
      Dispatch.call('removehighlight', this);
      Map.clearSelected();
    });
  
    $('.lightbox').click(function onClick(e) {
      // close on background click
      if (e.target == this || $(e.target).hasClass('icon-times')) {
        $('.lightbox').hide();
        $('.lightbox').removeClass('register');
      }
    });

    eras.forEach((e, i) => {
      $('<option>')
        .attr('value', i)
        .html(e.name + ' (' + e.dates.map(formatYear).join(' – ') + ')')
        .appendTo('.era-dropdown select');
    });

    $('.era-dropdown select').on('change', function change() {
      showEra($(this).val());
    });

    $('#era-stepper .icon-angle-left').click(function click() {
      if ($(this).hasClass('disabled')) return;
      showEra(+$('#intro').data('era') - 1);
    });

    $('#era-stepper .icon-angle-right').click(function click() {
      if ($(this).hasClass('disabled')) return;
      showEra(+$('#intro').data('era') + 1);
    });

    $('.go-button').on('click', goButtonClick);

    $('#eras-button').click(function click() {
      if ($('main').hasClass('eras')) {
        goToStart();
        return;
      }
      Dispatch.call('removeall', this);
      Dispatch.call('removeoverlay', this);
      $('main').addClass('eras');
      $('#legend').addClass('collapsed');
      showEra(eras.indexOf(currentEra), true);
    });

    $('#overlay-info').click(function click() {
      const { probes } = components;
      const { rasterProbe } = probes;
      rasterProbe($(this).data('p'));
    });

    $('.search-results .icon-times').click(() => {
      Search.clear();
    });

    $('#export').click(exportMap);
  }

  function goButtonClick() {
    goToMap();
  }

  function goToStart() {
    $('main').addClass('start');

    $('.title-container h1')
      .html('imagineRio');

    $('.go-button')
      .html('<i class="icon-binoculars"></i> Begin Exploring')
      .removeClass('era')
      .off('click')
      .on('click', goButtonClick);

    window.location.hash = '';
  }

  function goToMap() {
    Dispatch.call('setyear', this, year);
    $('main').removeClass('eras').removeClass('start');
    updateHash();
    updateEra();
  }

  function updateEra() {
    eras.forEach((e) => {
      if (year >= e.dates[0] && year <= e.dates[1]) {
        currentEra = e;
        $('#eras-button div.desktop span').html(e.name);
      }
    });
  }

  function showEra(i, noTransition) {
    $('main').removeClass('start');
    $('#eras-button div.desktop span').html('start');
    let e = eras[i];
    Filmstrip.setYear(e.dates[0], e.dates[1]);
    Map.setYear(e.dates[0]);

    if (noTransition) {
      $('.era-intro .era-description-inner').remove();
      $('<div class="era-description-inner">')
        .append('<p class="era-description">' + e.description + '<p>')
        .appendTo('.era-description-container')
        .css('margin-left', '0%');
      $('.era-years').html(e.dates.map(formatYear).join(' – '))
        .css('margin-left', '0%');
      $('#intro h1').html(e.name)
        .css('margin-left', '0%');
    } else {
      let dur = 500;
      let endOld = i < $('#intro').data('era') ? '100%' : '-100%';
      let startNew = i < $('#intro').data('era') ? '-100%' : '0%';
      let newDesc = $('<div class="era-description-inner">')
         .append('<p class="era-description">' + e.description + '<p>')
         .css('margin-left', startNew);
      let newYear = $('<p class="era-years">')
         .html(e.dates.map(formatYear).join(' – '))
         .css('margin-left', startNew);
      let newTitle = $('<h1>' + e.name + '</h1>')
        .css('margin-left', startNew);
      if (startNew == '-100%') {
        newDesc.prependTo('.era-description-container')
          .animate({
             'margin-left': '0%'
          }, dur, function () {
            $('.era-description-inner').last().remove();
          });
        newYear.prependTo('.era-years-container')
          .animate({
             'margin-left': '0%'
          }, dur, function () {
            $('.era-years').last().remove()
          });
        newTitle.prependTo('.title-container')
          .animate({
             'margin-left': '0%'
          }, dur, function () {
            $('.title-container h1').last().remove()
          });
      } else {
        $('.era-description-inner').last()
          .animate({
            'margin-left': endOld,
          }, dur, function () {
            $(this).remove();
          });
        $('.era-years').last()
          .animate({
            'margin-left': endOld,
          }, dur, function () {
            $(this).remove();
          });
        $('.title-container h1').last()
          .animate({
            'margin-left': endOld,
          }, dur, function () {
            $(this).remove();
          });
        newDesc.appendTo('.era-description-container');
        newYear.appendTo('.era-years-container');
        newTitle.appendTo('.title-container');
      }
    }
    
    $('.go-button').html('Go to Map <i class="icon-right-big"></i>').toggleClass('era', !mobile)
      .off('click')
      .on('click', () => {
        goToEra(e);
      });
    $('#intro').data('era', i);
    $('#era-stepper .icon-angle-left').toggleClass('disabled', (i == 0));
    $('#era-stepper .icon-angle-right').toggleClass('disabled', (i == eras.length - 1));
  }
  
  function goToEra(e) {
    $('main').removeClass('eras');
    Dispatch.call('setyear', this, e.dates[0]);
    if (e.center !== '' && e.zoom !== '') {
      Map.setView(e.center, e.zoom);
    }
    updateHash();
  }
  
  function formatYear(y) {
    if (y < 0) return -y + ' BC';
    return y;
  }
  
  function gup(name) {
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( window.location.href );
    if( results == null )
      return "";
    else
      return results[1];
  }
  
  function checkHash() {
    const hash = window.location.hash.replace( '#', '' ).replace(/\?.+$/, '').split( '/' );
    params.year = hash[0] ? parseInt(hash[0], 10) : '';
    params.zoom = hash[1] ? parseInt(hash[1]) : '';
    params.center = hash[2] && hash[3] ? [parseFloat(hash[2]), parseFloat(hash[3]) ] : '';
    params.layers = hash[4] ? hash[4].split( '&' ) : [];
    params.raster = hash[5] ? hash[5] : '';
  }
  
  function updateHash() {
    if ($('main').hasClass('eras')) {
      window.location.hash = '';
      return;
    }
    let layers = Legend.layers();
    if (!Legend.hasViews) {
      if (layers[0] == 'all') layers = ['views'];
      else layers.push('views');
    }
    layers = layers.join('&');
    const raster = $('#overlay-info').data('p') ? $('#overlay-info').data('p').data.id : '';
  
    const mapView = Map.getView();
  
    window.location.hash = year + "/" + mapView[1] + "/" + mapView[0].lat + "/" + mapView[0].lng + "/" + layers + "/" + raster;
  
    $('.twitter').attr('href', $('.twitter').attr('data-href') + 'text=diverseLevant' + '&url=' + encodeURIComponent(window.location.href));
    $('.fb-share-btn').attr('href', $('.fb-share-btn').attr('data-href') + '&u=' + encodeURIComponent(window.location.href));
    // Update Social Media links
    // $( '.twitter-button a' ).attr( 'href', 'https://twitter.com/intent/tweet?url=' + encodeURIComponent( window.location.href ) );
  
    // $( '.facebook-button a' ).attr('href', 'http://www.facebook.com/sharer/sharer.php?u=imaginerio.org/' + encodeURIComponent( window.location.hash ) + '&title=Imagine Rio');
  }

  function exportMap() {
    $('#export')
      .attr('class', 'icon-circle-notch animate-spin');
    const layers = Legend.layers().sort().join(',');
    const raster = $('#overlay-info').data('p') ? $('#overlay-info').data('p').data.file : 'null';
    const url = server + 'export/en/' + year + '/' + layers + '/' + raster + '/' + Map.getBounds().toBBoxString() + '/';

    document.getElementById('download_iframe').src = url;
    window.setTimeout(() => { $('#export').attr('class', 'icon-download'); }, 2000);
  }

  function setYear(newYear) {
    year = newYear;
  }

  return Object.assign(Init, {
    updateEra,
    formatYear,
    updateHash,
    mobile,
    server,
    tileserver,
    rasterserver,
    names,
    thumbnaillUrl,
    setYear,
    language,
  });
};

export default getInit;
