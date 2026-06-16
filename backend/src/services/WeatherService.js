const WeatherCache = require('../models/WeatherCache');

const getWeatherCondition = (code) => {
  if (code === 0) return { text: 'Sunny', type: 'clear' };
  if (code >= 1 && code <= 3) return { text: 'Partly Cloudy', type: 'cloudy' };
  if (code >= 45 && code <= 48) return { text: 'Foggy', type: 'fog' };
  if (code >= 51 && code <= 55) return { text: 'Drizzle', type: 'rain' };
  if (code >= 61 && code <= 65) return { text: 'Rainy', type: 'rain' };
  if (code >= 71 && code <= 77) return { text: 'Snowy', type: 'snow' };
  if (code >= 80 && code <= 82) return { text: 'Showers', type: 'rain' };
  if (code >= 95 && code <= 99) return { text: 'Thunderstorm', type: 'storm' };
  return { text: 'Cloudy', type: 'cloudy' };
};

const fetchLiveWeather = async (lat, lon) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&timezone=auto`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo API returned status ${response.status}`);
  }
  const data = await response.json();
  
  const currentCondition = getWeatherCondition(data.current.weather_code);
  
  const forecast = data.daily.time.map((time, idx) => {
    const dayCondition = getWeatherCondition(data.daily.weather_code[idx]);
    const dateObj = new Date(time);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    return {
      date: time,
      day: dayName,
      tempMax: Math.round(data.daily.temperature_2m_max[idx]),
      tempMin: Math.round(data.daily.temperature_2m_min[idx]),
      rainProbability: data.daily.precipitation_probability_max[idx],
      condition: dayCondition.text,
      conditionType: dayCondition.type
    };
  });

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return {
    temperature: Math.round(data.current.temperature_2m),
    feelsLike: Math.round(data.current.apparent_temperature),
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    rainProbability: data.current.precipitation_probability,
    condition: currentCondition.text,
    conditionType: currentCondition.type,
    sunrise: formatTime(data.daily.sunrise[0]),
    sunset: formatTime(data.daily.sunset[0]),
    forecast
  };
};

exports.getWeatherForCoordinates = async (latitude, longitude) => {
  const roundedLat = Math.round(latitude * 100) / 100;
  const roundedLon = Math.round(longitude * 100) / 100;
  
  try {
    let cached = await WeatherCache.findOne({ latitude: roundedLat, longitude: roundedLon });
    const cacheExpiryTime = 30 * 60000; // 30 minutes
    
    if (cached && (Date.now() - new Date(cached.updatedAt).getTime() < cacheExpiryTime)) {
      return cached.weatherData;
    }
    
    const liveData = await fetchLiveWeather(roundedLat, roundedLon);
    
    if (cached) {
      cached.weatherData = liveData;
      cached.updatedAt = new Date();
      await cached.save();
    } else {
      cached = new WeatherCache({
        latitude: roundedLat,
        longitude: roundedLon,
        weatherData: liveData
      });
      await cached.save();
    }
    
    return liveData;
  } catch (error) {
    console.error(`[WeatherService] Error getting weather for ${latitude}, ${longitude}:`, error.message);
    
    const staleCache = await WeatherCache.findOne({ latitude: roundedLat, longitude: roundedLon });
    if (staleCache) {
      console.log('[WeatherService] Returning stale weather cache as fallback');
      return staleCache.weatherData;
    }
    
    return {
      temperature: 34,
      feelsLike: 36,
      humidity: 65,
      windSpeed: 12,
      rainProbability: 20,
      condition: 'Sunny',
      conditionType: 'clear',
      sunrise: '05:15 AM',
      sunset: '06:55 PM',
      forecast: [
        { date: new Date().toISOString().split('T')[0], day: 'Today', tempMax: 35, tempMin: 26, rainProbability: 20, condition: 'Sunny', conditionType: 'clear' },
        { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], day: 'Tue', tempMax: 34, tempMin: 25, rainProbability: 30, condition: 'Partly Cloudy', conditionType: 'cloudy' },
        { date: new Date(Date.now() + 172800000).toISOString().split('T')[0], day: 'Wed', tempMax: 33, tempMin: 24, rainProbability: 60, condition: 'Rainy', conditionType: 'rain' },
        { date: new Date(Date.now() + 259200000).toISOString().split('T')[0], day: 'Thu', tempMax: 32, tempMin: 24, rainProbability: 40, condition: 'Partly Cloudy', conditionType: 'cloudy' },
        { date: new Date(Date.now() + 345600000).toISOString().split('T')[0], day: 'Fri', tempMax: 34, tempMin: 25, rainProbability: 10, condition: 'Sunny', conditionType: 'clear' },
        { date: new Date(Date.now() + 432000000).toISOString().split('T')[0], day: 'Sat', tempMax: 35, tempMin: 26, rainProbability: 15, condition: 'Sunny', conditionType: 'clear' },
        { date: new Date(Date.now() + 518400000).toISOString().split('T')[0], day: 'Sun', tempMax: 36, tempMin: 27, rainProbability: 5, condition: 'Sunny', conditionType: 'clear' }
      ]
    };
  }
};
