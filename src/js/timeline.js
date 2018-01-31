// timeline 
let Timeline = (function($, dispatch) {
  
  let T = {};

  let timeline;
  let stepper;
  let years;
  let yearRange = [];
  let year = 2015;
  let earlyYears;
  let _ears;

  function init_events () {
    $('.timeline-slider, .timeline-track', timeline).on('mousedown touchstart', function (e) {
      let y = getDataForMouseEvent(e).year;
      $(document)
        .on('mousemove.timeslide touchmove.timeslide', function (e) {
          let d = getDataForMouseEvent(e);
          $('.timeline-slider', timeline).css('left', d.pct * 100 + '%');
          y = d.year;
        })
        .on('mouseup.timeslide mouseleave.timeslide touchend.timeslide', function (){
          $(document).off('mousemove.timeslide mouseup.timeslide mouseleave.timeslide touchmove.timeslide touchend.timeslide');
          changeYear(y);
        })
    });

    $('.timeline-track, .timeline-slider', timeline)
      .on('mousemove.timeline', function (e) {
        let d = getDataForMouseEvent(e);
        $('.timeline-probe', timeline)
          .show()
          .css('left', d.pct * 100 + '%')
          .html(d.year);
      })
      .on('mouseleave', function () {
        $('.timeline-probe', timeline).hide();
      });

    $('.icon-angle-left', stepper).click(function () {
      changeYear(year - 1);
    });

    $('.icon-angle-right', stepper).click(function () {
      changeYear(year + 1);
    });

    $(window).resize(function () {
      let mainTicks = addTicks(yearRange);
      if (earlyYears) {
        addEarlyTicks(earlyYears).css('width', '20%');
        mainTicks.css('width', '80%')
          .css('left', '20%')
      }
    });
  }

  function getDataForMouseEvent (e) {
    let pageX;
    if (e.touches && e.touches[0]) pageX = e.touches[0].pageX;
    else pageX = e.pageX;
    let t = $('.timeline-track', timeline);
    let x = pageX - t.offset().left;
    let pct = x / t.width();
    pct = Math.max(0, Math.min(pct, 1));
    let y = Math.round(pct * (yearRange[1] - yearRange[0]) + yearRange[0]);
    return {pct: pct, year: y};
  }

  function addEras () {
    _eras.forEach(function (e, i) {
      let pct0 = (e.dates[0] - yearRange[0]) / (yearRange[1] - yearRange[0]);
      let pctW = (e.dates[1] - e.dates[0] + 1) / (yearRange[1] - yearRange[0]);
      let era = $('<div>')
        .attr('class', 'era era-' + i)
        .css('left', pct0 * 100 + '%')
        .prependTo($('.timeline-track', timeline));
    });
  }

  function addTicks (range) {
    $('.ticks', timeline).remove()
    let major = (window.innerWidth >= 800 ? 10 : 20);
    let minor = major / 2;
    let ticksContainer = $('<div class="ticks ticks-main">').insertBefore($('.timeline-slider'), timeline);
    appendTick('major', range[0], ticksContainer);
    let next = Math.ceil(range[0] / minor) * minor;
    if (next === range[0]) next += minor;
    while (next < range[1]) {
      appendTick(next % major === 0 ? 'major' : 'minor', next, ticksContainer);
      next += minor;
    }
    let last = $('.tick-major', ticksContainer).last();
    if (last.position().left > $('.timeline-track', timeline).width() - 55)
      $('span', last).remove();
    let first = $('.tick-major', ticksContainer).eq(1);
    // console.log(first.position().left)
    // if (first.position().left < 55)
    //   $('span', first).remove();
    appendTick('major', range[1], ticksContainer);
    return ticksContainer;
  }

  function addEarlyTicks (earlyYears) {
    let ticksContainer = $('<div class="ticks ticks-early">').insertBefore($('.ticks'), timeline);
    earlyYears.forEach(function(y, i) {
      appendTick('major', y, ticksContainer, i / (earlyYears.length));
    });
    return ticksContainer;
  }

  function appendTick (type, value, container, pct) {
    if (pct === undefined) pct = (value - yearRange[0]) / (yearRange[1] - yearRange[0]);
    var t = $('<div>')
      .attr('class', 'tick tick-' + type)
      .css('left', pct * 100 + '%')
      .appendTo(container);
    if (type == 'major') t.append('<span>' + value + '</span>');
  }
/*
  function snapToYear (y) {
    if (years.indexOf(y) !== -1) updateYear(y);
    else if (y <= yearRange[0]) updateYear(yearRange[0]);
    else if (y >= yearRange[1]) updateYear(yearRange[1]);
    else {
      for (let i=0; i<years.length -1; i++) {
        if (years[i] < y && years[i+1] > y) {
          +y - years[i] > years[i+1] - +y ?
            updateYear(years[i+1]) :
            updateYear(years[i]);
        }
      }
    }
  }
*/
  function changeYear (y) {
    updateYear(y);
    dispatch.call('changeyear', this, year);
  }

  function updateYear (y) {
    y = Math.max(yearRange[0], Math.min(+y, yearRange[1]));
    year = y;
    $('.year', stepper).html(year);
    var pct = (year - yearRange[0]) / (yearRange[1] - yearRange[0]);
    $('.timeline-slider', timeline).css('left', pct * 100 + '%');
    $('.icon-angle-left', stepper).toggleClass('disabled', year == yearRange[0]);
    $('.icon-angle-right', stepper).toggleClass('disabled', year == yearRange[1]);
  }

  T.initialize = function (yearsData, eras, early, containerId) {
    if (timeline) return;
    let container = $('#' + containerId);
    _eras = eras;
    years = yearsData;
    year = yearsData[0];
    earlyYears = early;
    yearRange = [+years[0], +years[years.length-1]];
    stepper = $('<div>')
      .attr('class', 'year-stepper')
      .appendTo(container);
    stepper.append('<i class="icon-angle-left">')
      .append('<div class="year">' + year + '</div>')
      .append('<i class="icon-angle-right">');
    let inner = $('<div>').attr('class', 'timeline-inner').appendTo(container);
    timeline = $('<div>')
      .attr('class', 'timeline')
      .appendTo(inner);
    timeline.append('<div class="timeline-track">')
      .append('<div class="timeline-slider">');
    timeline
      .append('<div class="timeline-probe desktop">' + year + '<div>');

    updateYear(year);
    let mainTicks = addTicks(yearRange);
    if (earlyYears) {
      addEarlyTicks(earlyYears).css('width', '20%');
      mainTicks.css('width', '80%')
        .css('left', '20%')
    }

    addEras();
    init_events();

    return T;
  }

  T.setYear = function (newYear) {
    if (newYear == year) return;
    updateYear(newYear);
    return T;
  }

  return T;
})(jQuery, Dispatch);