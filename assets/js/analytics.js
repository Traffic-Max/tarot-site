(function () {
  'use strict';

  function track(eventName, params) {
    if (typeof window.gtag !== 'function') {
      return;
    }
    window.gtag('event', eventName, params || {});
  }

  function normalizeHref(href) {
    return (href || '').trim().toLowerCase();
  }

  function getLinkText(el) {
    return (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  }

  function isServiceTransition(href) {
    var serviceSlugs = [
      'otlivka-voskom',
      'chistka-negativa',
      'tarot-online',
      'runicheskaya-zashita',
      'snjatie-porchi',
      'snjatie-sglaza',
      'diagnostika-energetiki',
      'zashita-biznesa'
    ];

    for (var i = 0; i < serviceSlugs.length; i++) {
      var slug = serviceSlugs[i];
      if (
        href.indexOf('/' + slug + '/') !== -1 ||
        href.indexOf(slug + '/index.html') !== -1 ||
        href === slug + '/index.html' ||
        href === '../' + slug + '/index.html' ||
        href === '../../' + slug + '/index.html'
      ) {
        return slug;
      }
    }

    return '';
  }

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!form || form.tagName !== 'FORM') {
      return;
    }

    track('form_submit', {
      form_id: form.id || '',
      form_action: form.getAttribute('action') || '',
      form_method: (form.getAttribute('method') || 'get').toLowerCase(),
      page_path: window.location.pathname
    });
  });

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a');
    if (!link) {
      return;
    }

    var hrefRaw = link.getAttribute('href') || '';
    var href = normalizeHref(hrefRaw);
    if (!href) {
      return;
    }

    var payload = {
      link_url: hrefRaw,
      link_text: getLinkText(link),
      page_path: window.location.pathname
    };

    if (
      href.indexOf('t.me') !== -1 ||
      href.indexOf('telegram.me') !== -1 ||
      link.getAttribute('data-track') === 'telegram'
    ) {
      track('telegram_click', payload);
      return;
    }

    if (
      href.indexOf('wa.me') !== -1 ||
      href.indexOf('whatsapp.com') !== -1 ||
      link.getAttribute('data-track') === 'whatsapp'
    ) {
      track('whatsapp_click', payload);
      return;
    }

    if (
      href.indexOf('.pdf') !== -1 ||
      link.getAttribute('data-track') === 'pdf-download'
    ) {
      track('pdf_download', payload);
      return;
    }

    var serviceSlug = isServiceTransition(href);
    if (serviceSlug) {
      payload.service_slug = serviceSlug;
      track('service_navigation', payload);
    }
  });

  document.addEventListener('click', function (event) {
    var button = event.target.closest('button, input[type="submit"], input[type="button"]');
    if (!button) {
      return;
    }

    var text = ((button.textContent || button.value || '') + '').toLowerCase();
    var explicitTrack = button.getAttribute('data-track');
    if (text.indexOf('pdf') === -1 && explicitTrack !== 'pdf-download') {
      return;
    }

    track('pdf_download', {
      trigger: 'button',
      button_text: (button.textContent || button.value || '').trim().slice(0, 120),
      page_path: window.location.pathname
    });
  });
})();
