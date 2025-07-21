(() => {
  let weatherComponent = document.querySelector('#weather');
  if (weatherComponent) {
    weatherComponent.addEventListener('click', async () => {
      return;
      const json = await getWeather();
      json?.fxLink && window.open(json?.fxLink);
      interval(false, true);
    });
    interval();
    async function interval(useTimeout = true, force = false) {
      try {
        // weatherComponent.style.backgroundColor = '#1a6899';
        useTimeout && (weatherComponent.innerHTML = ` --° `);
        const json = await getWeather(101300505, force);
        // console.log(json);
        // weatherComponent.style.backgroundColor = '#228acb';
        let icon = json.now.icon;
        if (icon == 154) {
          icon = 104;
        }
        weatherComponent.innerHTML = `${icon ? `<i class="qi-${icon}"></i>` : ''}  ${
          json.now.text ? json.now.text + ' ' : ''
        }${json.now.temp ?? '--'}°`;
      } catch (error) {}
      useTimeout &&
        setTimeout(() => {
          interval();
        }, 1 * 1000);
    }
  }
})();
async function getWeather(location, force = false) {
  if (!force && localStorage.getItem('weather') && localStorage.getItem('weather_expires') > Date.now()) {
    return JSON.parse(localStorage.getItem('weather'));
  }
  if (!location) return {};
  let json;
  try {
    json = await (
      await fetch(`https://api.qweather.com/v7/weather/now?location=${location}&key=bdd98ec1d87747f3a2e8b1741a5af796`, {
        referrerPolicy: 'no-referrer',
      })
    ).json();
  } catch (error) {
    json = {};
  }
  localStorage.setItem('weather', JSON.stringify(json));
  localStorage.setItem('weather_expires', Date.now() + 10 * 60 * 1000);
  return json;
}
