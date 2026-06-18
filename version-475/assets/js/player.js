(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var video = document.getElementById("moviePlayer");
    var startButton = document.querySelector("[data-player-start]");
    if (!video) {
      return;
    }

    var source = video.getAttribute("data-src");
    var attached = false;
    var hls = null;

    function hideCover() {
      if (startButton) {
        startButton.classList.add("is-hidden");
      }
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    function attachSource() {
      if (!source) {
        return;
      }
      if (attached) {
        hideCover();
        playVideo();
        return;
      }
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        hideCover();
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          hideCover();
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            hls.destroy();
            video.src = source;
            hideCover();
          }
        });
        return;
      }

      video.src = source;
      hideCover();
      playVideo();
    }

    if (startButton) {
      startButton.addEventListener("click", attachSource);
    }

    video.addEventListener("click", function () {
      if (!attached || video.paused) {
        attachSource();
      }
    });
  });
})();
