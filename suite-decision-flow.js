(function () {
  'use strict';

  const SVG_URL =
    'https://raw.githubusercontent.com/mstativko/suite-decision-flow/main/suite-decision-flow.svg';

  const config = {
    inactiveOpacity: 0.35,
    scenarioFade: 0.35,
    scenarioHold: 1.2
  };

  function init() {
    const container = document.querySelector('[data-suite-decision-flow]');

    if (!container) {
      console.warn('[Suite Decision Flow] Container not found.');
      return;
    }

    /*
     * Load SVG as text and inject it INLINE.
     * GSAP needs access to the elements inside the SVG DOM.
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
     * Reduced motion:
     * leave the original SVG completely static.
     */
    if (reduceMotion) {
      return;
    }

    if (typeof window.gsap === 'undefined') {
      console.warn('[Suite Decision Flow] GSAP is not available.');
      return;
    }

    const gsap = window.gsap;

    const scenarios = [
      container.querySelector('#scenario-1'),
      container.querySelector('#scenario-2'),
      container.querySelector('#scenario-3')
    ];

    if (scenarios.some(function (scenario) {
      return !scenario;
    })) {
      console.error(
        '[Suite Decision Flow] Required SVG scenario IDs were not found.'
      );
      return;
    }

    /*
     * Initial state:
     *
     * Scenario 1 = active
     * Scenario 2 = inactive
     * Scenario 3 = inactive
     */
    gsap.set(scenarios, {
      opacity: config.inactiveOpacity
    });

    gsap.set(scenarios[0], {
      opacity: 1
    });

    const timeline = gsap.timeline({
      paused: true,
      repeat: -1
    });

    /*
     * Hold Scenario 1.
     */
    timeline.to({}, {
      duration: config.scenarioHold
    });

    /*
     * Scenario 1 → Scenario 2
     */
    timeline
      .to(scenarios[0], {
        opacity: config.inactiveOpacity,
        duration: config.scenarioFade,
        ease: 'power1.inOut'
      })
      .to(scenarios[1], {
        opacity: 1,
        duration: config.scenarioFade,
        ease: 'power1.inOut'
      }, '<')
      .to({}, {
        duration: config.scenarioHold
      });

    /*
     * Scenario 2 → Scenario 3
     */
    timeline
      .to(scenarios[1], {
        opacity: config.inactiveOpacity,
        duration: config.scenarioFade,
        ease: 'power1.inOut'
      })
      .to(scenarios[2], {
        opacity: 1,
        duration: config.scenarioFade,
        ease: 'power1.inOut'
      }, '<')
      .to({}, {
        duration: config.scenarioHold
      });

    /*
     * Scenario 3 → Scenario 1
     */
    timeline
      .to(scenarios[2], {
        opacity: config.inactiveOpacity,
        duration: config.scenarioFade,
        ease: 'power1.inOut'
      })
      .to(scenarios[0], {
        opacity: 1,
        duration: config.scenarioFade,
        ease: 'power1.inOut'
      }, '<');

    /*
     * Only animate while the illustration is visible.
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
