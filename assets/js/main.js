(() => {
  'use strict';

  const header = document.querySelector('.header');
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = [...document.querySelectorAll('.nav__link')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setHeaderState = () => {
    header?.classList.toggle('is-sticky', window.scrollY > 42);
  };

  const closeMenu = () => {
    nav?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle?.setAttribute('aria-label', 'Abrir menu');
    document.body.classList.remove('menu-open');
  };

  navToggle?.addEventListener('click', () => {
    const isOpen = nav?.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(Boolean(isOpen)));
    navToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('menu-open', Boolean(isOpen));
  });

  navLinks.forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) closeMenu();
  });
  window.addEventListener('scroll', setHeaderState, { passive: true });
  setHeaderState();

  const sections = [...document.querySelectorAll('main section[id], header[id]')];
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: '-30% 0px -60%', threshold: 0 });
    sections.forEach((section) => sectionObserver.observe(section));
  }

  const initAnimations = () => {
    const revealItems = document.querySelectorAll('.reveal');
    const revealLeftItems = document.querySelectorAll('.reveal-left');
    const revealRightItems = document.querySelectorAll('.reveal-right');

    if (reduceMotion || typeof window.gsap === 'undefined' || typeof window.ScrollMagic === 'undefined') {
      [...revealItems, ...revealLeftItems, ...revealRightItems].forEach((item) => {
        item.style.opacity = '1';
        item.style.transform = 'none';
      });
      return;
    }

    const controller = new ScrollMagic.Controller();

    const connectScene = (element, fromVars) => {
      gsap.set(element, fromVars);
      new ScrollMagic.Scene({ triggerElement: element, triggerHook: 0.88, reverse: false })
        .setTween(gsap.to(element, { opacity: 1, x: 0, y: 0, duration: .8, ease: 'power3.out' }))
        .addTo(controller);
    };

    revealItems.forEach((item) => connectScene(item, { opacity: 0, y: 34 }));
    revealLeftItems.forEach((item) => connectScene(item, { opacity: 0, x: -45 }));
    revealRightItems.forEach((item) => connectScene(item, { opacity: 0, x: 45 }));

    gsap.from('.hero .eyebrow', { opacity: 0, y: 18, duration: .65, delay: .18, ease: 'power2.out' });
    gsap.from('.hero h1', { opacity: 0, y: 38, duration: .9, delay: .28, ease: 'power3.out' });
    gsap.from('.hero__lead', { opacity: 0, y: 24, duration: .75, delay: .48, ease: 'power3.out' });
    gsap.from('.hero__actions > *', { opacity: 0, y: 18, duration: .65, delay: .64, stagger: .1, ease: 'power3.out' });
    gsap.from('.hero__trust li', { opacity: 0, y: 15, duration: .6, delay: .8, stagger: .1, ease: 'power2.out' });
    gsap.to('.hero__shapes i', { y: -14, rotation: '+=16', duration: 2.4, stagger: .22, repeat: -1, yoyo: true, ease: 'sine.inOut' });

    if (window.innerWidth > 860) {
      new ScrollMagic.Scene({ triggerElement: '.hero', triggerHook: 0, duration: '100%' })
        .setTween(gsap.fromTo('.hero__media', { yPercent: 0 }, { yPercent: 10, ease: 'none' }))
        .addTo(controller);
    }
  };

  window.addEventListener('load', initAnimations, { once: true });

  const lightbox = document.querySelector('#lightbox');
  const lightboxImage = lightbox?.querySelector('img');
  const lightboxClose = lightbox?.querySelector('button');

  document.querySelectorAll('.gallery__item').forEach((item) => {
    item.addEventListener('click', () => {
      if (!lightbox || !lightboxImage) return;
      lightboxImage.src = item.dataset.image || '';
      lightboxImage.alt = item.dataset.alt || '';
      lightbox.showModal();
      document.body.classList.add('lightbox-open');
    });
  });

  const closeLightbox = () => {
    lightbox?.close();
    document.body.classList.remove('lightbox-open');
  };

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  lightbox?.addEventListener('close', () => document.body.classList.remove('lightbox-open'));

  document.querySelectorAll('.accordion details').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      document.querySelectorAll('.accordion details[open]').forEach((openDetail) => {
        if (openDetail !== detail) openDetail.removeAttribute('open');
      });
    });
  });

  const phoneInput = document.querySelector('input[name="telefone"]');
  phoneInput?.addEventListener('input', (event) => {
    const numbers = event.target.value.replace(/\D/g, '').slice(0, 11);
    let formatted = numbers;
    if (numbers.length > 2) formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length > 7) formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    event.target.value = formatted;
  });

  const dateInput = document.querySelector('input[name="data"]');
  if (dateInput) {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    dateInput.min = new Date(today.getTime() - offset * 60000).toISOString().split('T')[0];
  }

  const toast = document.querySelector('#toast');
  let toastTimer;
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3500);
  };

  const form = document.querySelector('#quote-form');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const rawDate = String(data.get('data') || '');
    const [year, month, day] = rawDate.split('-');
    const formattedDate = rawDate ? `${day}/${month}/${year}` : 'A definir';
    const optionalMessage = String(data.get('mensagem') || '').trim();

    const lines = [
      'Olá! Vim pelo site da PlayFest Tatuí e gostaria de solicitar um orçamento. 🎉',
      '',
      `*Nome:* ${data.get('nome')}`,
      `*Meu WhatsApp:* ${data.get('telefone')}`,
      `*Tipo de evento:* ${data.get('evento')}`,
      `*Data desejada:* ${formattedDate}`,
      `*Convidados:* ${data.get('convidados')}`,
      `*Período:* ${data.get('periodo')}`
    ];

    if (optionalMessage) lines.push(`*Detalhes:* ${optionalMessage}`);
    lines.push('', 'Podem me passar mais informações?');

    const whatsappUrl = `https://wa.me/5515981677723?text=${encodeURIComponent(lines.join('\n'))}`;
    showToast('Tudo certo! Abrindo sua conversa no WhatsApp.');
    window.setTimeout(() => window.open(whatsappUrl, '_blank', 'noopener,noreferrer'), 250);
  });

  const currentYear = document.querySelector('#current-year');
  if (currentYear) currentYear.textContent = new Date().getFullYear();
})();
