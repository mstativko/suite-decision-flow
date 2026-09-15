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

  const illustration = document.querySelector('[data-suite-decision-flow]');
  const reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!illustration || reduceMotion || typeof window.gsap === 'undefined') {
    return;
  }

  const gsap = window.gsap;
  const suite = illustration.querySelector('#suite-core');
  const scenarios = [
    illustration.querySelector('#scenario-1'),
    illustration.querySelector('#scenario-2'),
    illustration.querySelector('#scenario-3')
  ];

  if (!suite || scenarios.some((scenario) => !scenario)) {
    return;
  }

  gsap.set(scenarios, { opacity: config.inactiveOpacity });
  gsap.set(suite, { transformOrigin: '50% 50%' });

  const masterTimeline = gsap.timeline({ paused: true, repeat: -1 });

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

  scenarios.forEach((scenario) => {
    masterTimeline
      .to(scenario, {
        opacity: 1,
        duration: config.scenarioFade,
        ease: 'power1.out'
      })
      .to({}, { duration: config.scenarioHold })
      .to(scenario, {
        opacity: config.inactiveOpacity,
        duration: config.scenarioFade,
        ease: 'power1.in'
      });
  });

  masterTimeline.to({}, { duration: config.loopPause });

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
    { threshold: 0.1 }
  );

  observer.observe(illustration);
}());
