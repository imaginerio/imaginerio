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


  function initEvents() {
    const { init, eras } = components;
    const { formatYear } = init;
    $('.timeline-slider, .timeline-track', timeline).on('mousedown touchstart', (e) => {
      let y = getDataForMouseEvent(e).year;
      $(document)
        .on('mousemove.timeslide touchmove.timeslide', (ee) => {
          const d = getDataForMouseEvent(ee);
          $('.timeline-slider', timeline).css('left', d.x + 'px');
          y = d.year;
        })
        .on('mouseup.timeslide mouseleave.timeslide touchend.timeslide', () => {
          $(document).off('mousemove.timeslide mouseup.timeslide mouseleave.timeslide touchmove.timeslide touchend.timeslide');
          changeYear(y);
        });
    });

    $('.timeline-track, .timeline-slider, .ticks', timeline)
      .on('mousemove.timeline', (e) => {
        const timelineInner = $('.timeline-inner');

        const d = getDataForMouseEvent(e);

        $('.timeline-probe', timeline)
          .show()
          .css('left', `${d.x}px`)
          .html(formatYear(d.year));

        const timelineEraProbe = $('.timeline-era-probe', timeline)
          .show()
          .html(d.era);
        const eraProbeLeft = timelineEraProbe.width() / 2;
        const eraProbeWidth = timelineEraProbe.width() +
          parseFloat(timelineEraProbe.css('padding-left').replace('px', '')) +
          parseFloat(timelineEraProbe.css('padding-right').replace('px', ''));

        const offset = timelineInner.width() - ((d.x - eraProbeLeft) + eraProbeWidth);

        const posEnd = offset <= 0 ? offset : 0;

        timelineEraProbe
          .css('left', `${(d.x - eraProbeLeft) + posEnd}`);
      })
      .on('mouseleave', () => {
        $('.timeline-probe', timeline).hide();
        $('.timeline-era-probe', timeline).hide();
      });

    $('.icon-angle-left', stepper).click(() => {
      const era = getEraForYear(year);
      console.log('era', era);
      const i = eras.indexOf(era);
      console.log(year !== era.dates[0]);
      if (era !== eras[0]) {
        if (year === era.dates[0]) {
          if (era.dates[0] === eras[i - 1].dates[1]) {
            // this is so stepper doesn't get stuck when eras have overlapping end/start dates
            changeYear(eras[i - 1].dates[1] - eras[i - 1].increment);
          } else {
            changeYear(eras[i - 1].dates[1]);
          }
        } else {
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

    $('.icon-angle-right', stepper).click(() => {
      const era = getEraForYear(year);
      const i = eras.indexOf(era);
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

    $(window).resize(() => {
      addTicks();
      updateYear(year);
    });
  }

  function getDataForMouseEvent(e) {
    const { eras } = components;
    let pageX;

    if (e.touches && e.touches[0]) {
      ([{ pageX }] = e.touches);
      console.log('pagex', pageX);
    } else {
      ({ pageX } = e);
    }
    const t = $('.timeline-track', timeline);
    let x = pageX - t.offset().left;
    const tickContainers = $('.ticks', timeline);
    let era;
    let localX;
    // x = Math.max(0, Math.min(t.width(), x));
    for (let i = 0; i < eras.length; i++) {
      const nextX = i < eras.length - 1 ? tickContainers.eq(i + 1).position().left : timeline.width() + 5;
      if (x < nextX) {
        era = eras[i];
        localX = x - tickContainers.eq(i).position().left;
        break;
      }
    }
    const stepWidth = timeline.width() / (_totalSteps);
    let eraSteps = Math.ceil((era.dates[1] - era.dates[0]) / era.increment);
    const roundedStep = Math.min(Math.floor(localX / stepWidth), eraSteps - 1);
    if ((era.dates[1] - era.dates[0]) % era.increment != 0 ) eraSteps += 1;
    const innerYear = roundedStep == eraSteps - 1 ? era.dates[1] : era.dates[0] + era.increment * roundedStep;

    const displayEra = eras.find((d, i) =>
      (i === 0 && innerYear === d.dates[0]) ||
      (i === eras.length - 1 && innerYear === d.dates[1]) ||
      (innerYear >= d.dates[0] && innerYear <= d.dates[1]));

    return { x, year: innerYear, era: displayEra.name };
  }

  function getXForYear(y) {
    let tick;
    let tickBefore;
    let tickAfter;
    $('.tick').each(function setTick() {
      const val = $(this).data('value');
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
    
    const valBefore = tickBefore.data('value');
    const valAfter = tickAfter.data('value');
    const dist = tickAfter.offset().left - tickBefore.offset().left;
    return tickBefore.position().left + tickBefore.parent().position().left + ((y - valBefore) / (valAfter - valBefore)) * dist;
  }

  function addEras() {
    _eras.forEach((e, i) => {
      const pct0 = (e.dates[0] - yearRange[0]) / (yearRange[1] - yearRange[0]);
      const pctW = (e.dates[1] - e.dates[0] + 1) / (yearRange[1] - yearRange[0]);
      const era = $('<div>')
        .attr('class', 'era era-' + i)
        .css('left', pct0 * 100 + '%')
        .prependTo($('.timeline-track', timeline));
    });
  }

  function addTicks() {
    $('.ticks', timeline).remove();
    const width = timeline.width();
    const stepWidth = width / (_totalSteps);
    // loop through each era
    _eras.forEach((era, index) => {
      // total # of steps to click through
      let steps = Math.ceil((era.dates[1] - era.dates[0]) / era.increment);

      // add extra step if not divisible by increment
      if ((era.dates[1] - era.dates[0]) % era.increment !== 0 ) steps += 1;

      const ticksContainer = $('<div class="ticks ticks-main">').appendTo(ticksOuter);
      ticksContainer.css('width', `${stepWidth * steps}px`);
      
      let i = 0; // which # tick we're on for current era
      let tickVal = era.dates[0];
      // const mainInterval = window.innerWidth > 840 ? 10 : 20;
      // let otherIntervalTest = (index === 0 || index === 4 || index === 7 || index === 10);
      // testing for specific eras, to set special rules for major/minor ticks for those eras
      // if (window.innerWidth < 1090) otherIntervalTest = (index === 0 || index === 7 || index === 10);
      // if (window.innerWidth < 900) otherIntervalTest = (index === 0 || index === 10);
      const majorInterval = window.innerWidth >= 1090 ? 20 : 40;
      const minorInterval = majorInterval / 2;
      while (tickVal < era.dates[1]) {
        let type;
        if (tickVal % majorInterval === 0) {
          type = 'major';
        } else if (tickVal % minorInterval === 0) {
          type = 'minor';
        } else {
          type = 'hidden';
        }
        // if (era.increment === 1 && tickVal % mainInterval === 0) type = 'major';
        // else if (era.increment === 1 && tickVal % 5 === 0) type = 'minor';
        // else if (era.increment !== 1) {
        //   if (tickVal === era.dates[0] && otherIntervalTest) type = 'major';
        // }
        // if (type === undefined) {
        //   type = 'hidden';
        // }
        appendTick(type, tickVal, stepWidth * i, ticksContainer);
        tickVal += era.increment; // current tick value
        i += 1;
      }
    });
  }

  function appendTick(type, value, x, container) {
    const { init } = components;
    const { formatYear } = init;
    const t = $('<div>')
      .attr('class', 'tick tick-' + type)
      .css('left', x + 'px')
      .attr('data-value', value)
      .data('value', value)
      .appendTo(container);
    if (type == 'major') t.append('<span>' + formatYear(value) + '</span>');
  }

  function changeYear(y) {
    const { dispatch } = components;
    updateYear(y);
    dispatch.call('changeyear', this, year);
  }

  function updateYear(y) {
    const { init, eras } = components;
    const { formatYear } = init;
    year = y;
    $('.year', stepper).html(formatYear(year));
    $('.timeline-slider', timeline).css('left', getXForYear(y) + 'px');
    $('.icon-angle-left', stepper).toggleClass('disabled', year == eras[0].dates[0])
    $('.icon-angle-right', stepper).toggleClass('disabled', year == eras[eras.length-1].dates[1])
  }

  function getEraForYear(y) {
    const { eras } = components;
    let era;
    eras.forEach((e) => {
      if (y >= e.dates[0] && y <= e.dates[1]) era = e;
    });
    return era;
  }

  T.initialize = function initialize(eras, containerId) {
    if (timeline) return;
    const container = $('#' + containerId);
    _eras = eras;
    _totalSteps = _.reduce(eras, (m, e) => {
      let steps = Math.ceil((e.dates[1] - e.dates[0]) / e.increment);
      if ((e.dates[1] - e.dates[0]) % e.increment !== 0) steps += 1; // unless it divides perfectly, add an extra step for end year
      e.steps = steps;
      return m + steps;
    }, 0);

    [year] = eras[0].dates;
  
    stepper = $('<div>')
      .attr('class', 'year-stepper')
      .appendTo(container);
    stepper.append('<i class="icon-angle-left">')
      .append('<div class="year">' + year + '</div>')
      .append('<i class="icon-angle-right">');
    const inner = $('<div>').attr('class', 'timeline-inner').appendTo(container);
    timeline = $('<div>')
      .attr('class', 'timeline')
      .appendTo(inner);
    timeline.append('<div class="timeline-track">');
    ticksOuter = $('<div>')
      .attr('class', 'ticks-container')
      .appendTo(timeline);
    timeline.append('<div class="timeline-slider">');

    timeline.append(`<div class="timeline-probe desktop">${year}<div>`);
    timeline.append('<div class="timeline-era-probe desktop"><div>');

    const mainTicks = addTicks();

    initEvents();

    updateYear(year);

    return T;
  };

  T.setYear = (newYear) => {
    if (newYear == year) return;
    updateYear(newYear);
    return T;
  };

  return T;
};
export default getTimeline;
