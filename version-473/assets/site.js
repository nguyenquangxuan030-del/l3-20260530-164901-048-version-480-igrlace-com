(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        start();
    }

    function setupFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-type-filter]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        if (!cards.length) {
            return;
        }
        var state = {
            query: "",
            type: ""
        };
        function apply() {
            var q = state.query.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = card.getAttribute("data-search") || "";
                var type = card.getAttribute("data-type") || "";
                var queryMatch = !q || text.indexOf(q) !== -1;
                var typeMatch = !state.type || type === state.type;
                card.classList.toggle("is-hidden", !(queryMatch && typeMatch));
            });
        }
        inputs.forEach(function (input) {
            input.addEventListener("input", function () {
                state.query = input.value || "";
                apply();
            });
        });
        selects.forEach(function (select) {
            select.addEventListener("change", function () {
                state.type = select.value || "";
                buttons.forEach(function (button) {
                    button.classList.toggle("is-active", button.value === state.type);
                });
                apply();
            });
        });
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                state.type = button.value || "";
                buttons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                selects.forEach(function (select) {
                    select.value = state.type;
                });
                apply();
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();

function initializePlayer(streamUrl) {
    var video = document.querySelector(".video-player");
    var overlay = document.querySelector(".play-overlay");
    if (!video || !overlay || !streamUrl) {
        return;
    }
    var hls = null;
    var attached = false;
    function attach() {
        if (attached) {
            return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }
    function begin() {
        attach();
        overlay.classList.add("is-hidden");
        video.setAttribute("controls", "controls");
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {});
        }
    }
    overlay.addEventListener("click", begin);
    video.addEventListener("click", function () {
        if (video.paused) {
            begin();
        }
    });
    video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
