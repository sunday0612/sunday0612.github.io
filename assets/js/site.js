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
    const hero = document.querySelector('main .hero');
    const header = document.querySelector('.site-header');
    if (!links.length || !sections.length) return;
    const homeLink = links.find((link) => {
      const url = new URL(link.href, location.origin);
      return !url.hash && url.pathname === location.pathname;
    });

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
      // 按导航下方各分区实际占据的可见面积判断，避免文章已成为
      // 主要阅读内容时，仍要等分节边框贴近导航栏才切换高亮。
      const visibleHeight = (node) => {
        const rect = node.getBoundingClientRect();
        return Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, headerH));
      };
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const canScroll = maxScroll > 8;
      const atBottom = canScroll && window.scrollY >= maxScroll - 24;
      let current = null;
      let largest = hero ? visibleHeight(hero) : 0;
      if (atBottom) {
        current = sections[sections.length - 1];
      } else {
        for (const section of sections) {
          const visible = visibleHeight(section);
          if (visible > largest) {
            largest = visible;
            current = section;
          }
        }
      }
      const active = current ? linkFor(current.id) : homeLink;
      for (const link of links) {
        const on = link === active;
        link.classList.toggle('is-active', on);
        if (on) link.setAttribute('aria-current', link === homeLink ? 'page' : 'location');
        else link.removeAttribute('aria-current');
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
    window.addEventListener('load', request);
    window.addEventListener('pageshow', request);
    if ('ResizeObserver' in window && header) {
      const observer = new ResizeObserver(() => {
        document.documentElement.style.setProperty('--header-offset', `${header.getBoundingClientRect().height}px`);
        request();
      });
      observer.observe(header);
    }
    if (document.fonts?.ready) document.fonts.ready.then(request);
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
