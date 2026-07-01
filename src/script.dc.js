class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.rootRef = React.createRef();
  }

  componentDidMount() {
    this.waitForGSAP(0);
    this._safety = setTimeout(() => this.healVisibility(), 3200);
  }

  componentWillUnmount() {
    clearTimeout(this._safety);
  }

  healVisibility() {
    const root = this.getRoot();
    if (!root) return;
    const ST = window.ScrollTrigger;
    const liveTriggers = ST ? new Set(ST.getAll().map(t => t.trigger).filter(Boolean)) : new Set();
    const show = el => { if (el) { el.style.opacity = '1'; el.style.transform = 'none'; } };
    const isHidden = el => parseFloat(getComputedStyle(el).opacity || '1') < 0.05;

    root.querySelectorAll('[data-hero-eyebrow],[data-hero-line],[data-hero-sub],[data-hero-cta],[data-hero-mock]').forEach(el => { if (isHidden(el)) show(el); });
    root.querySelectorAll('[data-bar]').forEach(b => { if (isHidden(b) || getComputedStyle(b).height === '0px') b.style.height = (b.dataset.h || '50') + '%'; });

    root.querySelectorAll('[data-reveal]').forEach(el => { if (isHidden(el) && !liveTriggers.has(el)) show(el); });
    root.querySelectorAll('[data-reveal-group]').forEach(g => { if (!liveTriggers.has(g)) Array.from(g.children).forEach(c => { if (isHidden(c)) show(c); }); });
    const mvc = root.querySelector('[data-mvc]');
    if (mvc && !liveTriggers.has(mvc)) mvc.querySelectorAll('[data-mvc-step]').forEach(s => { if (isHidden(s)) show(s); });
  }

  getRoot() {
    return this.rootRef.current || document.querySelector('.sc-host[data-sc-name="Quantory"]') || null;
  }

  contentReady() {
    const root = this.getRoot();
    return !!(root && root.querySelector('[data-modules-track]') && root.querySelector('[data-mvc]') && root.querySelector('#cta'));
  }

  waitForGSAP(tries) {
    if (window.gsap && window.ScrollTrigger && this.contentReady()) {
      this.setupGSAP();
    } else if (tries < 120) {
      setTimeout(() => this.waitForGSAP(tries + 1), 100);
    } else {
      this.revealFallback();
    }
  }

  revealFallback() {
    const root = this.getRoot();
    if (!root) return;
    root.querySelectorAll('[data-reveal],[data-hero-line],[data-hero-eyebrow],[data-hero-sub],[data-hero-cta],[data-hero-mock],[data-mvc-step]').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    root.querySelectorAll('[data-reveal-group]').forEach(g => Array.from(g.children).forEach(c => { c.style.opacity = '1'; c.style.transform = 'none'; }));
    root.querySelectorAll('[data-bar]').forEach(b => { b.style.height = (b.dataset.h || '50') + '%'; });
  }

  setupGSAP() {
    const root = this.getRoot();
    if (!root || root.__qInit) return;
    root.__qInit = true;

    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);
    const els = sel => Array.from(root.querySelectorAll(sel));

    const prog = root.querySelector('[data-progress]');
    if (prog) {
      gsap.to(prog, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 } });
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if (els('[data-hero-eyebrow]').length) tl.fromTo(els('[data-hero-eyebrow]'), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 });
    if (els('[data-hero-line]').length) tl.fromTo(els('[data-hero-line]'), { yPercent: 115, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.12 }, '-=0.2');
    if (els('[data-hero-sub]').length) tl.fromTo(els('[data-hero-sub]'), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, '-=0.45');
    if (els('[data-hero-cta]').length) tl.fromTo(els('[data-hero-cta]'), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.1 }, '-=0.45');
    if (els('[data-hero-mock]').length) tl.fromTo(els('[data-hero-mock]'), { y: 40, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 1.0 }, '-=0.7');

    els('[data-reveal]').forEach(el => {
      gsap.fromTo(el, { y: 44, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    els('[data-reveal-group]').forEach(group => {
      gsap.fromTo(group.children, { y: 46, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: group, start: 'top 84%', once: true } });
    });

    els('[data-parallax]').forEach(el => {
      const sp = parseFloat(el.dataset.speed || '0.2');
      gsap.to(el, { y: () => sp * window.innerHeight * 0.6, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    els('[data-count]').forEach(el => {
      const target = parseFloat(el.dataset.count);
      const pre = el.dataset.prefix || '';
      const suf = el.dataset.suffix || '';
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 1.7, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onUpdate: () => { el.textContent = pre + Math.round(obj.v).toLocaleString('es-ES') + suf; }
      });
    });

    els('[data-bar]').forEach(el => {
      const h = (el.dataset.h || '50') + '%';
      gsap.fromTo(el, { height: '0%' }, { height: h, duration: 1.1, ease: 'power3.out', delay: 0.5, scrollTrigger: { trigger: el, start: 'top 96%', once: true } });
    });

    const modSec = root.querySelector('[data-modules]');
    const track = root.querySelector('[data-modules-track]');
    if (modSec && track) {
      const getDist = () => Math.max(0, track.scrollWidth - modSec.clientWidth + 32);
      gsap.to(track, {
        x: () => -getDist(),
        ease: 'none',
        scrollTrigger: {
          trigger: modSec, start: 'top top', end: () => '+=' + getDist(),
          scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true
        }
      });
    }

    const mvc = root.querySelector('[data-mvc]');
    if (mvc) {
      const steps = mvc.querySelectorAll('[data-mvc-step]');
      const mtl = gsap.timeline({
        scrollTrigger: { trigger: mvc, start: 'top top', end: '+=2000', scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true }
      });
      steps.forEach((s) => {
        mtl.fromTo(s, { y: 46, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power2.out' }, '>-0.25');
      });
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ST.refresh()).catch(() => {});
    }
    setTimeout(() => ST.refresh(), 700);
    window.addEventListener('load', () => ST.refresh());
  }

  renderVals() {
    return { rootRef: this.rootRef };
  }
}
