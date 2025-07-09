// app.js
// Weather Forecast Application - Modern UI, 5-day forecast, recent cities, improved UX

const WEATHER_API_KEY = 'ecce530474054d7bab9134628250907';
const BASE_URL = 'https://api.weatherapi.com/v1';
const RECENT_CITIES_KEY = 'recent_weather_cities';

// Utility: Save and load recent cities from localStorage
function getRecentCities() {
  return JSON.parse(localStorage.getItem(RECENT_CITIES_KEY) || '[]');
}
function addRecentCity(city) {
  let cities = getRecentCities();
  cities = cities.filter(c => c.toLowerCase() !== city.toLowerCase()); // Remove duplicates (case-insensitive)
  cities.unshift(city);
  if (cities.length > 5) cities = cities.slice(0, 5);
  localStorage.setItem(RECENT_CITIES_KEY, JSON.stringify(cities));
}

// Map WeatherAPI condition codes/texts to flat, modern Font Awesome icons (Weather Union style)
function getWeatherIcon(condition) {
  const text = condition.text.toLowerCase();
  if (text.includes('overcast')) return '<i class="fas fa-cloud text-gray-400 bg-gray-100 rounded-full p-2 shadow-md" style="font-size:2.5rem;"></i>';
  if (text.includes('partly') && text.includes('cloud')) return '<i class="fas fa-cloud-sun text-yellow-300 bg-yellow-50 rounded-full p-2 shadow-md" style="font-size:2.5rem;"></i>';
  if (text.includes('cloud')) return '<i class="fas fa-cloud text-gray-400 bg-gray-100 rounded-full p-2 shadow-md" style="font-size:2.5rem;"></i>';
  if (text.includes('fog') || text.includes('mist') || text.includes('haze')) return '<i class="fas fa-smog text-gray-300 bg-gray-100 rounded-full p-2 shadow-md" style="font-size:2.5rem;"></i>';
  if (text.includes('snow') || text.includes('blizzard') || text.includes('ice')) return '<i class="fas fa-snowflake text-blue-200 bg-blue-50 rounded-full p-2 shadow-md" style="font-size:2.5rem;"></i>';
  if (text.includes('rain') || text.includes('drizzle') || text.includes('shower')) return '<i class="fas fa-cloud-showers-heavy text-blue-500 bg-blue-100 rounded-full p-2 shadow-md" style="font-size:2.5rem;"></i>';
  if (text.includes('thunder') || text.includes('storm')) return '<i class="fas fa-bolt text-yellow-500 bg-yellow-100 rounded-full p-2 shadow-md" style="font-size:2.5rem;"></i>';
  if (text.includes('hail')) return '<i class="fas fa-icicles text-blue-300 bg-blue-50 rounded-full p-2 shadow-md" style="font-size:2.5rem;"></i>';
  if (text.includes('sleet')) return '<i class="fas fa-cloud-meatball text-blue-300 bg-blue-50 rounded-full p-2 shadow-md" style="font-size:2.5rem;"></i>';
  if (text.includes('clear') || text.includes('sunny')) return '<i class="fas fa-sun text-yellow-400 bg-yellow-100 rounded-full p-2 shadow-md" style="font-size:2.5rem;"></i>';
  return '<i class="fas fa-question text-gray-400 bg-gray-100 rounded-full p-2 shadow-md" style="font-size:2.5rem;"></i>';
}

