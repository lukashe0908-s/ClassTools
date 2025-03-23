(() => {
  if (!window.ipc) return;
  window.ipc.send('mainWindow_ignoreMouseEvent', false);
  let status = false;
  let moveEvent = event => {
    let flag = event.target === document.documentElement || event.target === document.body;
    if (flag) {
      if (status === false) {
        status = true;
        window.ipc.send('mainWindow_ignoreMouseEvent', true);
      }
    } else {
      if (status === true) {
        status = false;
        window.ipc.send('mainWindow_ignoreMouseEvent', false);
      }
    }
  };
  window.addEventListener('mousemove', moveEvent);
  window.addEventListener('pointermove', moveEvent);
  window.addEventListener('touchstart', moveEvent);
  window.addEventListener('touchmove', moveEvent);
})();
