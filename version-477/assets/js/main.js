(function () {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const thumbs = Array.from(hero.querySelectorAll('[data-hero-thumb]'));
    let current = 0;
    let timer = null;

    function show(index) {
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
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('active', i === current);
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
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        show(Number(thumb.getAttribute('data-hero-thumb')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-local-filter]').forEach(function (input) {
    const scope = document.querySelector('[data-filter-scope]');
    if (!scope) {
      return;
    }
    const cards = Array.from(scope.querySelectorAll('[data-search]'));
    input.addEventListener('input', function () {
      const value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        const haystack = (card.getAttribute('data-search') || '').toLowerCase();
        card.hidden = value.length > 0 && haystack.indexOf(value) === -1;
      });
    });
  });

  function movieCard(movie) {
    return [
      '<a class="movie-card" href="' + movie.url + '" data-search="' + escapeHtml(movie.title + ' ' + movie.region + ' ' + movie.genre) + '">',
      '  <div class="movie-card-poster">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="type-badge">' + escapeHtml(movie.type) + '</span>',
      '    <span class="score-badge">' + escapeHtml(movie.rating) + '</span>',
      '  </div>',
      '  <div class="movie-card-body">',
      '    <div class="movie-card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
      '    <h3>' + escapeHtml(movie.title) + '</h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '  </div>',
      '</a>'
    ].join('');
  }

  function searchItem(movie) {
    return [
      '<a class="search-result-item" href="' + movie.url + '">',
      '  <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '  <div><strong>' + escapeHtml(movie.title) + '</strong><span>' + escapeHtml(movie.region + ' · ' + movie.year + ' · ' + movie.genre) + '</span></div>',
      '  <em>' + escapeHtml(movie.rating) + '</em>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getMovies() {
    return window.SITE_MOVIES || [];
  }

  function runSearch(query, limit) {
    const value = String(query || '').trim().toLowerCase();
    if (!value) {
      return [];
    }
    return getMovies().filter(function (movie) {
      const haystack = [
        movie.title,
        movie.region,
        movie.year,
        movie.type,
        movie.genre,
        movie.category,
        movie.tags,
        movie.oneLine
      ].join(' ').toLowerCase();
      return haystack.indexOf(value) !== -1;
    }).slice(0, limit);
  }

  document.querySelectorAll('[data-quick-search]').forEach(function (form) {
    const input = form.querySelector('[data-search-input]');
    const results = document.querySelector('[data-search-results]');
    if (!input || !results) {
      return;
    }

    input.addEventListener('input', function () {
      const found = runSearch(input.value, 8);
      if (!found.length) {
        results.innerHTML = '';
        return;
      }
      results.innerHTML = '<div class="search-result-list">' + found.map(searchItem).join('') + '</div>';
    });
  });

  document.querySelectorAll('[data-search-page-form]').forEach(function (form) {
    const input = form.querySelector('[data-search-input]');
    const results = document.querySelector('[data-search-results]');
    if (!input || !results) {
      return;
    }

    function render() {
      const found = runSearch(input.value, 80);
      results.innerHTML = found.map(movieCard).join('');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });

    input.addEventListener('input', render);

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      input.value = q;
      render();
    }
  });

  let hlsPromise = null;

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsPromise) {
      return hlsPromise;
    }
    hlsPromise = new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsPromise;
  }

  function prepareVideo(video) {
    const stream = video.getAttribute('data-stream');
    if (!stream) {
      return Promise.reject(new Error('empty stream'));
    }
    if (video.getAttribute('data-ready') === '1') {
      return Promise.resolve();
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.setAttribute('data-ready', '1');
      return Promise.resolve();
    }
    return loadHlsLibrary().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video._hls = hls;
        video.setAttribute('data-ready', '1');
        return;
      }
      video.src = stream;
      video.setAttribute('data-ready', '1');
    });
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    const video = player.querySelector('.player-video');
    const start = player.querySelector('[data-player-start]');
    if (!video || !start) {
      return;
    }

    function play() {
      prepareVideo(video).then(function () {
        video.controls = true;
        start.classList.add('hidden');
        const attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {
            start.classList.remove('hidden');
          });
        }
      }).catch(function () {
        start.classList.remove('hidden');
      });
    }

    start.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
  });
})();
