(() => {
  const handleError = e => {
    console.log(e);
    mdui.snackbar({
      message: '<b>Runtime Error</b><br>' + (e.message || e.reason),
      placement: 'bottom-start',
      // queue: 'window.handleError',
      autoCloseDelay: 1.5 * 1000,
      closeable: true,
    });
  };
  window.addEventListener('error', handleError);
  window.addEventListener('unhandledrejection', handleError);
})();
const serviceWorkerScope = `/sw.js`;
navigator.serviceWorker &&
  location.protocol === 'https:' &&
  navigator.serviceWorker
    .register(serviceWorkerScope)
    .then(() => {
      // console.info(`Service worker registered at ${serviceWorkerScope}`);
    })
    .catch(error => {
      console.error('Error in serviceWorker registration: ', error);
    });

document.getElementById('change-content-state').addEventListener('click', _ => {
  if (document.getElementById('change-content-state').classList.contains('pack_up')) {
    document.getElementById('change-content-state').classList.remove('pack_up');
    changeContentState(false);
    document.getElementById('app-main').classList.remove('visible');
  } else {
    document.getElementById('change-content-state').classList.add('pack_up');
    changeContentState(true);
    document.getElementById('app-main').classList.add('visible');
  }
});
!localStorage.getItem('desktop-tool/putAway') && document.getElementById('change-content-state').click();
function changeContentState(pack_up) {
  if (pack_up) {
    document.querySelector('#change-content-state > .text').innerHTML = `<mdui-icon name="arrow_upward"></mdui-icon>
  收起`;
    localStorage.removeItem('desktop-tool/putAway');
  } else {
    document.querySelector('#change-content-state > .text').innerHTML = `<mdui-icon name="arrow_downward"></mdui-icon>
    展开`;
    localStorage.setItem('desktop-tool/putAway', true);
  }
}

if (document.getElementById('close-window'))
  document.getElementById('close-window').addEventListener('click', _ => {
    window.ipc.send('close-window');
  });
document.getElementById('shutdown-sys').addEventListener('click', _ => {
  window.ipc.send('sys-shutdown');
});

