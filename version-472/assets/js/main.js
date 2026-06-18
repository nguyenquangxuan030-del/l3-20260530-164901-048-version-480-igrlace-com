(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function textOf(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initMobileMenu() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
                slide.setAttribute("aria-hidden", i === index ? "false" : "true");
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var lists = Array.prototype.slice.call(document.querySelectorAll("[data-filter-list]"));
        lists.forEach(function (list) {
            var root = list.closest("[data-filter-root]") || document;
            var keyword = root.querySelector("[data-filter-input]");
            var region = root.querySelector("[data-filter-region]");
            var year = root.querySelector("[data-filter-year]");
            var category = root.querySelector("[data-filter-category]");
            var empty = root.querySelector("[data-empty]");
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query && keyword) {
                keyword.value = query;
            }

            function apply() {
                var q = textOf(keyword && keyword.value);
                var r = textOf(region && region.value);
                var y = textOf(year && year.value);
                var c = textOf(category && category.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = textOf([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.category,
                        card.textContent
                    ].join(" "));
                    var ok = true;
                    if (q && haystack.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (r && textOf(card.dataset.region).indexOf(r) === -1) {
                        ok = false;
                    }
                    if (y && textOf(card.dataset.year).indexOf(y) === -1) {
                        ok = false;
                    }
                    if (c && textOf(card.dataset.category) !== c) {
                        ok = false;
                    }
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [keyword, region, year, category].forEach(function (field) {
                if (field) {
                    field.addEventListener("input", apply);
                    field.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function formatTime(seconds) {
        if (!Number.isFinite(seconds)) {
            return "0:00";
        }
        var minutes = Math.floor(seconds / 60);
        var rest = Math.floor(seconds % 60).toString().padStart(2, "0");
        return minutes + ":" + rest;
    }

    function initPlayer() {
        var shell = document.querySelector(".player-shell");
        if (!shell) {
            return;
        }
        var video = shell.querySelector("video");
        var playButtons = Array.prototype.slice.call(shell.querySelectorAll("[data-play-toggle]"));
        var muteButton = shell.querySelector("[data-mute-toggle]");
        var fullButton = shell.querySelector("[data-fullscreen]");
        var progress = shell.querySelector("[data-progress]");
        var fill = shell.querySelector("[data-progress-fill]");
        var current = shell.querySelector("[data-current-time]");
        var duration = shell.querySelector("[data-duration]");
        var stream = video ? video.getAttribute("data-stream") : "";
        var hls;

        if (!video || !stream) {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
        } else {
            video.src = stream;
        }

        function setPlaying(isPlaying) {
            shell.classList.toggle("is-playing", isPlaying);
            playButtons.forEach(function (button) {
                button.textContent = isPlaying ? "❚❚" : "▶";
            });
        }

        function togglePlay() {
            if (video.paused) {
                var attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {});
                }
            } else {
                video.pause();
            }
        }

        playButtons.forEach(function (button) {
            button.addEventListener("click", togglePlay);
        });
        video.addEventListener("click", togglePlay);
        video.addEventListener("play", function () {
            setPlaying(true);
        });
        video.addEventListener("pause", function () {
            setPlaying(false);
        });
        video.addEventListener("timeupdate", function () {
            if (fill && video.duration) {
                fill.style.width = (video.currentTime / video.duration * 100) + "%";
            }
            if (current) {
                current.textContent = formatTime(video.currentTime);
            }
        });
        video.addEventListener("loadedmetadata", function () {
            if (duration) {
                duration.textContent = formatTime(video.duration);
            }
        });
        if (muteButton) {
            muteButton.addEventListener("click", function () {
                video.muted = !video.muted;
                muteButton.textContent = video.muted ? "🔇" : "🔊";
            });
        }
        if (fullButton) {
            fullButton.addEventListener("click", function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (shell.requestFullscreen) {
                    shell.requestFullscreen();
                }
            });
        }
        if (progress) {
            progress.addEventListener("click", function (event) {
                if (!video.duration) {
                    return;
                }
                var box = progress.getBoundingClientRect();
                var ratio = (event.clientX - box.left) / box.width;
                video.currentTime = Math.max(0, Math.min(video.duration, ratio * video.duration));
            });
        }
        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initFilters();
        initPlayer();
    });
})();
