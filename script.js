(function () {
  'use strict';

  var $ = function (selector, scope) {
    return (scope || document).querySelector(selector);
  };

  var $$ = function (selector, scope) {
    return Array.prototype.slice.call(
      (scope || document).querySelectorAll(selector)
    );
  };

  var root = document.documentElement;
  var themeButton = $('#theme');
  var menu = $('#menu');
  var burger = $('#burger');


  // THEME SWITCHING

  try {
    var savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark' || savedTheme === 'light') {
      root.setAttribute('data-theme', savedTheme);
    }
  } catch (error) {
    // Continue if local storage is unavailable.
  }

  function updateThemeButton() {

    var isDark =
      root.getAttribute('data-theme') === 'dark' ||
      (!root.hasAttribute('data-theme') &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

    themeButton.setAttribute(
      'aria-label',
      isDark ? 'Switch to light theme' : 'Switch to dark theme'
    );
  }

  updateThemeButton();

  themeButton.addEventListener('click', function () {

    var isDark =
      root.getAttribute('data-theme') === 'dark' ||
      (!root.hasAttribute('data-theme') &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

    var nextTheme = isDark ? 'light' : 'dark';

    root.setAttribute('data-theme', nextTheme);

    try {
      localStorage.setItem('theme', nextTheme);
    } catch (error) {}

    updateThemeButton();

  });


  // MOBILE NAVIGATION

  function closeMenu() {

    menu.classList.remove('open');

    burger.setAttribute('aria-expanded', 'false');

    burger.setAttribute(
      'aria-label',
      'Open navigation menu'
    );
  }

  burger.addEventListener('click', function () {

    var isOpen = menu.classList.toggle('open');

    burger.setAttribute(
      'aria-expanded',
      String(isOpen)
    );

    burger.setAttribute(
      'aria-label',
      isOpen
        ? 'Close navigation menu'
        : 'Open navigation menu'
    );

  });

  $$('#menu a').forEach(function (link) {

    link.addEventListener('click', closeMenu);

  });

  document.addEventListener('keydown', function (event) {

    if (event.key === 'Escape') {
      closeMenu();
    }

  });


  // TYPING ANIMATION

  var typed = $('#typed');

  var words = [
    'responsive websites.',
    'clean user interfaces.',
    'accessible web apps.'
  ];

  var wordIndex = 0;
  var charIndex = 0;
  var deleting = false;

  var reduceMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function typeText() {

    var word = words[wordIndex];

    charIndex += deleting ? -1 : 1;

    typed.textContent = word.slice(0, charIndex);

    var delay = deleting ? 35 : 75;

    if (!deleting && charIndex === word.length) {

      deleting = true;
      delay = 1500;

    } else if (deleting && charIndex === 0) {

      deleting = false;

      wordIndex = (wordIndex + 1) % words.length;

      delay = 350;

    }

    window.setTimeout(typeText, delay);

  }

  if (!reduceMotion) {

    typeText();

  } else {

    typed.textContent = words[0];

  }


  // COUNTER ANIMATION

  function animateCounter(element) {

    if (element.dataset.counted === 'true') {
      return;
    }

    element.dataset.counted = 'true';

    var target = Number(element.dataset.count);

    var startTime = null;

    var duration = 850;

    function step(timestamp) {

      if (!startTime) {
        startTime = timestamp;
      }

      var progress = Math.min(
        (timestamp - startTime) / duration,
        1
      );

      element.textContent = String(
        Math.floor(progress * target)
      );

      if (progress < 1) {

        window.requestAnimationFrame(step);

      } else {

        element.textContent = String(target);

      }

    }

    window.requestAnimationFrame(step);

  }


  // SCROLL REVEAL AND SKILL BARS

  if ('IntersectionObserver' in window) {

    var revealObserver = new IntersectionObserver(
      function (entries, observer) {

        entries.forEach(function (entry) {

          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('in');

          $$('.bar i', entry.target).forEach(function (bar) {

            bar.style.width = bar.dataset.w + '%';

          });

          $$('[data-count]', entry.target).forEach(
            animateCounter
          );

          observer.unobserve(entry.target);

        });

      },
      {
        threshold: 0.12
      }
    );

    $$('.reveal').forEach(function (section) {

      revealObserver.observe(section);

    });


    // ACTIVE NAVIGATION LINK

    var navLinks = $$('#menu a:not(.cta)');

    var observedSections = navLinks
      .map(function (link) {

        return $(link.getAttribute('href'));

      })
      .filter(Boolean);

    var sectionObserver = new IntersectionObserver(
      function (entries) {

        entries.forEach(function (entry) {

          if (!entry.isIntersecting) {
            return;
          }

          navLinks.forEach(function (link) {

            link.classList.toggle(
              'active',
              link.getAttribute('href') === '#' + entry.target.id
            );

          });

        });

      },
      {
        rootMargin: '-35% 0px -55% 0px'
      }
    );

    observedSections.forEach(function (section) {

      sectionObserver.observe(section);

    });

  } else {

    // Fallback for browsers without IntersectionObserver.

    $$('.reveal').forEach(function (section) {

      section.classList.add('in');

    });

    $$('.bar i').forEach(function (bar) {

      bar.style.width = bar.dataset.w + '%';

    });

    $$('[data-count]').forEach(function (element) {

      element.textContent = element.dataset.count;

    });

  }


  // BACK TO TOP BUTTON

  var topButton = $('#top');

  function updateTopButton() {

    topButton.classList.toggle(
      'show',
      window.scrollY > 450
    );

  }

  window.addEventListener(
    'scroll',
    updateTopButton,
    { passive: true }
  );

  updateTopButton();

  topButton.addEventListener('click', function () {

    window.scrollTo({

      top: 0,

      behavior: reduceMotion ? 'auto' : 'smooth'

    });

  });


  // CONTACT FORM VALIDATION

  var form = $('#form');

  var successMessage = $('#ok');

  var rules = {

    name: function (value) {

      return value.trim().length < 2
        ? 'Please enter at least 2 characters.'
        : '';

    },

    email: function (value) {

      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
        ? ''
        : 'Please enter a valid email address.';

    },

    msg: function (value) {

      return value.trim().length < 10
        ? 'Please enter a message of at least 10 characters.'
        : '';

    }

  };


  // VALIDATE EACH FIELD

  function validateField(id) {

    var field = $('#' + id);

    var errorElement = $('#e-' + id);

    var message = rules[id](field.value);

    errorElement.textContent = message;

    field.classList.toggle(
      'invalid',
      Boolean(message)
    );

    field.setAttribute(
      'aria-invalid',
      message ? 'true' : 'false'
    );

    return !message;

  }


  Object.keys(rules).forEach(function (id) {

    var field = $('#' + id);

    field.addEventListener('blur', function () {

      validateField(id);

    });

    field.addEventListener('input', function () {

      if (field.classList.contains('invalid')) {

        validateField(id);

      }

      successMessage.hidden = true;

    });

  });


  // OPEN EMAIL APPLICATION ON SUBMISSION

  form.addEventListener('submit', function (event) {

    event.preventDefault();

    successMessage.hidden = true;

    var valid = Object.keys(rules)
      .map(validateField)
      .every(Boolean);

    if (!valid) {

      var firstInvalid = $('.invalid', form);

      if (firstInvalid) {
        firstInvalid.focus();
      }

      return;

    }

    var name = $('#name').value.trim();

    var email = $('#email').value.trim();

    var message = $('#msg').value.trim();

    var subject = encodeURIComponent(
      'Portfolio enquiry from ' + name
    );

    var body = encodeURIComponent(
      'Name: ' + name +
      '\nEmail: ' + email +
      '\n\nMessage:\n' + message
    );

    successMessage.hidden = false;

    window.location.href =
      'mailto:carolyncandin@gmail.com?subject=' +
      subject +
      '&body=' +
      body;

  });


  // AUTOMATIC COPYRIGHT YEAR

  $('#year').textContent = new Date().getFullYear();

})();