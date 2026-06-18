document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", mobilePanel.classList.contains("is-open"));
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(activeIndex - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(activeIndex + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var movieLists = Array.prototype.slice.call(document.querySelectorAll("[data-movie-list]"));

    movieLists.forEach(function (list) {
        var section = list.closest("section") || document;
        var searchInput = section.querySelector("[data-search-input]");
        var chips = Array.prototype.slice.call(section.querySelectorAll("[data-filter-chip]"));
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
        var emptyState = section.querySelector("[data-empty-state]");
        var activeFilter = "all";

        function applyFilter() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var filter = card.getAttribute("data-filter") || "all";
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchFilter = activeFilter === "all" || filter === activeFilter;
                var show = matchQuery && matchFilter;

                card.style.display = show ? "" : "none";

                if (show) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        if (searchInput) {
            searchInput.addEventListener("input", applyFilter);
        }

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                activeFilter = chip.getAttribute("data-filter-chip") || "all";

                chips.forEach(function (item) {
                    item.classList.toggle("is-active", item === chip);
                });

                applyFilter();
            });
        });

        applyFilter();
    });

    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
        var video = player.querySelector("video");
        var playButton = player.querySelector("[data-play-button]");
        var source = player.getAttribute("data-src");
        var attached = false;
        var hlsInstance = null;

        function attachSource() {
            if (!video || !source || attached) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                attached = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 60,
                    enableWorker: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                attached = true;
                return;
            }

            video.src = source;
            attached = true;
        }

        function startPlayback() {
            attachSource();

            if (playButton) {
                playButton.classList.add("is-hidden");
            }

            if (video) {
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        video.controls = true;
                    });
                }
            }
        }

        if (playButton) {
            playButton.addEventListener("click", startPlayback);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    startPlayback();
                }
            });
        }

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
});