// Render current weather (Weather Union style)
function renderWeather(data) {
  const { location, current } = data;
  return `
    <div class="flex items-center gap-6 mb-6">
      <span class="">${getWeatherIcon(current.condition)}</span>
      <div>
        <h2 class="text-2xl font-extrabold text-gray-800 mb-1">${location.name}, ${location.country}</h2>
        <p class="text-gray-500 text-lg font-medium">${current.condition.text}</p>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-5 mb-6">
      <div class="bg-white/90 rounded-2xl p-6 text-center shadow-md">
        <div class="text-3xl font-extrabold text-blue-700">${current.temp_c}°C</div>
        <div class="text-gray-700 font-medium">Temperature</div>
      </div>
      <div class="bg-white/90 rounded-2xl p-6 text-center shadow-md">
        <div class="text-3xl font-extrabold text-blue-700">${current.humidity}%</div>
        <div class="text-gray-700 font-medium">Humidity</div>
      </div>
      <div class="bg-white/90 rounded-2xl p-6 text-center shadow-md">
        <div class="text-3xl font-extrabold text-blue-700">${current.wind_kph} km/h</div>
        <div class="text-gray-700 font-medium">Wind Speed</div>
      </div>
      <div class="bg-white/90 rounded-2xl p-6 text-center shadow-md">
        <div class="text-3xl font-extrabold text-blue-700">${current.feelslike_c}°C</div>
        <div class="text-gray-700 font-medium">Feels Like</div>
      </div>
    </div>
  `;
}

