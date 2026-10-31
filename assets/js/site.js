/* 渐进增强：滚动高亮、山湖视差与入场。内容与链接不依赖脚本。 */
(() => {
  const motionQuery = window.matchMedia('(prefers-reduced-motion: no-preference)');

  const setMotion = () => {
    document.documentElement.classList.toggle('motion', motionQuery.matches);
  };
  setMotion();
  if (motionQuery.addEventListener) motionQuery.addEventListener('change', setMotion);

  initScrollSpy();
  if (motionQuery.matches) {
    initHero();
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

  function initHero() {
    const hero = document.querySelector('.home .hero');
    if (!hero) return;
    const img = hero.querySelector('.hero-art img');
    const atmosphere = hero.querySelector('.hero-atmosphere');
    const sky = hero.querySelector('.hero-sky');

    let scrollFrame = 0;
    const parallax = () => {
      scrollFrame = 0;
      const y = Math.max(window.scrollY, 0);
      const limit = hero.offsetHeight * 0.08;
      const shift = Math.min(y * 0.12, limit);
      if (img) img.style.transform = `translate3d(0, ${shift}px, 0) scale(1.26)`;
      if (atmosphere) atmosphere.style.transform = `translate3d(0, ${shift * 0.45}px, 0)`;
    };
    const onScroll = () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(parallax);
    };
    parallax();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    if (!sky) return;
    const ctx = sky.getContext('2d', { alpha: true });
    if (!ctx) return;
    const mobile = window.matchMedia('(max-width: 719px)').matches;
    const specks = Array.from({ length: mobile ? 16 : 30 }, (_, i) => {
      const firefly = i % 5 === 0;
      return {
        x: Math.random(),
        y: firefly ? 0.38 + Math.random() * 0.24 : Math.random() * 0.58,
        r: firefly ? 1.15 + Math.random() * 0.7 : 0.35 + Math.random() * 0.85,
        a: firefly ? 0.45 + Math.random() * 0.4 : 0.18 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        speed: 0.35 + Math.random() * 0.9,
        drift: (Math.random() - 0.5) * (firefly ? 0.035 : 0.01),
        rise: firefly ? -0.008 - Math.random() * 0.012 : 0,
        firefly
      };
    });

    const fit = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
      const rect = sky.getBoundingClientRect();
      sky.width = Math.max(1, Math.floor(rect.width * ratio));
      sky.height = Math.max(1, Math.floor(rect.height * ratio));
    };
    fit();
    window.addEventListener('resize', fit);

    let visible = true;
    if ('IntersectionObserver' in window) {
      const watch = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      });
      watch.observe(hero);
    }

    let last = 0;
    const draw = (time) => {
      requestAnimationFrame(draw);
      if (!visible || document.hidden || !motionQuery.matches) return;
      if (time - last < 34) return;
      const dt = Math.min(0.05, (time - last) / 1000 || 0.016);
      last = time;
      const width = sky.width;
      const height = sky.height;
      ctx.clearRect(0, 0, width, height);
      for (const speck of specks) {
        speck.phase += dt * speck.speed;
        speck.x += speck.drift * dt;
        speck.y += speck.rise * dt;
        if (speck.x < 0) speck.x += 1;
        if (speck.x > 1) speck.x -= 1;
        if (speck.y < 0.32) speck.y = 0.62;
        const alpha = speck.a * (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(speck.phase)));
        ctx.beginPath();
        ctx.fillStyle = speck.firefly
          ? `rgba(223, 196, 140, ${alpha})`
          : `rgba(236, 232, 222, ${alpha * 0.85})`;
        const unit = sky.clientWidth > 0 ? width / sky.clientWidth : 1;
        ctx.arc(speck.x * width, speck.y * height, speck.r * unit, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    requestAnimationFrame(draw);
  }
})();
