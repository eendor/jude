/* Entrance animations for the sections below the hero (the hero's are pure CSS).
   Each item animates once, when its section scrolls into view: on wide screens a whole
   section plays as one sequence, on phones each item plays when it appears.
   Nothing here runs if the visitor prefers reduced motion. */
(() => {
  if (!matchMedia('(prefers-reduced-motion: no-preference)').matches || !('IntersectionObserver' in window)) return;

  // [items, animation, delay in ms after the section appears, ms between letters]
  // An array gives one value per matching item, in page order.
  const PLAN = [
    ['.about .heading', 'words', 300],
    ['.about-text', 'type', 450, 4.1],
    ['.about .button', 'tumble', 750, 98],

    ['.tools .heading', 'words', 110],
    ['.tool-name', 'type', [440, 240, 640, 840], 120],

    ['.designs .heading', 'words', 115],
    ['.squares:first-child > img', 'brush', [250, 600]],
    ['.squares + .squares > img', ['pan', 'pan-r', 'pan-u'], [50, 240, 440]],
    ['.emails > img', 'pan-d', [50, 240, 440, 640]],

    ['.videos .heading', 'words', 190],
    ['.shorts > video', ['slide-l', 'slide-r'], [340, 520]],
    ['.film > video', 'slide-u', 100],

    ['.thumbs .heading', 'words', 130],
    ['.thumbs figure > img', ['thumb-l', 'thumb-r'], 60],
    ['.thumbs .caption', ['words-up', 'words'], [920, 520]],

    ['.mini-band', 'wipe', 40],
    ['.name-heading', 'drop', 120, 53],
    ['.pill', 'drop', 210, 41],
    ['.connect', 'pan', 375],
    ['.details .line:not(:last-child)', 'pan', [540, 625]],
    ['.details .line:last-child', 'drop', 1040, 70],
    ['.socials li', 'pop', [710, 790, 875, 960]],
    ['.polaroid .clip', 'fly', 290],
    ['.polaroid picture', 'fly', 460],
  ];

  const wide = matchMedia('(min-width: 761px)').matches;
  const pick = (v, i) => (Array.isArray(v) ? v[i] : v);
  const span = (cls, text) => {
    const s = document.createElement('span');
    if (cls) s.className = cls;
    if (text != null) s.textContent = text;
    return s;
  };

  // Wrap each word (or letter) in a span. Screen readers get the plain text instead.
  function split(el, letters) {
    let i = 0;
    const nodes = [];
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (walk.nextNode()) if (walk.currentNode.data.trim()) nodes.push(walk.currentNode);
    for (const node of nodes) {
      const shown = span();
      shown.setAttribute('aria-hidden', 'true');
      for (const part of node.data.split(/(\s+)/)) {
        if (!part) continue;
        if (!part.trim()) { shown.append(part); continue; }
        const w = span('w');
        if (letters) {
          for (const ch of part) {
            const c = span('c', ch);
            c.style.setProperty('--i', i++);
            w.append(c);
          }
        } else {
          w.textContent = part;
          w.style.setProperty('--i', i++);
        }
        shown.append(w);
      }
      node.replaceWith(span('sr', node.data), shown);
    }
  }

  for (const [sel, how, delay, step] of PLAN) {
    document.querySelectorAll(sel).forEach((el, i) => {
      const type = pick(how, i);
      if (type.startsWith('words')) split(el, false);
      else if (type === 'type' || type === 'drop' || type === 'tumble') split(el, true);
      el.dataset.a = type;
      el.style.setProperty('--d', (wide ? pick(delay, i) : 60) + 'ms');
      if (step) el.style.setProperty('--step', step + 'ms');
    });
  }

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      const items = e.target.matches('[data-a]') ? [e.target] : e.target.querySelectorAll('[data-a]');
      items.forEach((el) => el.classList.add('on'));
    }
  }, { rootMargin: '0px 0px -18% 0px' });

  document.querySelectorAll(wide ? '.stage' : '[data-a]').forEach((el) => io.observe(el));
})();
