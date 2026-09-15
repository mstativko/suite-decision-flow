(function () {
  'use strict';

  const SVG_URL =
    'https://raw.githubusercontent.com/mstativko/suite-decision-flow/main/suite-decision-flow.svg';

  const config = {
    inactiveOpacity: 0.35,
    suiteScale: 1.04,

    pulseUp: 0.25,
    pulseDown: 0.3,

    scenarioFade: 0.3,
    scenarioHold: 0.6,

    loopPause: 0.7
  };

  function init() {
    const container = document.querySelector('[data-suite-decision-flow]');

    if (!container) {
      console.warn('[Suite Decision Flow] Container not found.');
      return;
    }

    /*
     * Load SVG as text and inject it INLINE.
     * This is important: GSAP needs access to the elements
     * inside the SVG DOM.
     */
    fetch(SVG_URL)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('SVG request failed: ' + response.status);
        }

        return response.text();
      })
      .then(function (svgText) {
        container.innerHTML = svgText;

        const svg = container.querySelector('svg');

        if (!svg) {
          throw new Error('SVG element was not found after injection.');
        }

        // Responsive SVG
        svg.removeAttribute('width');
        svg.removeAttribute('height');

        svg.style.display = 'block';
        svg.style.width = '100%';
        svg.style.height = 'auto';

        createAnimation(container);
      })
      .catch(function (error) {
        console.error('[Suite Decision Flow]', error);
      });
  }

  function createAnimation(container) {
    const reduceMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /*
     * Progressive enhancement:
     * if reduced motion is enabled, leave the SVG completely static.
     */
    if (reduceMotion) {
      return;
    }

    if (typeof window.gsap === 'undefined') {
      console.warn('[Suite Decision Flow] GSAP is not available.');
      return;
    }

    const gsap = window.gsap;

    const suite = container.querySelector('#suite-core');

    const scenarios = [
      container.querySelector('#scenario-1'),
      container.querySelector('#scenario-2'),
      container.querySelector('#scenario-3')
    ];

    if (!suite || scenarios.some(function (scenario) {
      return !scenario;
    })) {
      console.error(
        '[Suite Decision Flow] Required SVG IDs were not found.'
      );
      return;
    }

    /*
     * Only now do we apply the inactive state.
     * Before JS loads, the SVG remains fully visible.
     */
    gsap.set(scenarios, {
      opacity: config.inactiveOpacity
    });

    gsap.set(suite, {
      transformOrigin: '50% 50%',
      transformBox: 'fill-box'
    });

    const timeline = gsap.timeline({
      paused: true,
      repeat: -1
    });

    /*
     * Suite pulse
     */
    timeline
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
     * Demonstrate the three possible scenarios.
     * These are alternatives, not sequential workflow steps.
     */
    scenarios.forEach(function (scenario) {
      timeline
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

    timeline.to({}, {
      duration: config.loopPause
    });

    /*
     * Only animate while illustration is visible.
     */
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              timeline.play();
            } else {
              timeline.pause();
            }
          });
        },
        {
          threshold: 0.25
        }
      );

      observer.observe(container);
    } else {
      timeline.play();
    }

    console.log('[Suite Decision Flow] Animation ready.');
  }

  /*
   * Wait until the whole page has loaded.
   */
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init, { once: true });
  }
})();
