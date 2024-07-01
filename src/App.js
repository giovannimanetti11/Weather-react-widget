import React, { useState, useEffect } from 'react';
import LazyLoad from 'react-lazyload';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import './App.css';

// Get background based on weather code
const getWeatherBackground = (weathercode) => {
  switch (true) {
    case weathercode === 0:
      return '/backgrounds/sun.webp';
    case weathercode >= 1 && weathercode <= 3:
      return '/backgrounds/cloudy.webp';
    case (weathercode >= 45 && weathercode <= 48) || (weathercode >= 51 && weathercode <= 57) || (weathercode >= 61 && weathercode <= 67) || (weathercode >= 80 && weathercode <= 86):
      return '/backgrounds/raining.webp';
    case weathercode >= 95 && weathercode <= 99:
      return '/backgrounds/storm.webp';
    default:
      return '/backgrounds/cloudy.webp';
  }
};

// Get weather icon based on weather code
const getWeatherIcon = (weathercode) => {
  switch (true) {
    case weathercode === 0:
      return '/icons/sun.webp';
    case weathercode >= 1 && weathercode <= 3:
      return '/icons/cloudy.webp';
    case (weathercode >= 45 && weathercode <= 48) || (weathercode >= 51 && weathercode <= 57) || (weathercode >= 61 && weathercode <= 67) || (weathercode >= 80 && weathercode <= 86):
      return '/icons/raining.webp';
    case weathercode >= 95 && weathercode <= 99:
      return '/icons/storm.webp';
    default:
      return '/icons/cloudy.webp';
  }
};

// Get weather description based on weather code
const getWeatherDescription = (weathercode) => {
  switch (true) {
    case weathercode === 0:
      return 'Sunny';
    case weathercode >= 1 && weathercode <= 3:
      return 'Partly cloudy';
    case (weathercode >= 45 && weathercode <= 48) || (weathercode >= 51 && weathercode <= 57) || (weathercode >= 61 && weathercode <= 67) || (weathercode >= 80 && weathercode <= 86):
      return 'Raining';
    case weathercode >= 95 && weathercode <= 99:
      return 'Stormy';
    default:
      return 'Cloudy';
  }
};

// Wind direction icon rotation
const getWindDirectionStyle = (windDirection) => {
  return { transform: `rotate(${windDirection}deg)` };
};

// Default cities
const cities = [
  { name: 'Milan', lat: 45.4642, lon: 9.1900 },
  { name: 'New York', lat: 40.7128, lon: -74.0060 },
  { name: 'Dubai', lat: 25.276987, lon: 55.296249 }
];

// API call
const fetchWeatherData = async (latitude, longitude) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=precipitation_probability,relative_humidity_2m,wind_speed_10m,wind_direction_10m`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return {
      ...data.current_weather,
      precipitationProbability: data.hourly.precipitation_probability[0],
      humidity: data.hourly.relative_humidity_2m[0],
      windSpeed: data.hourly.wind_speed_10m[0],
      windDirection: data.hourly.wind_direction_10m[0]
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
};

function App() {
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const getWeather = async () => {
      setLoading(true);
      setError(false);
      const data = await fetchWeatherData(selectedCity.lat, selectedCity.lon);
      if (data) {
        setWeather(data);
      } else {
        setError(true);
      }
      setLoading(false);
    };
    getWeather();
  }, [selectedCity]);

  const handleCityChange = (event) => {
    setSelectedCity(cities[event.target.value]);
  };

  const formatDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return { date, time };
  };

  const { date, time } = formatDateTime();

  // HTML structure

  return (
    <div className="datrix">
      <div className="left-column">
        <div className="weather-image" style={{ backgroundImage: `url(${getWeatherBackground(weather?.weathercode)})` }}>
        <div className="weather-description">{weather ? getWeatherDescription(weather.weathercode) : 'Weather data unavailable'}</div>
          {loading ? (
            <div className="loading">
              <FontAwesomeIcon icon={faSpinner} spin size="2x" />
            </div>
          ) : error ? (
            <div className="error">Error fetching data</div>
          ) : (
            <>
              <div className="temperature">{weather ? `${weather.temperature}°C` : 'N/D'}</div>
              <div className="weather-icon">
                <LazyLoad height={50} offset={100}>
                  <img src={getWeatherIcon(weather?.weathercode)} alt="Weather Icon" />
                </LazyLoad>
              </div>
              <div className="date-time">
                <div className="date">{date}</div>
                <div className="time">{time}</div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="right-column">
        <div className="city-selector">
          <div className="select-container">
            <select onChange={handleCityChange} value={cities.indexOf(selectedCity)} aria-label="Select a city">
              {cities.map((city, index) => (
                <option key={city.name} value={index}>{city.name}</option>
              ))}
            </select>
          </div>
        </div>
        {weather && !loading && !error && (
          <div className="weather-details">
            <p>Humidity: <span>{weather.humidity}%</span></p>
            <p>Precipitation probability: <span>{weather.precipitationProbability}%</span></p>
            <p>Wind speed: <span>{weather.windSpeed} km/h</span></p>
            <div className="wind-direction">
              <p>Wind direction:</p>
              <div className="wind-arrow" style={getWindDirectionStyle(weather.windDirection)}>↑</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
