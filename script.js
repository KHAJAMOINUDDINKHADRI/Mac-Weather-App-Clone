const searchInput = document.getElementById('searchInput');
const apiKey = 'feaddb058e73880988c3da1a8c0a7dc7';
const kevlinToCelsius = tempKel => tempKel - 273.15;

searchInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    const city = searchInput.value;
    fetchWeatherData(city);
  }
})


async function fetchWeatherData(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    updateWeatherInfo(data);
  } catch (error) {
    console.error('Error fetching weather data', error);
  }
}

// returns string reprenting the day from interger
const intToDay = dayAsInt => {
  let day = "Weather";
  switch (dayAsInt) {
    case 0:
      day = "Sunday";
      break;
    case 1:
      day = "Monday";
      break;
    case 2:
      day = "Tuesday";
      break;
    case 3:
      day = "Wednesday";
      break;
    case 4:
      day = "Thursday";
      break;
    case 5:
      day = "Friday";
      break;
    case 6:
      day = "Saturday";
  }
  return day;
}

function updateWeatherInfo(data) {

  const currentWeather = data.list[0];
  document.getElementById('cityName').textContent = data.city.name;
  document.getElementById('cityTemp').textContent = `${Math.round(kevlinToCelsius(currentWeather.main.temp))}°C`;
  document.getElementById('descriptionWeather').textContent = currentWeather.weather[0].description;
  document.getElementById('lowTemp').textContent = `L: ${Math.round(kevlinToCelsius(currentWeather.main.temp_min))}°C`;
  document.getElementById('highTemp').textContent = `H: ${Math.round(kevlinToCelsius(currentWeather.main.temp_max))}°C`;

  //-------------- Hourly ForeCast --------------

  const hourlyData = data.list.slice(0, 9); 
  const hourlyTable = document.querySelector('.hourlyTable tbody');
  hourlyTable.innerHTML = ''; 

  const row = document.createElement('tr');
  hourlyData.forEach(hour => {
    const time = new Date(hour.dt * 1000).toLocaleTimeString([], { hour: 'numeric', hour12: true });
    const iconUrl = `https://openweathermap.org/img/w/${hour.weather[0].icon}.png`;
    const cell = document.createElement('td');
    cell.innerHTML = `${time}<br><img src="${iconUrl}" alt="${hour.weather[0].description}"><br>${Math.round(kevlinToCelsius(hour.main.temp))}°C`;
    row.appendChild(cell);
  });
  hourlyTable.appendChild(row);

  //-------------- 5 Day ForeCast ---------------

 // Get the next 5 days data (5 days * 8 forecasts per day = 40 )
  const fiveDayTable = document.querySelector('.fiveDayTable tbody');
  fiveDayTable.innerHTML = ''; // Clear existing data

  for (let i = 0; i < 40; i += 8) {
    const day = data.list[i];
    const date = new Date(day.dt * 1000);
    const dayName = intToDay(date.getDay());
    const iconUrl = `https://openweathermap.org/img/w/${day.weather[0].icon}.png`;
    const row = document.createElement('tr');
    row.innerHTML = `<td>${dayName}</td>
    <td><img src="${iconUrl}" alt="${day.weather[0].description}"></td>
    <td>L:${Math.round(kevlinToCelsius(day.main.temp_min))}°C</td>
    <td>|</td>
    <td>H:${Math.round(kevlinToCelsius(day.main.temp_max))}°C</td>`
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
  document.getElementById('feelsLike').textContent = `${Math.round(kevlinToCelsius(currentWeather.main.feels_like))}°C`;
  document.getElementById('visibility').textContent = `${currentWeather.visibility / 1000} km`;
  document.getElementById('pressure').textContent = `${currentWeather.main.pressure} hPa`;

}

async function fetchWeatherDataByCoordinates(latitude, longitude) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

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
  getCurrentLocation();
  searchInput.focus();
});
