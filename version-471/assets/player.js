import { H as Hls } from './video-vendor-dru42stk.js';

function mountPlayer(box) {
  var video = box.querySelector('video[data-m3u8]');
  var button = box.querySelector('[data-play-button]');
  var source = video ? video.getAttribute('data-m3u8') : '';
  var attached = false;
  var hls = null;

  if (!video || !source) {
    return;
  }

  function attachSource() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function start() {
    attachSource();
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    box.classList.add('playing');
  });

  video.addEventListener('pause', function () {
    box.classList.remove('playing');
  });

  video.addEventListener('ended', function () {
    box.classList.remove('playing');
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(mountPlayer);
