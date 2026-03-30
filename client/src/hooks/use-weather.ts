import { useState, useEffect } from "react";

export interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
}

export function useWeather(lat: number, lon: number) {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    if (!lat || !lon) return;
    fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data && !data.error) setWeather(data); })
      .catch(() => {});
  }, [lat, lon]);

  return weather;
}
