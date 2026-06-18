(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeText(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) return;
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero-carousel]');
    if (!root) return;
    var slides = selectAll('[data-hero-slide]', root);
    var dots = selectAll('[data-hero-dot]', root);
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    if (!slides.length) return;
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    if (prev) prev.addEventListener('click', function () { show(index - 1); start(); });
    if (next) next.addEventListener('click', function () { show(index + 1); start(); });
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function setupSearch() {
    if (!window.MOVIES_INDEX) return;
    selectAll('[data-search-root]').forEach(function (root) {
      var input = root.querySelector('[data-site-search]');
      var panel = root.querySelector('[data-search-panel]');
      if (!input || !panel) return;

      function render() {
        var q = input.value.trim().toLowerCase();
        if (!q) {
          panel.classList.remove('open');
          panel.innerHTML = '';
          return;
        }
        var results = window.MOVIES_INDEX.filter(function (movie) {
          return [movie.title, movie.year, movie.region, movie.genre, movie.tags].join(' ').toLowerCase().indexOf(q) !== -1;
        }).slice(0, 8);
        if (!results.length) {
          panel.innerHTML = '<span class="search-empty">没有匹配影片</span>';
          panel.classList.add('open');
          return;
        }
        panel.innerHTML = results.map(function (movie) {
          return '<a href="' + movie.url + '"><strong>' + escapeText(movie.title) + '</strong><small>' + escapeText(movie.year + ' · ' + movie.region + ' · ' + movie.genre) + '</small></a>';
        }).join('');
        panel.classList.add('open');
      }

      input.addEventListener('input', render);
      input.addEventListener('focus', render);
      document.addEventListener('click', function (event) {
        if (!root.contains(event.target)) panel.classList.remove('open');
      });
    });
  }

  function setupLocalFilter() {
    var root = document.querySelector('[data-filter-page]');
    if (!root) return;
    var search = root.querySelector('[data-local-search]');
    var year = root.querySelector('[data-year-filter]');
    var region = root.querySelector('[data-region-filter]');
    var cards = selectAll('.movie-card', root);

    function run() {
      var q = search ? search.value.trim().toLowerCase() : '';
      var y = year ? year.value : '';
      var r = region ? region.value : '';
      cards.forEach(function (card) {
        var text = [card.getAttribute('data-title'), card.getAttribute('data-genre'), card.getAttribute('data-region'), card.getAttribute('data-tags')].join(' ').toLowerCase();
        var ok = true;
        if (q && text.indexOf(q) === -1) ok = false;
        if (y && card.getAttribute('data-year') !== y) ok = false;
        if (r && card.getAttribute('data-region') !== r) ok = false;
        card.style.display = ok ? '' : 'none';
      });
    }

    [search, year, region].forEach(function (control) {
      if (control) control.addEventListener('input', run);
      if (control) control.addEventListener('change', run);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupLocalFilter();
  });
})();
