(function () {
  'use strict';

  const config = {
    inactiveOpacity: 0.35,
    suiteScale: 1.04,
    pulseUp: 0.25,
    pulseDown: 0.3,
    scenarioFade: 0.3,
    scenarioHold: 0.6,
    loopPause: 0.7
  };

  /*
   * SVG lives on GitHub and is delivered through jsDelivr.
   */
  const SVG_URL =
    'https://cdn.jsdelivr.net/gh/mstativko/suite-decision-flow@main/suite-decision-flow.svg';


  function prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }


  /*
   * Load the SVG and insert it INLINE.
   *
   * We need it inline rather than <img> because GSAP needs
   * direct access to #suite-core and #scenario-1/2/3.
   */
  async function loadSvg(illustration) {
    try {
      const response = await fetch(SVG_URL);

      if (!response.ok) {
        throw new Error(
          'SVG request failed: ' + response.status
        );
      }

      const svgMarkup = await response.text();

      illustration.innerHTML = svgMarkup;

      const svg = illustration.querySelector('svg');

      if (!svg) {
        throw new Error('No SVG element found.');
      }

      /*
       * Responsive SVG.
       * Original viewBox remains untouched.
       */
      svg.style.display = 'block';
      svg.style.width = '100%';
      svg.style.height = 'auto';

      return true;

    } catch (error) {
      console.error(
        '[Suite Decision Flow] SVG could not be loaded.',
        error
      );

      return false;
    }
  }


  /*
   * Animation itself.
   */
  function createAnimation(illustration) {
    if (!window.gsap) {
      console.error(
        '[Suite Decision Flow] GSAP is not available.'
      );

      return;
    }

    const gsap = window.gsap;

    const suite =
      illustration.querySelector('#suite-core');

    const scenarios = [
      illustration.querySelector('#scenario-1'),
      illustration.querySelector('#scenario-2'),
      illustration.querySelector('#scenario-3')
    ];


    if (
      !suite ||
      scenarios.some((scenario) => !scenario)
    ) {
      console.error(
        '[Suite Decision Flow] Required SVG IDs were not found.'
      );

      return;
    }


    /*
     * Progressive enhancement:
     *
     * Until JS + SVG + GSAP are all ready,
     * the SVG stays in its normal static state.
     *
     * Only now do we mute the scenarios.
     */
    gsap.set(scenarios, {
      opacity: config.inactiveOpacity
    });


    gsap.set(suite, {
      transformOrigin: '50% 50%',
      transformBox: 'fill-box'
    });


    const masterTimeline = gsap.timeline({
      paused: true,
      repeat: -1
    });


    /*
     * Suite pulse.
     */
    masterTimeline
      .to(suite, {
        scale: config.suiteScale,
        duration: config.pulseUp,
        ease: 'power1.out'
      })
      .to(suite, {
        scale: 1,
        duration: config.pulseDown,
        ease: 'power1.inOut'
      });


    /*
     * Scenarios are alternative outcomes.
     *
     * Sequential highlighting is only used
     * to visually demonstrate possible routes.
     */
    scenarios.forEach((scenario) => {
      masterTimeline
        .to(scenario, {
          opacity: 1,
          duration: config.scenarioFade,
          ease: 'power1.out'
        })
        .to({}, {
          duration: config.scenarioHold
        })
        .to(scenario, {
          opacity: config.inactiveOpacity,
          duration: config.scenarioFade,
          ease: 'power1.in'
        });
    });


    masterTimeline.to({}, {
      duration: config.loopPause
    });


    /*
     * Performance:
     * only run animation while illustration
     * is actually visible.
     */
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              masterTimeline.play();
            } else {
              masterTimeline.pause();
            }
          });
        },
        {
          threshold: 0.25
        }
      );

      observer.observe(illustration);

    } else {
      /*
       * Fallback for very old browsers.
       */
      masterTimeline.play();
    }
  }


  /*
   * Main initialization.
   *
   * This function is called only AFTER
   * the entire Webflow page has loaded.
   */
  async function init() {
    const illustration =
      document.querySelector('[data-suite-decision-flow]');


    if (!illustration) {
      return;
    }


    /*
     * Prevent accidental duplicate initialization.
     */
    if (illustration.dataset.suiteInitialized === 'true') {
      return;
    }

    illustration.dataset.suiteInitialized = 'true';


    /*
     * First load the original SVG.
     */
    const loaded =
      await loadSvg(illustration);


    if (!loaded) {
      return;
    }


    /*
     * Reduced motion:
     * keep SVG completely static.
     *
     * Importantly, we don't initialize
     * the animation at all.
     */
    if (prefersReducedMotion()) {
      return;
    }


    createAnimation(illustration);
  }


  /*
   * Wait until EVERYTHING on the page
   * has finished loading.
   *
   * Images, fonts, videos, etc.
   */
  function startAfterPageLoad() {
    if (document.readyState === 'complete') {
      init();

    } else {
      window.addEventListener(
        'load',
        init,
        { once: true }
      );
    }
  }


  startAfterPageLoad();

}());
