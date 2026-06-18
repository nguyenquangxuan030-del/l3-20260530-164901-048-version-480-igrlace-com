(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobile = document.querySelector("[data-mobile-nav]");
    if (toggle && mobile) {
      toggle.addEventListener("click", function () {
        mobile.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var thumbs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-thumb]"));
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        thumbs.forEach(function (thumb, thumbIndex) {
          thumb.classList.toggle("is-active", thumbIndex === current);
        });
      }

      function start() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      thumbs.forEach(function (thumb, index) {
        thumb.addEventListener("click", function () {
          show(index);
          start();
        });
      });

      show(0);
      start();
    }

    var filterArea = document.querySelector("[data-filter-area]");
    var grid = document.querySelector("[data-card-grid]");
    if (filterArea && grid) {
      var input = filterArea.querySelector("[data-search-input]");
      var genre = filterArea.querySelector("[data-filter-genre]");
      var year = filterArea.querySelector("[data-filter-year]");
      var reset = filterArea.querySelector("[data-filter-reset]");
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }

      function applyFilter() {
        var keyword = normalize(input && input.value);
        var genreValue = normalize(genre && genre.value);
        var yearValue = normalize(year && year.value);

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags
          ].join(" "));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchGenre = !genreValue || normalize(card.dataset.genre).indexOf(genreValue) !== -1 || normalize(card.dataset.tags).indexOf(genreValue) !== -1;
          var matchYear = !yearValue || normalize(card.dataset.year) === yearValue;
          card.classList.toggle("is-hidden-card", !(matchKeyword && matchGenre && matchYear));
        });
      }

      [input, genre, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });

      if (reset) {
        reset.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (genre) {
            genre.value = "";
          }
          if (year) {
            year.value = "";
          }
          applyFilter();
        });
      }
    }
  });
})();