function getWeekNumber(weekStartTime, currentTime) {
  let start = dayjs(weekStartTime);
  let current = dayjs(currentTime);
  let startDate = start.startOf('week');
  let currentDate = current.startOf('week');
  let timeDifference = currentDate - startDate;
  const weekNumber = Math.floor(timeDifference / (7 * 24 * 60 * 60 * 1000)) + 1;
  return weekNumber;
}
function getWeekDate(Time) {
  var day = dayjs(Time).day();
  var weeks = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
  var week = weeks[day];
  return week;
}
function listClassesForDay(classSchedule, day, isSingleWeek = true) {
  if (classSchedule.single && classSchedule.single[day]) {
    let classes = classSchedule.single[day];
    if (!isSingleWeek) {
      if (classSchedule.double && classSchedule.double[day]) {
        for (const key in classSchedule.double[day]) {
          if (Object.hasOwnProperty.call(classSchedule.double[day], key)) {
            const element = classSchedule.double[day][key];
            const { startTime, endTime, subject } = element;
            if (startTime && endTime && subject) {
              classes[key] = element;
            }
          }
        }
      }
    }
    return classes;
  } else {
    return null;
  }
}
start();
async function getConfigSync(arg) {
  return new Promise((resolve, reject) => {
    try {
      let signal = crypto.randomUUID();
      window.ipc.send('get-config', signal, arg);
      window.ipc.once('get-config/' + signal, data => {
        resolve(data);
      });
    } catch {
      resolve('');
    }
  });
}
async function generateConfig() {
  let data_name = await getConfigSync('lessonsList.name');
  let data_time = await getConfigSync('lessonsList.time');
  let data_weekStart = await getConfigSync('lessonsList.weekStart');
  let new_classSchedule = {
    weekStartDate: data_weekStart,
    single: {
      sunday: {},
      monday: {},
      tuesday: {},
      wednesday: {},
      thursday: {},
      friday: {},
      saturday: {},
    },
    double: {
      sunday: {},
      monday: {},
      tuesday: {},
      wednesday: {},
      thursday: {},
      friday: {},
      saturday: {},
    },
  };
  data_name &&
    data_name.forEach((rowDate, rowIndex) => {
      if (rowDate && rowDate['all']) {
        let name = rowDate['all'].split('\n');
        if (name[0]) {
          new_classSchedule.single = _.mapValues(new_classSchedule.single, object => {
            return { ...object, [rowIndex]: { subject: name[0] } };
          });
        }
        if (name[1]) {
          new_classSchedule.double = _.mapValues(new_classSchedule.double, object => {
            return { ...object, [rowIndex]: { subject: name[1] } };
          });
        }
      }
      _.mapValues(rowDate, function (value, key) {
        if (key != 'all') {
          let name = rowDate[key].split('\n');
          if (name[0]) {
            !new_classSchedule.single[key][rowIndex] && (new_classSchedule.single[key][rowIndex] = {});
            new_classSchedule.single[key][rowIndex].subject = name[0];
          }
          if (name[1]) {
            !new_classSchedule.double[key][rowIndex] && (new_classSchedule.double[key][rowIndex] = {});
            new_classSchedule.double[key][rowIndex].subject = name[1];
          }
        }
      });
    });
  data_time &&
    data_time.forEach((rowDate, rowIndex) => {
      if (rowDate && rowDate['all']) {
        let name = rowDate['all'].split('-');
        if (name[0]) {
          _.mapValues(new_classSchedule.single, (value, key) => {
            !new_classSchedule.single[key][rowIndex] && (new_classSchedule.single[key][rowIndex] = {});
            new_classSchedule.single[key][rowIndex].startTime = name[0];
          });
          _.mapValues(new_classSchedule.double, (value, key) => {
            !new_classSchedule.double[key][rowIndex] && (new_classSchedule.double[key][rowIndex] = {});
            new_classSchedule.double[key][rowIndex].startTime = name[0];
          });
        }
        if (name[1]) {
          _.mapValues(new_classSchedule.single, (value, key) => {
            !new_classSchedule.single[key][rowIndex] && (new_classSchedule.single[key][rowIndex] = {});
            new_classSchedule.single[key][rowIndex].endTime = name[1];
          });
          _.mapValues(new_classSchedule.double, (value, key) => {
            !new_classSchedule.double[key][rowIndex] && (new_classSchedule.double[key][rowIndex] = {});
            new_classSchedule.double[key][rowIndex].endTime = name[1];
          });
        }
      }
      _.mapValues(rowDate, function (value, key) {
        if (key != 'all') {
          let name = rowDate[key].split('-');
          !new_classSchedule.single[key][rowIndex] && (new_classSchedule.single[key][rowIndex] = {});
          !new_classSchedule.double[key][rowIndex] && (new_classSchedule.double[key][rowIndex] = {});
          if (name) {
            new_classSchedule.single[key][rowIndex].startTime = name[0];
            new_classSchedule.double[key][rowIndex].startTime = name[0];
            new_classSchedule.single[key][rowIndex].endTime = name[1];
            new_classSchedule.double[key][rowIndex].endTime = name[1];
          }
        }
      });
    });
  return new_classSchedule;
}
async function start() {
  let slidingPosition = (await getConfigSync('display.slidingPosition')) || 'center';
  let progressDisplay = (await getConfigSync('display.progressDisplay')) || 'always';
  (async () => {
    const fontSize = await getConfigSync('display.fontSize');
    fontSize && (document.querySelector('body').style['font-size'] = fontSize + 'em');
  })();
  (async () => {
    try {
      const hiddenCloseWindow = await getConfigSync('display.hidden.closeWindow');
      if (hiddenCloseWindow) {
        document.getElementById('close-window').style.display = 'none';
      } else {
        document.getElementById('close-window').style.display = 'inline-block';
      }
    } catch (error) {}
  })();
  (async () => {
    try {
      const hiddenRefreshWindow = await getConfigSync('display.hidden.refreshWindow');
      if (hiddenRefreshWindow) {
        document.getElementById('refresh-window').style.display = 'none';
      } else {
        document.getElementById('refresh-window').style.display = 'inline-block';
      }
    } catch (error) {}
  })();
  (async () => {
    try {
      const hiddenPutaway = await getConfigSync('display.hidden.putaway');
      if (hiddenPutaway) {
        document.querySelector('.put_away').style.display = 'none';
      } else {
        document.querySelector('.put_away').style.display = 'flex';
      }
    } catch (error) {}
  })();
  window.ipc &&
    window.ipc.on('sync-config', async () => {
      slidingPosition = (await getConfigSync('display.slidingPosition')) || 'center';
      progressDisplay = (await getConfigSync('display.progressDisplay')) || 'always';
      (async () => {
        const fontSize = await getConfigSync('display.fontSize');
        fontSize && (document.querySelector('body').style['font-size'] = fontSize + 'em');
      })();
      (async () => {
        try {
          const hiddenCloseWindow = await getConfigSync('display.hidden.closeWindow');
          if (hiddenCloseWindow) {
            document.getElementById('close-window').style.display = 'none';
          } else {
            document.getElementById('close-window').style.display = 'inline-block';
          }
        } catch (error) {}
      })();
      (async () => {
        try {
          const hiddenRefreshWindow = await getConfigSync('display.hidden.refreshWindow');
          if (hiddenRefreshWindow) {
            document.getElementById('refresh-window').style.display = 'none';
          } else {
            document.getElementById('refresh-window').style.display = 'inline-block';
          }
        } catch (error) {}
      })();
      (async () => {
        try {
          const hiddenPutaway = await getConfigSync('display.hidden.putaway');
          if (hiddenPutaway) {
            document.querySelector('.put_away').style.display = 'none';
          } else {
            document.querySelector('.put_away').style.display = 'flex';
          }
        } catch (error) {}
      })();
      classSchedule = await generateConfig();
    });
  (() => {
    redraw();
    setInterval(() => {
      redraw();
    }, 1 * 1000);
  })();
  async function redraw() {
    async function getChangeDay(parse_out = true, currentTime) {
      const days_origin = await getConfigSync('lessonsList.changeDay');
      if (!days_origin) return;
      const days = [...days_origin.matchAll(/(?<!\/\/[ ]*?)(\d{4}\/\d{1,2}\/\d{1,2})[ ]*?-[ ]*?(\d{4}\/\d{1,2}\/\d{1,2})/g)];
      const now = dayjs(currentTime);
      for (const key in days) {
        if (Object.prototype.hasOwnProperty.call(days, key)) {
          const day = days[key];
          const daySource = dayjs(day[1]);
          if (now.isSame(daySource, 'day')) {
            const dayTransform = parse_out ? dayjs(day[2]) : day[2];
            return dayTransform;
          }
        }
      }
    }
    let classSchedule = await generateConfig();
    let inputTime = dayjs();
    let changed = await getChangeDay(true, inputTime);
    if (changed) changed = changed.set('h', inputTime.get('h')).set('m', inputTime.get('m')).set('s', inputTime.get('s'));

    let weekChanged = getWeekNumber(classSchedule.weekStartDate, changed);
    let weekNow = getWeekNumber(classSchedule.weekStartDate, inputTime);
    let weekTotal = inputTime.week();

    document.getElementById('weekNumber').textContent = `#${weekNow}/${weekTotal}`;

    let classes = listClassesForDay(classSchedule, getWeekDate(changed).toLowerCase(), Math.abs(weekChanged % 2) == 1);
    if (Object.keys(classes).length === 0 || !classes) {
      classes = [
        { startTime: '11:45', endTime: '14:19', subject: 'Example' },
        { startTime: '11:45', endTime: '14:19', subject: 'Example' },
      ];
    }

    const contentContainer = document.querySelector('#app-main > .content > .class-list');
    contentContainer.innerHTML = '';
    let temp_scroll_item = null,
      temp_is_first_item = true;
    for (const classNumber in classes) {
      const classInfo = classes[classNumber];
      const { startTime, endTime, subject } = classInfo;

      if (startTime && endTime && subject) {
        // 创建新的<div>元素
        const classElement = document.createElement('div');
        classElement.innerHTML = `<span style="font-size:0.8em;border-radius:min(0.25em, 12px);background:#0001;padding:0 4px;margin-right:0.25em;color:grey;">${startTime}<span style="margin:0 0.2em;">-</span>${endTime}</span><span>${subject}</span>`;

        classElement.style.backgroundColor = '#fff8';
        classElement.style.boxShadow = 'var(--mdui-elevation-level2)';

        // 检查是否已经上课
        let currentTime = new Date();
        let temp_classStartTime = startTime.split(':');
        let classStartTime = new Date(
          currentTime.getFullYear(),
          currentTime.getMonth(),
          currentTime.getDate(),
          temp_classStartTime[0],
          temp_classStartTime[1]
        );
        let temp_classEndTime = endTime.split(':');
        let classEndTime = new Date(
          currentTime.getFullYear(),
          currentTime.getMonth(),
          currentTime.getDate(),
          temp_classEndTime[0],
          temp_classEndTime[1]
        );
        let state = 'default';
        // console.log(currentTime, subject, classStartTime, classEndTime);
        if (temp_is_first_item) {
          temp_is_first_item = false;
          temp_scroll_item = classElement;
        }
        if (currentTime >= classStartTime && currentTime <= classEndTime) {
          // 正在上的课程 active
          state = 'active';
          classElement.style.backgroundColor = 'rgba(var(--mdui-color-tertiary-container),0.7)';
          temp_scroll_item = classElement;
        } else if (currentTime > classEndTime) {
          // 已经上的课程 before
          state = 'before';
          classElement.style.color = 'gray';
          temp_scroll_item = classElement;
        } else {
          // 未上的课程 after
          state = 'after';
        }
        if (progressDisplay == 'always') {
          addProgress();
        } else if (progressDisplay == 'active' && state == 'active') {
          addProgress();
        }

        function addProgress() {
          let percent = ((currentTime.getTime() - classStartTime.getTime()) / (classEndTime.getTime() - classStartTime.getTime())) * 100;
          let subjectElement = document.createElement('div');
          subjectElement.innerHTML = `<mdui-linear-progress style="margin-top:4px;display: flex" value="${
            percent > 0 ? percent : 0
          }" max="100"></mdui-linear-progress>`;
          classElement.appendChild(subjectElement.firstChild);
        }

        // 将新元素添加到容器
        contentContainer.appendChild(classElement);
      }
    }
    if (temp_scroll_item)
      temp_scroll_item.scrollIntoView({
        behavior: 'smooth', // 可以选择平滑滚动，也可以使用 'auto' 或 'instant'
        block: slidingPosition, // 'start', 'center', 'end', 或 'nearest'
        inline: 'nearest', // 'start', 'center', 'end', 或 'nearest'
      });
  }
}
