// timeline 
const getTimeline = (components) => {
  let T = {};

  let timeline;
  let ticksOuter;
  let stepper;
  let years;
  let yearRange = [];
  let year = 2015;
  let earlyYears;
  let _eras;
  let _totalSteps;
  let earlyWidth = 20;  // %

  function init_events () {
    const { init } = components;
    const { formatYear } = init;
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
          .html(formatYear(d.year));
      })
      .on('mouseleave', function () {
        $('.timeline-probe', timeline).hide();
      });

    $('.icon-angle-left', stepper).click(function () {
      let era = getEraForYear(year);
      let i = eras.indexOf(era);
      if (era != eras[0] || year != era.dates[0]) {
        if (year == era.dates[0]) changeYear(eras[i-1].dates[1])
        else {
          let y = era.dates[0];
          let newYear = y;
          while (y < year) {
            newYear = y;
            y += era.increment;
          }
          changeYear(newYear);
        }
      }
    });

    $('.icon-angle-right', stepper).click(function () {
      let era = getEraForYear(year);
      let i = eras.indexOf(era);
      if (era != eras[eras.length - 1] || year != era.dates[1]) {
        if (year == era.dates[1]) changeYear(eras[i+1].dates[0])
        else {
          let y = era.dates[0];
          while (y <= year) {
            y += era.increment;
          }
          if (y > era.dates[1]) y = era.dates[1];
          changeYear(y);
        }
      }
    });

    $(window).resize(function () {
      addTicks();
      updateYear(year);
    });
  }

  function getDataForMouseEvent (e) {
    const { eras } = components;
    let pageX;
    if (e.touches && e.touches[0]) pageX = e.touches[0].pageX;
    else pageX = e.pageX;
    let t = $('.timeline-track', timeline);
    let x = pageX - t.offset().left;
    let tickContainers = $('.ticks', timeline);
    let era;
    let localX;
    x = Math.max(0, Math.min(t.width(), x));
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
    let tickBefore;
    let tickAfter;
    $('.tick').each(function () {
      let val = $(this).data('value');
      if (y == val) {
        tick = $(this);
      } else if (y > val) {
        tickBefore = $(this);
      } else if (!tickAfter) {
        tickAfter = $(this);
      }
    });
    if (tick) return tick.position().left + tick.parent().position().left;
    else if (!tickBefore) return 0;
    else if (!tickAfter) return $('.timeline-track', timeline).width();
    else {
      let valBefore = tickBefore.data('value');
      let valAfter = tickAfter.data('value');
      let dist = tickAfter.offset().left - tickBefore.offset().left;
      return tickBefore.position().left + tickBefore.parent().position().left + ((y - valBefore) / (valAfter - valBefore)) * dist;
    }
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
      let mainInterval = window.innerWidth > 840 ? 10 : 20;
      let otherIntervalTest = (index == 0 || index == 4 || index == 7 || index == 10);
      if (window.innerWidth < 1090) otherIntervalTest = (index == 0 || index == 7 || index == 10);
      if (window.innerWidth < 900) otherIntervalTest = (index == 0 || index == 10);

      while (tickVal < era.dates[1]) {
        let type;
        if (era.increment == 1 && tickVal % mainInterval == 0) type = 'major';
        else if (era.increment == 1 && tickVal % 5 == 0) type = 'minor';
        else if (era.increment != 1) {
          if (tickVal == era.dates[0] && otherIntervalTest) type = 'major';
          // hard-coded index values that 
        }
        if (!type) type = 'hidden';
        appendTick(type, tickVal, stepWidth * i, ticksContainer)
        tickVal += era.increment;
        i++;
      }

    });
  }

  function appendTick (type, value, x, container) {
    const { init } = components;
    const { formatYear } = init;
    var t = $('<div>')
      .attr('class', 'tick tick-' + type)
      .css('left', x + 'px')
      .attr('data-value', value)
      .data('value', value)
      .appendTo(container);
    if (type == 'major') t.append('<span>' + formatYear(value) + '</span>');
  }

  function changeYear (y) {
    const { dispatch } = components;
    updateYear(y);
    dispatch.call('changeyear', this, year);
  }

  function updateYear (y) {
    const { init, eras } = components;
    const { formatYear } = init;
    year = y;
    $('.year', stepper).html(formatYear(year));
    $('.timeline-slider', timeline).css('left', getXForYear(y) + 'px');
    $('.icon-angle-left', stepper).toggleClass('disabled', year == eras[0].dates[0])
    $('.icon-angle-right', stepper).toggleClass('disabled', year == eras[eras.length-1].dates[1])
  }

  function getEraForYear (y) {
    let era;
    eras.forEach(function (e) {
      if (y >= e.dates[0] && y <= e.dates[1]) era = e;
    });
    return era;
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
    
    let mainTicks = addTicks();

    init_events();

    updateYear(year);

    return T;
  }

  T.setYear = function (newYear) {
    if (newYear == year) return;
    updateYear(newYear);
    return T;
  }

  return T;
};
export default getTimeline;