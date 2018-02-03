// timeline 
let Timeline = (function($, dispatch) {
  
  let T = {};

  let timeline;
  let ticksOuter;
  let stepper;
  let years;
  let yearRange = [];
  let year = 2015;
  let earlyYears;
  let _ears;
  let _totalSteps;
  let earlyWidth = 20;  // %

  function init_events () {
    $('.timeline-slider, .timeline-track', timeline).on('mousedown touchstart', function (e) {
      let y = getDataForMouseEvent(e).year;
      $(document)
        .on('mousemove.timeslide touchmove.timeslide', function (e) {
          let d = getDataForMouseEvent(e);
          $('.timeline-slider', timeline).css('left', d.x + 'px');
          y = d.year;
        })
        .on('mouseup.timeslide mouseleave.timeslide touchend.timeslide', function (){
          $(document).off('mousemove.timeslide mouseup.timeslide mouseleave.timeslide touchmove.timeslide touchend.timeslide');
          changeYear(y);
        })
    });

    $('.timeline-track, .timeline-slider, .ticks', timeline)
      .on('mousemove.timeline', function (e) {
        let d = getDataForMouseEvent(e);
        $('.timeline-probe', timeline)
          .show()
          .css('left', d.x + 'px')
          .html(d.year);
      })
      .on('mouseleave', function () {
        $('.timeline-probe', timeline).hide();
      });

    $('.icon-angle-left', stepper).click(function () {
      if (earlyYears) {
        if (year == yearRange[0])
          changeYear(earlyYears[earlyYears.length-1]);
        else if (year < yearRange[0])
          changeYear(earlyYears[earlyYears.indexOf(year) - 1]);
        else
          changeYear(year - 1);
      } else {
        changeYear(year - 1);
      }
      
    });

    $('.icon-angle-right', stepper).click(function () {
      if (earlyYears) {
        if (year == earlyYears[earlyYears.length-1])
          changeYear(yearRange[0]);
        else if (year < yearRange[0]) 
          changeYear(earlyYears[earlyYears.indexOf(year) + 1]);
        else
          changeYear(year + 1);
      } else {
        changeYear(year + 1);
      }
    });

    $(window).resize(function () {
      addTicks();
      // let mainTicks = addTicks(yearRange);
      // if (earlyYears) {
      //   addEarlyTicks(earlyYears).css('width', earlyWidth + '%');
      //   mainTicks.css('width', (100 - earlyWidth) + '%')
      //     .css('left', earlyWidth + '%')
      // }
    });
  }

  function getDataForMouseEvent (e) {
    let pageX;
    if (e.touches && e.touches[0]) pageX = e.touches[0].pageX;
    else pageX = e.pageX;
    let t = $('.timeline-track', timeline);
    let x = pageX - t.offset().left;
    let tickContainers = $('.ticks', timeline);
    let era;
    let localX;
    for (let i = 0; i < eras.length; i ++) {
      let nextX = i < eras.length - 1 ? tickContainers.eq(i + 1).position().left : timeline.width() + 5;
      if (x < nextX) {
        era = eras[i];
        localX = x - tickContainers.eq(i).position().left;
        break;
      }
    }
    let stepWidth = timeline.width() / (_totalSteps);
    let eraSteps = Math.ceil((era.dates[1] - era.dates[0])/era.increment);
    let roundedStep = Math.min(Math.floor(localX / stepWidth), eraSteps - 1);
    if ((era.dates[1] - era.dates[0]) % era.increment != 0 ) eraSteps++;
    let year = roundedStep == eraSteps - 1 ? era.dates[1] : era.dates[0] + era.increment * roundedStep;

    return {x: x, year: year}
  }

  function getXForYear (y) {
    let tick;
    $('.tick').each(function () {
      if (y == $(this).data('value')) {
        tick = $(this);
      }
    })
    if (tick) return tick.position().left + tick.parent().position().left;
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

  function addTicks () {
    $('.ticks', timeline).remove();
    let width = timeline.width();
    let stepWidth = width / (_totalSteps);
    _eras.forEach(function (era, index) {
      let steps = Math.ceil((era.dates[1] - era.dates[0])/era.increment);
      if ((era.dates[1] - era.dates[0]) % era.increment != 0 ) steps++;
      
      let ticksContainer = $('<div class="ticks ticks-main">').appendTo(ticksOuter);
      ticksContainer.css('width', (stepWidth * (steps)) + 'px');
      let i = 0;
      let tickVal = era.dates[0];
      while (tickVal < era.dates[1]) {
        appendTick('minor', tickVal, stepWidth * i, ticksContainer)
        tickVal += era.increment;
        i++;
      }
      appendTick('minor', era.dates[1], stepWidth * i, ticksContainer)

    });
    // let major = (window.innerWidth >= 800 ? 10 : 20);
    // let minor = major / 2;
    // let ticksContainer = $('<div class="ticks ticks-main">').insertBefore($('.timeline-slider'), timeline);
    // appendTick('major', range[0], ticksContainer);
    // let next = Math.ceil(range[0] / minor) * minor;
    // if (next === range[0]) next += minor;
    // while (next < range[1]) {
    //   appendTick(next % major === 0 ? 'major' : 'minor', next, ticksContainer);
    //   next += minor;
    // }
    // let last = $('.tick-major', ticksContainer).last();
    // if (last.position().left > $('.timeline-track', timeline).width() - 55)
    //   $('span', last).remove();
    // let first = $('.tick-major', ticksContainer).eq(1);
    // // console.log(first.position().left)
    // // if (first.position().left < 55)
    // //   $('span', first).remove();
    // appendTick('major', range[1], ticksContainer);
    //return ticksContainer;
  }

  function appendTick (type, value, x, container) {
    var t = $('<div>')
      .attr('class', 'tick tick-' + type)
      .css('left', x + 'px')
      .data('value', value)
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
    //y = Math.max(yearRange[0], Math.min(+y, yearRange[1]));
    year = y;
    // var pct;
     $('.year', stepper).html(year);
    // if (earlyYears) {
    //   if (y < yearRange[0]) {
    //     pct = (earlyWidth/100) * earlyYears.indexOf(y) / earlyYears.length;
    //   } else {
    //     pct = (year - yearRange[0]) / (yearRange[1] - yearRange[0]) * (100 - earlyWidth)/100 + earlyWidth/100;
    //   }
    // } else {
    //   pct = (year - yearRange[0]) / (yearRange[1] - yearRange[0]);
    // }
     $('.timeline-slider', timeline).css('left', getXForYear(y) + 'px');
    // $('.icon-angle-left', stepper).toggleClass('disabled', earlyYears ? (year == earlyYears[0]) : (year == yearRange[0]));
     //$('.icon-angle-right', stepper).toggleClass('disabled', year == yearRange[1]);
  }

  T.initialize = function (eras, containerId) {
    if (timeline) return;
    let container = $('#' + containerId);
    _eras = eras;
    _totalSteps = _.reduce(eras, function (m, e) {
      let steps = Math.ceil((e.dates[1] - e.dates[0])/e.increment);
      if ((e.dates[1] - e.dates[0]) % e.increment != 0 ) steps++; // unless it divides perfectly, add an extra step for end year
      e.steps = steps;
      return m + steps;
    }, 0);
    year = eras[0].dates[0];
  
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
    ticksOuter = $('<div>')
      .attr('class', 'ticks-container')
      .appendTo(timeline);
    timeline.append('<div class="timeline-slider">');
    timeline
      .append('<div class="timeline-probe desktop">' + year + '<div>');

    updateYear(year);
    
    let mainTicks = addTicks();
    // if (earlyYears) {
    //   addEarlyTicks(earlyYears).css('width', earlyWidth + '%');
    //   mainTicks.css('width', (100 - earlyWidth) + '%')
    //     .css('left', earlyWidth + '%')
    // }

    // addEras();
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