(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  function startHero() {
    if (timer) {
      window.clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  if (slides.length) {
    showSlide(0);
    startHero();

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startHero();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        startHero();
      });
    });
  }

  var searchInput = document.querySelector('[data-search-input]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var regionFilter = document.querySelector('[data-region-filter]');
  var resetFilter = document.querySelector('[data-reset-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var query = normalize(searchInput ? searchInput.value : '');
    var year = yearFilter && yearFilter.value ? parseInt(yearFilter.value, 10) : 0;
    var region = normalize(regionFilter ? regionFilter.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year')
      ].join(' '));
      var cardYear = parseInt(card.getAttribute('data-year') || '0', 10);
      var cardRegion = normalize(card.getAttribute('data-region'));
      var okQuery = !query || haystack.indexOf(query) !== -1;
      var okYear = !year || cardYear >= year;
      var okRegion = !region || cardRegion.indexOf(region) !== -1;
      var show = okQuery && okYear && okRegion;

      card.style.display = show ? '' : 'none';

      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('show', visible === 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', applyFilters);
  }

  if (regionFilter) {
    regionFilter.addEventListener('change', applyFilters);
  }

  if (resetFilter) {
    resetFilter.addEventListener('click', function () {
      if (searchInput) {
        searchInput.value = '';
      }

      if (yearFilter) {
        yearFilter.value = '';
      }

      if (regionFilter) {
        regionFilter.value = '';
      }

      applyFilters();
    });
  }
})();
