/* Progressive enhancement: visible content first, an accessible menu, and one current nav item. */
(() => {
  document.documentElement.classList.add('js');
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('#primary-nav');
  const toggle = document.querySelector('.menu-toggle');
  const desktop = window.matchMedia('(min-width: 720px)');
  let menuOpen = false;

  const syncHeader = () => {
    if (header) document.documentElement.style.setProperty('--header-offset', `${header.getBoundingClientRect().height}px`);
  };
  syncHeader();
  if (header && 'ResizeObserver' in window) new ResizeObserver(syncHeader).observe(header);
  window.addEventListener('resize', syncHeader, { passive: true });

  function setMenu(open, returnFocus = false) {
    if (!nav || !toggle) return;
    menuOpen = open;
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? '关闭' : '菜单';
    document.querySelectorAll('.site-main,.site-footer').forEach(node => { node.inert = open; });
    if (open) nav.querySelector('a')?.focus();
    else if (returnFocus) toggle.focus();
  }

  toggle?.addEventListener('click', () => setMenu(!menuOpen));
  nav?.addEventListener('click', event => { if (event.target.closest('a') && menuOpen) setMenu(false); });
  if (desktop.addEventListener) desktop.addEventListener('change', event => { if (event.matches) setMenu(false); });
  document.addEventListener('keydown', event => {
    if (!menuOpen) return;
    if (event.key === 'Escape') { event.preventDefault(); setMenu(false, true); }
    if (event.key !== 'Tab') return;
    const items = [...header.querySelectorAll('a,button')].filter(node => node.getClientRects().length);
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  if (!document.body.classList.contains('home') || !nav) return;
  const links = [...nav.querySelectorAll('a')];
  const sections = [...document.querySelectorAll('main section[id]')];
  const hero = document.querySelector('main .hero');
  const home = links.find(link => { const url = new URL(link.href); return !url.hash && url.pathname === location.pathname; });
  const linkFor = id => links.find(link => {
    const url = new URL(link.href);
    return id === 'posts' ? url.pathname.replace(/\/+$/, '').endsWith('/blog') : url.hash === `#${id}`;
  });
  let frame = 0;
  const update = () => {
    frame = 0;
    const headerHeight = header?.getBoundingClientRect().height || 0;
    const visible = node => {
      const rect = node.getBoundingClientRect();
      return Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, headerHeight));
    };
    let current = null, largest = hero ? visible(hero) : 0;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    if (maxScroll > 8 && scrollY >= maxScroll - 24) current = sections[sections.length - 1];
    else for (const section of sections) {
      const height = visible(section);
      if (height > largest) { current = section; largest = height; }
    }
    const active = current ? linkFor(current.id) : home;
    for (const link of links) {
      const on = link === active;
      link.classList.toggle('is-active', on);
      if (on) link.setAttribute('aria-current', link === home ? 'page' : 'location');
      else link.removeAttribute('aria-current');
    }
  };
  const request = () => { if (!frame) frame = requestAnimationFrame(update); };
  update();
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request, { passive: true });
  window.addEventListener('hashchange', request);
  window.addEventListener('pageshow', request);
  window.addEventListener('load', request);
  document.fonts?.ready.then(request);
})();