// Render 5-day forecast (Weather Union style)
function renderForecast(forecast) {
  if (!forecast || !forecast.forecastday) return '';
  return `
    <h3 class="text-xl font-bold text-gray-800 mb-3 mt-6">5-Day Forecast</h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
      ${forecast.forecastday.map(day => `
        <div class="bg-white/80 rounded-2xl p-5 flex flex-col items-center gap-2 shadow-md">
          <span class="">${getWeatherIcon(day.day.condition)}</span>
          <div class="text-center">
            <div class="font-bold text-base mb-1">${day.date}</div>
            <div class="text-gray-700 mb-1">${day.day.condition.text}</div>
            <div class="text-sm">Temp: <span class="font-bold">${day.day.avgtemp_c}°C</span></div>
            <div class="text-sm">Wind: <span class="font-bold">${day.day.maxwind_kph} km/h</span></div>
            <div class="text-sm">Humidity: <span class="font-bold">${day.day.avghumidity}%</span></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function showLoading() {
  document.getElementById('weather-section').innerHTML = '<div class="text-center text-gray-500">Loading...</div>';
}

function showError(message) {
  document.getElementById('weather-section').innerHTML = `<div class="text-center text-red-500">${message}</div>`;
}

// Fetch current and 5-day forecast by city
async function fetchWeatherByCity(city) {
  showLoading();
  try {
    const res = await fetch(`${BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(city)}&days=5`);
    if (!res.ok) throw new Error('City not found');
    const data = await res.json();
    // Only add if not already the most recent
    const cities = getRecentCities();
    if (cities[0]?.toLowerCase() !== city.toLowerCase()) {
      addRecentCity(city);
    }
    renderWeatherAndForecast(data);
    updateRecentCitiesDatalist();
    document.getElementById('city-input').value = '';
  } catch (err) {
    showError(err.message);
  }
}

// Fetch current and 5-day forecast by coordinates
async function fetchWeatherByCoords(lat, lon) {
  showLoading();
  try {
    const res = await fetch(`${BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&days=5`);
    if (!res.ok) throw new Error('Location not found');
    const data = await res.json();
    // Only add if not already the most recent
    const city = data.location.name;
    const cities = getRecentCities();
    if (cities[0]?.toLowerCase() !== city.toLowerCase()) {
      addRecentCity(city);
    }
    renderWeatherAndForecast(data);
    updateRecentCitiesDatalist();
    document.getElementById('city-input').value = '';
  } catch (err) {
    showError(err.message);
  }
}

function renderWeatherAndForecast(data) {
  document.getElementById('weather-section').innerHTML =
    renderMainWeatherCard(data) + renderForecastCards(data.forecast);
}

// Render search UI (left column)
function renderSearchUI() {
  return `
    <label class="font-semibold text-gray-700">Enter a City Name</label>
    <input id="city-input" type="text" list="recent-cities-list" placeholder="E.g., New York, London, Tokyo" class="px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full" autocomplete="off" />
    <datalist id="recent-cities-list"></datalist>
    <button id="search-btn" class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition mt-2">Search</button>
    <div class="flex items-center gap-2 my-2 text-gray-500"><hr class="flex-1 border-gray-300"/>or<hr class="flex-1 border-gray-300"/></div>
    <button id="current-location-btn" class="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 rounded transition">Use Current Location</button>
  `;
}

function updateRecentCitiesDatalist() {
  const datalist = document.getElementById('recent-cities-list');
  if (!datalist) return;
  const cities = getRecentCities();
  // Only unique cities
  const uniqueCities = [...new Set(cities.map(c => c.toLowerCase()))].map(lc => cities.find(c => c.toLowerCase() === lc));
  datalist.innerHTML = uniqueCities.map(city => `<option value="${city}"></option>`).join('');
}

// Render main weather card (right column, top)
function renderMainWeatherCard(data) {
  const { location, current } = data;
  return `
    <div class="flex flex-col md:flex-row items-center justify-between bg-blue-500 text-white rounded-xl p-6 shadow mb-2">
      <div>
        <div class="text-xl font-bold mb-1">${location.name} (${location.localtime.split(' ')[0]})</div>
        <div class="text-base">Temperature: ${current.temp_c}°C</div>
        <div class="text-base">Wind: ${current.wind_kph} km/h</div>
        <div class="text-base">Humidity: ${current.humidity}%</div>
      </div>
      <div class="flex flex-col items-center mt-4 md:mt-0">
        <span class="text-5xl mb-1" id="main-weather-icon">${getWeatherIcon(current.condition)}</span>
        <span class="text-base">${current.condition.text}</span>
      </div>
    </div>
  `;
}

// Render 5-day forecast cards (right column, bottom)
function renderForecastCards(forecast) {
  if (!forecast || !forecast.forecastday) return '';
  return `
    <div class="font-semibold text-gray-700 mb-2">5-Day Forecast</div>
    <div class="flex flex-nowrap gap-4 justify-start overflow-x-auto pb-2 pr-2 sm:flex-wrap sm:overflow-x-visible">
      ${forecast.forecastday.map(day => `
        <div class="bg-white/90 text-gray-800 rounded-2xl p-4 flex flex-col items-center min-w-[11rem] w-44 flex-shrink-0 shadow hover:shadow-lg transition-all text-center break-words sm:w-auto sm:min-w-[160px] sm:max-w-[200px]">
          <span class="block mx-auto mb-2" style="width:3.5rem;height:3.5rem;">${getWeatherIcon(day.day.condition)}</span>
          <div class="text-xs sm:text-sm font-bold mb-1">(${day.date})</div>
          <div class="text-xs sm:text-sm">Temp: ${day.day.avgtemp_c}°C</div>
          <div class="text-xs sm:text-sm">Wind: ${day.day.maxwind_kph} km/h</div>
          <div class="text-xs sm:text-sm">Humidity: ${day.day.avghumidity}%</div>
        </div>
      `).join('')}
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('search-section').innerHTML = renderSearchUI();
  updateRecentCitiesDatalist();

  const cityInput = document.getElementById('city-input');
  cityInput.addEventListener('focus', updateRecentCitiesDatalist);
  cityInput.addEventListener('input', updateRecentCitiesDatalist);
  cityInput.addEventListener('change', () => {
    const val = cityInput.value.trim();
    const cities = getRecentCities();
    if (cities.map(c => c.toLowerCase()).includes(val.toLowerCase())) {
      fetchWeatherByCity(val);
    }
  });

  document.getElementById('search-btn').addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (!city) {
      showError('Please enter a city name.');
      return;
    }
    fetchWeatherByCity(city);
  });

  document.getElementById('current-location-btn').addEventListener('click', () => {
    if (!navigator.geolocation) {
      showError('Geolocation is not supported by your browser.');
      return;
    }
    showLoading();
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
      },
      () => {
        showError('Unable to retrieve your location.');
      }
    );
  });
}); 