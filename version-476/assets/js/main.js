(function () {
  const root = document.documentElement.dataset.siteRoot || "";
  const searchIndex = Array.isArray(window.SEARCH_INDEX) ? window.SEARCH_INDEX : [];

  function bySelector(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function joinRoot(path) {
    return root + path;
  }

  function openSearchPage(query) {
    const target = joinRoot("search.html") + "?q=" + encodeURIComponent(query || "");
    window.location.href = target;
  }

  function searchMovies(query, limit) {
    const q = normalize(query);
    if (!q) {
      return [];
    }
    return searchIndex
      .filter(function (item) {
        const haystack = normalize([
          item.title,
          item.year,
          item.region,
          item.genre,
          item.tags
        ].join(" "));
        return haystack.indexOf(q) !== -1;
      })
      .slice(0, limit || 12);
  }

  function renderQuickResults(panel, results) {
    if (!panel) {
      return;
    }
    if (!results.length) {
      panel.classList.remove("is-open");
      panel.innerHTML = "";
      return;
    }
    panel.innerHTML = results.map(function (item) {
      return [
        '<a class="search-result-item" href="' + joinRoot(item.url) + '">',
        '<img src="' + joinRoot(item.cover) + '" alt="' + escapeHtml(item.title) + '">',
        '<span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</span></span>',
        '</a>'
      ].join("");
    }).join("");
    panel.classList.add("is-open");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupHeaderSearch() {
    bySelector("[data-search-form]").forEach(function (form) {
      const input = form.querySelector("[data-search-input]");
      const panel = form.querySelector("[data-search-results]");
      if (!input) {
        return;
      }
      input.addEventListener("input", function () {
        renderQuickResults(panel, searchMovies(input.value, 8));
      });
      input.addEventListener("focus", function () {
        renderQuickResults(panel, searchMovies(input.value, 8));
      });
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const query = input.value.trim();
        if (query) {
          openSearchPage(query);
        }
      });
      document.addEventListener("click", function (event) {
        if (!form.contains(event.target) && panel) {
          panel.classList.remove("is-open");
        }
      });
    });
  }

  function setupMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    const slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    const slides = bySelector("[data-hero-slide]", slider);
    const dots = bySelector("[data-hero-dot]", slider);
    let index = 0;

    function activate(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        activate(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        activate(index + 1);
      }, 5600);
    }
  }

  function setupLocalFilters() {
    bySelector("[data-local-filter]").forEach(function (filter) {
      const section = filter.closest("section");
      const input = filter.querySelector("[data-local-search]");
      const year = filter.querySelector("[data-year-filter]");
      const cards = bySelector("[data-local-grid] .movie-card", section);

      function applyFilter() {
        const q = normalize(input ? input.value : "");
        const selectedYear = year ? year.value : "";
        cards.forEach(function (card) {
          const haystack = normalize([
            card.dataset.title,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.region
          ].join(" "));
          const matchText = !q || haystack.indexOf(q) !== -1;
          const matchYear = !selectedYear || card.dataset.year === selectedYear;
          card.style.display = matchText && matchYear ? "" : "none";
        });
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }
      if (year) {
        year.addEventListener("change", applyFilter);
      }
    });
  }

  function setupSearchPage() {
    const form = document.querySelector("[data-search-page-form]");
    const input = document.querySelector("[data-search-page-input]");
    const results = document.querySelector("[data-search-page-results]");
    if (!form || !input || !results) {
      return;
    }

    function render() {
      const matches = searchMovies(input.value, 120);
      if (!input.value.trim()) {
        results.innerHTML = '<p class="search-empty">请输入关键词开始搜索。</p>';
        return;
      }
      if (!matches.length) {
        results.innerHTML = '<p class="search-empty">未找到匹配影片，请尝试使用片名、地区、类型或年份搜索。</p>';
        return;
      }
      results.innerHTML = matches.map(function (item) {
        return [
          '<article class="movie-card">',
          '<a class="poster-shell" href="' + joinRoot(item.url) + '">',
          '<img src="' + joinRoot(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '<span class="poster-badge">' + escapeHtml(item.year) + '</span>',
          '</a>',
          '<div class="movie-card-body">',
          '<a class="movie-title" href="' + joinRoot(item.url) + '">' + escapeHtml(item.title) + '</a>',
          '<p>' + escapeHtml(item.genre) + '</p>',
          '<div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span></div>',
          '</div>',
          '</article>'
        ].join("");
      }).join("");
    }

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";
    input.value = initialQuery;
    render();

    input.addEventListener("input", render);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
      const query = input.value.trim();
      const url = query ? ("?q=" + encodeURIComponent(query)) : window.location.pathname;
      window.history.replaceState(null, "", url);
    });
  }

  function setupPlayers() {
    bySelector("[data-player]").forEach(function (player) {
      const video = player.querySelector("video");
      const button = player.querySelector("[data-play-button]");
      const status = player.querySelector("[data-player-status]");
      let hlsInstance = null;
      let initialized = false;

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function startPlayback() {
        if (!video) {
          return;
        }
        const source = video.dataset.hlsSrc;
        if (!source) {
          setStatus("暂无播放源");
          return;
        }
        if (!initialized) {
          initialized = true;
          setStatus("正在加载");
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              setStatus("可以播放");
              video.play().catch(function () {
                setStatus("点击视频继续播放");
              });
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
              if (data && data.fatal) {
                setStatus("播放加载失败");
              }
            });
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.addEventListener("loadedmetadata", function () {
              setStatus("可以播放");
              video.play().catch(function () {
                setStatus("点击视频继续播放");
              });
            }, { once: true });
          } else {
            setStatus("当前浏览器需要 HLS 支持");
          }
        } else {
          video.play().catch(function () {
            setStatus("点击视频继续播放");
          });
        }
      }

      if (button) {
        button.addEventListener("click", startPlayback);
      }
      if (video) {
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
          setStatus("正在播放");
        });
        video.addEventListener("pause", function () {
          player.classList.remove("is-playing");
          setStatus("已暂停");
        });
        video.addEventListener("ended", function () {
          player.classList.remove("is-playing");
          setStatus("播放结束");
        });
      }
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  setupMenu();
  setupHeaderSearch();
  setupHero();
  setupLocalFilters();
  setupSearchPage();
  setupPlayers();
})();
