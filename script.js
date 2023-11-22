// Defining variables
const searchInput = document.getElementById('searchInput');
const apiKey = 'feaddb058e73880988c3da1a8c0a7dc7';
const kevlinToCelsius = tempKel => tempKel - 273.15;
let city = 'Bengaluru';

// Event listner - when user clicks on Search City input 
searchInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    city = searchInput.value;
    fetchWeatherData(city);
  }
})

// Fetching weather data from OpenWeather API using city as input and updating background images as per weather conditions for tablet and laptop screens
async function fetchWeatherData(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    // Upadte Background images
    const weatherCode = data.list[0].weather[0].icon;
    updateBackground(weatherCode);
    // Update the DOM with weather data
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

// Update weather info in DOM
function updateWeatherInfo(data) {
  const currentWeather = data.list[0];
  document.getElementById('cityName').textContent = data.city.name;
  document.getElementById('cityTemp').textContent = `${Math.round(kevlinToCelsius(currentWeather.main.temp))}°C`;
  document.getElementById('descriptionWeather').textContent = currentWeather.weather[0].description;
  document.getElementById('highTemp').textContent = `H: ${Math.round(kevlinToCelsius(currentWeather.main.temp_max))}°C`;
  document.getElementById('lowTemp').textContent = `L: ${Math.round(kevlinToCelsius(currentWeather.main.temp_min))}°C`;

  //-------------- Hourly forecast with a 3-hour step ------------
  const hourlyData = data.list.slice(0, 9);
  const hourlyTable = document.querySelector('.hourlyTable tbody');
  hourlyTable.innerHTML = '';
  const row = document.createElement('tr');
  // Loop through each hourly forecast data from OpenWeather API
  hourlyData.forEach(hour => {
    const time = new Date(hour.dt * 1000).toLocaleTimeString([], { hour: 'numeric', hour12: true });
    const iconUrl = `https://openweathermap.org/img/wn/${hour.weather[0].icon}@4x.png`;
    const cell = document.createElement('td');
    cell.innerHTML = `${time}<br><br><img src="${iconUrl}" alt="${hour.weather[0].description}"><br><br>${Math.round(kevlinToCelsius(hour.main.temp))}°C`;
    row.appendChild(cell);
  });
  hourlyTable.appendChild(row);

  //-------------- 5 Day forecast including present day -------------------
  const fiveDayTable = document.querySelector('.fiveDayTable tbody');
  fiveDayTable.innerHTML = '';
  // Loop through each 5 day forecast data from OpenWeather API, single day contains 8 hourly forecast with 3-hour step, which is 5*8 = 40 hourly forecast for 5 days.
  for (let i = 0; i < 40; i += 8) {
    const day = data.list[i];
    const date = new Date(day.dt * 1000);
    const dayName = intToDay(date.getDay());
    const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}@4x.png`;
    const row = document.createElement('tr');
    row.innerHTML = `<td>${dayName}</td>
    <td><img src="${iconUrl}" alt="${day.weather[0].description}"></td>
    <td>L:${Math.round(kevlinToCelsius(day.main.temp_min))}°C</td>
    <td>|</td>
    <td>H:${Math.round(kevlinToCelsius(day.main.temp_max))}°C</td>`
    fiveDayTable.appendChild(row);
  }

  // Update other weather details (sunrise, sunset, wind, etc.)
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

// Fetching weather data from OpenWeather API using current location, which collects latitude & longitude of as input and updating background images as per weather conditions for tablet and laptop screens
async function fetchWeatherDataByCoordinates(latitude, longitude) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    // Upadte Background images
    const weatherCode = data.list[0].weather[0].icon;
    updateBackground(weatherCode);
    // Update the DOM with weather data
    updateWeatherInfo(data);
  } catch (error) {
    console.error('Error fetching weather data', error);
  }
}

// Fetching current loaction of the user 
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
      } else {
        console.error('Error fetching location. Please try again later.');
      }
      // Default city if geolocation is not available
      const defaultCity = 'Bengaluru';
      fetchWeatherData(defaultCity);
    }
  );
}

// Event listner - getting current location and focus is set to search input when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  getCurrentLocation();
  searchInput.focus();
});

//----------------- Update Background Images -----------------
const body = document.querySelector('body');
const assetsPath = 'Assets/backgroundImages';

// Helper function to get a random item from an array
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function updateBackground(weatherCode) {
  // Map weather condition codes to arrays of corresponding background images 
  const weatherImages = {
    '01d': [`${assetsPath}/clear-sky-1.jpeg`, `${assetsPath}/clear-sky-2.jpeg`, `${assetsPath}/clear-sky-3.jpeg`],
    '01n': [`${assetsPath}/clear-sky-night-1.jpeg`, `${assetsPath}/clear-sky-night-2.jpeg`, `${assetsPath}/clear-sky-night-4.jpeg`],
    '02d': [`${assetsPath}/clear-sky-day-1.jpeg`, `${assetsPath}/clear-sky-day-3.jpeg`],
    '02n': [`${assetsPath}/clouds-night-2.jpeg`],
    '03d': [`${assetsPath}/clear-sky-day-1.jpeg`,`${assetsPath}/clouds-day-2.jpeg`,`${assetsPath}/clear-sky-day-3.jpeg`],
    '03n': [`${assetsPath}/clouds-night-2.jpeg`, `${assetsPath}/clouds-night-3.jpeg`],
    '04d': [`${assetsPath}/clear-sky-day-1.jpeg`,`${assetsPath}/clouds-day-2.jpeg`,`${assetsPath}/clear-sky-day-3.jpeg`],
    '04n': [`${assetsPath}/clouds-night-2.jpeg`, `${assetsPath}/clouds-night-3.jpeg`],
    '09d': [`${assetsPath}/rain-day-1.jpeg`],
    '09n': [`${assetsPath}/rain-night-1.jpeg`],
    '10d': [`${assetsPath}/rain-day-2.jpeg`],
    '10n': [`${assetsPath}/rain-night-2.jpeg`],
    '11d': [`${assetsPath}/thunderstorm-day-1.jpeg`, `${assetsPath}/thunderstorm-day-2.jpeg`],
    '11n': [`${assetsPath}/thunderstorm-night-1.jpeg`, `${assetsPath}/thunderstorm-night-2.jpeg`, `${assetsPath}/thunderstorm-night-3.jpeg`],
    '13d': [`${assetsPath}/snow-day-1.jpeg`, `${assetsPath}/snow-day-2.jpeg`, `${assetsPath}/snow-day-3.jpeg`, `${assetsPath}/snow-day-4.jpeg`, `${assetsPath}/snow-day-5.jpeg`],
    '13n': [`${assetsPath}/snow-night-1.jpeg`, `${assetsPath}/snow-night-2.jpeg`, `${assetsPath}/snow-night-3.jpeg`],
    '50d': [`${assetsPath}/mist-day-1.jpeg`, `${assetsPath}/mist-day-2.jpeg`, `${assetsPath}/mist-day-3.jpeg`, `${assetsPath}/mist-day-4.jpeg`, `${assetsPath}/mist-day-5.jpeg`],
    '50n': [`${assetsPath}/mist-night-1.jpeg`, `${assetsPath}/mist-night-2.jpeg`, `${assetsPath}/mist-night-3.jpeg`],
  };

  // Check screen width to determine if it's a mobile device
  const isMobile = window.innerWidth <= 780;
  if (isMobile) {
    body.style.backgroundImage = '';
    // Set background color for mobile devices
    body.style.backgroundColor = '#32cff3';
  } else {
    // Set background image for tablet/laptop screens
    const weatherImageArray = weatherImages[weatherCode] || [`${assetsPath}/clear-sky-2.jpeg`];
    const randomImage = getRandomItem(weatherImageArray);
    body.style.backgroundColor = ''; // Clear background color
    body.style.backgroundImage = `url(${randomImage})`;
  }
}