function initMoviePlayer(streamUrl) {
  var video = document.getElementById('player-video');
  var cover = document.querySelector('[data-player-cover]');
  var hlsInstance = null;

  function ensureStream() {
    if (!video || video.getAttribute('data-ready') === '1') return;
    video.setAttribute('data-ready', '1');
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }
    video.src = streamUrl;
  }

  function begin() {
    if (!video) return;
    ensureStream();
    if (cover) cover.classList.add('is-hidden');
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (cover) cover.addEventListener('click', begin);
  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) begin();
    });
  }
  window.addEventListener('pagehide', function () {
    if (hlsInstance) hlsInstance.destroy();
  });
}
