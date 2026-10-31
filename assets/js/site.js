/* 渐进增强：滚动高亮、山湖视差与入场。内容与链接不依赖脚本。 */
(() => {
  const motionQuery = window.matchMedia('(prefers-reduced-motion: no-preference)');

  const setMotion = () => {
    document.documentElement.classList.toggle('motion', motionQuery.matches);
  };
  setMotion();
  if (motionQuery.addEventListener) motionQuery.addEventListener('change', setMotion);

  initScrollSpy();
  initBackground();
  if (motionQuery.matches) {
    initReveal();
  }

  function initScrollSpy() {
    if (!document.body.classList.contains('home')) return;
    const links = [...document.querySelectorAll('.nav a')];
    const sections = [...document.querySelectorAll('main section[id]')];
    const header = document.querySelector('.site-header');
    if (!links.length || !sections.length) return;

    const linkFor = (id) => {
      if (id === 'posts') {
        return links.find((link) => {
          const path = new URL(link.href, location.origin).pathname.replace(/\/+$/, '');
          return path.endsWith('/blog');
        });
      }
      return links.find((link) => new URL(link.href, location.origin).hash === `#${id}`);
    };

    let frame = 0;
    const update = () => {
      frame = 0;
      const headerH = header ? header.getBoundingClientRect().height : 0;
      const line = headerH + 36;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const canScroll = maxScroll > 8;
      const atBottom = canScroll && window.scrollY >= maxScroll - 24;
      let current = null;
      if (atBottom) {
        current = sections[sections.length - 1];
      } else {
        for (const section of sections) {
          if (section.getBoundingClientRect().top <= line) current = section;
        }
      }
      const active = current ? linkFor(current.id) : null;
      for (const link of links) {
        const on = link === active;
        link.classList.toggle('is-active', on);
        if (on) link.setAttribute('aria-current', 'location');
        else if (link.getAttribute('aria-current') === 'location') link.removeAttribute('aria-current');
      }
    };

    const request = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request, { passive: true });
    window.addEventListener('hashchange', request);
  }

  function initReveal() {
    if (!('IntersectionObserver' in window)) {
      document.documentElement.classList.remove('motion');
      return;
    }
    const nodes = [...document.querySelectorAll('.reveal')];
    if (!nodes.length) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.22, rootMargin: '0px 0px -8% 0px' });
    nodes.forEach((node) => observer.observe(node));
  }

  function initBackground() {
    const backdrop = document.querySelector('.site-backdrop');
    if (!backdrop) return;
    const hero = document.querySelector('.home .hero');
    let scrollFrame = 0;
    const parallax = () => {
      scrollFrame = 0;
      const y = Math.max(window.scrollY, 0);
      const shift = motionQuery.matches ? Math.min(y * 0.035, 12) : 0;
      backdrop.style.setProperty('--background-shift', `${shift}px`);
      document.body.classList.toggle('is-reading', !hero || y > hero.offsetHeight * 0.55);
    };
    const onScroll = () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(parallax);
    };
    parallax();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    if (motionQuery.addEventListener) motionQuery.addEventListener('change', onScroll);
  }
})();
