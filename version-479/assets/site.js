(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupSearch() {
    var panels = document.querySelectorAll(".search-panel");
    panels.forEach(function (panel) {
      var area = panel.closest("main") || document;
      var input = panel.querySelector(".site-search-input");
      var typeSelect = panel.querySelector(".site-type-select");
      var yearSelect = panel.querySelector(".site-year-select");
      var cards = area.querySelectorAll(".movie-card");
      function applyFilter() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var type = typeSelect ? typeSelect.value : "";
        var year = yearSelect ? yearSelect.value : "";
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var cardType = card.getAttribute("data-type") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var matched = (!keyword || text.indexOf(keyword) !== -1) && (!type || cardType === type) && (!year || cardYear === year);
          card.classList.toggle("is-hidden", !matched);
        });
      }
      panel.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilter();
      });
      [input, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });
    });
  }

  function setupHero() {
    var stage = document.querySelector(".hero-stage");
    if (!stage) {
      return;
    }
    var slides = Array.prototype.slice.call(stage.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(stage.querySelectorAll(".hero-dot"));
    var prev = stage.querySelector(".hero-prev");
    var next = stage.querySelector(".hero-next");
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
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
    if (!slides.length) {
      return;
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    stage.addEventListener("mouseenter", stop);
    stage.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupPlayers() {
    var shells = document.querySelectorAll(".player-shell");
    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".player-overlay");
      if (!video) {
        return;
      }
      var streamUrl = video.getAttribute("data-stream-url");
      var attached = false;
      function attachStream() {
        if (attached || !streamUrl) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }
      function playVideo() {
        attachStream();
        shell.classList.add("is-playing");
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }
      if (button) {
        button.addEventListener("click", playVideo);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupSearch();
    setupHero();
    setupPlayers();
  });
})();
