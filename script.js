const searchInput = document.getElementById('searchInput');
const apiKey = 'feaddb058e73880988c3da1a8c0a7dc7';

searchInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    const city = searchInput.value;
    fetchWeatherData(city);
  }
})


async function fetchWeatherData(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    updateWeatherInfo(data);
  } catch (error) {
    console.error('Error fetching weather data', error);
  }
}


function updateWeatherInfo(data) {
  console.log(data)

  const currentWeather = data.list[0];
  document.getElementById('cityName').textContent = data.city.name;
  document.getElementById('cityTemp').textContent = `${currentWeather.main.temp}°C`;
  document.getElementById('descriptionWeather').textContent = currentWeather.weather[0].description;
  document.getElementById('highTemp').textContent = `H: ${currentWeather.main.temp_max}°`;
  document.getElementById('lowTemp').textContent = `L: ${currentWeather.main.temp_min}°`;


  //-------------- Hourly ForeCast

  // Populate hourly weather data (for the next 6 hours, considering 3-hour steps)
  const hourlyData = data.list.slice(0, 8); // Get the next 6 hours data
  const hourlyTable = document.querySelector('.hourlyTable tbody');
  hourlyTable.innerHTML = ''; // Clear existing data

  const row = document.createElement('tr');
  hourlyData.forEach(hour => {
    const time = new Date(hour.dt * 1000).toLocaleTimeString([], { hour: 'numeric', hour12: true });
    const iconUrl = `https://openweathermap.org/img/w/${hour.weather[0].icon}.png`;
    const cell = document.createElement('td');
    cell.innerHTML = `${time}<br><img src="${iconUrl}" alt="${hour.weather[0].description}"><br>${hour.main.temp}°C`;
    row.appendChild(cell);
  });
  hourlyTable.appendChild(row);

  //-------------- 5 Day ForeCast

  // Populate 5-day forecast data (for the next 5 days, considering 3-hour steps)
  const fiveDayData = data.list.slice(9, 38); // Get the next 5 days data (5 days * 8 forecasts per day = 40 - 2 (for the first day))
  const fiveDayTable = document.querySelector('.fiveDayTable tbody');
  fiveDayTable.innerHTML = ''; // Clear existing data

  for (let i = 0; i < fiveDayData.length; i += 8) {
    const day = fiveDayData[i];
    const iconUrl = `https://openweathermap.org/img/w/${day.weather[0].icon}.png`;
    const row = document.createElement('tr');
    const dayOfWeek = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' });
    row.innerHTML = `<td>${dayOfWeek}</td>
                       <td><img src="${iconUrl}" alt="${day.weather[0].description}"></td>
                       <td>L:${day.main.temp_min}°</td>
                       <td>| H:${day.main.temp_max}°</td>`;
    fiveDayTable.appendChild(row);
  }


  // Populate other weather details (sunrise, sunset, wind, etc.)
  document.getElementById('sunRiseTime').textContent = new Date(data.city.sunrise * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  document.getElementById('sunSetTime').textContent = new Date(data.city.sunset * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  document.getElementById('windSpeed').textContent = `${currentWeather.wind.speed} m/s`;
  document.getElementById('windDirection').textContent = `${currentWeather.wind.deg}°`;
  document.getElementById('precipitation').textContent = `${currentWeather.rain ? currentWeather.rain['3h'] : 0} MM`;
  document.getElementById('rainProb').textContent = `${(currentWeather.pop * 100).toFixed(1)}%`;
  document.getElementById('humidity').textContent = `${currentWeather.main.humidity}%`;
  document.getElementById('feelsLike').textContent = `${currentWeather.main.feels_like}°`;
  document.getElementById('visibility').textContent = `${currentWeather.visibility / 1000} km`;
  document.getElementById('pressure').textContent = `${currentWeather.main.pressure} hPa`;

}

async function fetchWeatherDataByCoordinates(latitude, longitude) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    updateWeatherInfo(data);
  } catch (error) {
    console.error('Error fetching weather data', error);
  }
}


function getCurrentLocation() {

  navigator.geolocation.getCurrentPosition(
    position => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      fetchWeatherDataByCoordinates(latitude, longitude);
    },
    error => {
      console.error('Error getting location:', error);

      if (error.code === error.PERMISSION_DENIED) {
        console.error('Geolocation permission denied.');
      } 
      else {
        console.error('Error fetching location. Please try again later.');
      }
      const defaultCity = 'Bengaluru';
      fetchWeatherData(defaultCity);
    }
  );
}

document.addEventListener('DOMContentLoaded', () => {
  getCurrentLocation()
});
