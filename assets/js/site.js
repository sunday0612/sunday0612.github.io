/* 渐进增强：首页导航随阅读位置变化，内容与链接不依赖脚本。 */
(() => {
  if (!document.body.classList.contains('home') || !('IntersectionObserver' in window)) return;
  const links = [...document.querySelectorAll('.nav a')];
  const sections = [...document.querySelectorAll('main section[id]')];
  const visible = new Set();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    const active = sections.find(section => visible.has(section));
    const hash = active?.id === 'posts' ? '/blog/' : active ? `#${active.id}` : null;
    for (const link of links) {
      const url = new URL(link.href);
      const matches = Boolean(hash && (hash.startsWith('#') ? url.hash === hash : url.pathname.endsWith(hash)));
      link.classList.toggle('is-active', matches);
      if (matches) link.setAttribute('aria-current', 'location');
      else if (link.getAttribute('aria-current') === 'location') link.removeAttribute('aria-current');
    }
  }, { rootMargin: '-20% 0px -45% 0px' });
  sections.forEach(section => observer.observe(section));
})();
