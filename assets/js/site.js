(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('is-open');
      menu.classList.toggle('is-open');
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function getCards(target) {
    var scope = document.querySelector(target);
    if (!scope) {
      return [];
    }
    return Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
  }

  function applySearch(input) {
    var target = input.getAttribute('data-search-target');
    var cards = getCards(target);
    var query = input.value.trim().toLowerCase();
    cards.forEach(function (card) {
      var text = card.getAttribute('data-search') || '';
      var matchesSearch = !query || text.indexOf(query) !== -1;
      var matchesFilter = card.getAttribute('data-filter-hidden') !== 'true';
      card.hidden = !(matchesSearch && matchesFilter);
    });
    updateEmptyState(target);
  }

  function updateEmptyState(target) {
    var scope = document.querySelector(target);
    var empty = document.querySelector('[data-empty-result]');
    if (!scope || !empty) {
      return;
    }
    var visible = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]')).some(function (card) {
      return !card.hidden;
    });
    empty.hidden = visible;
  }

  function setupSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-target]'));
    inputs.forEach(function (input) {
      input.addEventListener('input', function () {
        applySearch(input);
      });
    });
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scopeNode) {
      var target = scopeNode.getAttribute('data-filter-scope');
      var buttons = Array.prototype.slice.call(scopeNode.querySelectorAll('[data-filter-value]'));
      var search = scopeNode.querySelector('[data-search-target]');
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          buttons.forEach(function (item) {
            item.classList.remove('is-active');
          });
          button.classList.add('is-active');
          var value = button.getAttribute('data-filter-value');
          getCards(target).forEach(function (card) {
            var type = card.getAttribute('data-type') || '';
            var hiddenByFilter = value !== 'all' && type !== value;
            card.setAttribute('data-filter-hidden', hiddenByFilter ? 'true' : 'false');
          });
          if (search) {
            applySearch(search);
          } else {
            getCards(target).forEach(function (card) {
              card.hidden = card.getAttribute('data-filter-hidden') === 'true';
            });
            updateEmptyState(target);
          }
        });
      });
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      if (!video || !button) {
        return;
      }
      var source = video.getAttribute('data-src');
      var initialized = false;
      var hlsInstance = null;

      function initialize() {
        if (initialized || !source) {
          return;
        }
        initialized = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function playVideo() {
        initialize();
        player.classList.add('is-playing');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }

      button.addEventListener('click', playVideo);
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          player.classList.remove('is-playing');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHeroSlider();
    setupSearch();
    setupFilters();
    setupPlayers();
  });
})();
