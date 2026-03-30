import { Droplets, Wind } from "lucide-react";
import { useWeather } from "@/hooks/use-weather";

// KBO 구장 → 좌표 매핑
const STADIUM_COORDS: Record<string, { lat: number; lon: number; city: string }> = {
  잠실: { lat: 37.5122, lon: 127.0719, city: "서울" },
  고척: { lat: 37.4982, lon: 126.8674, city: "서울" },
  광주: { lat: 35.1687, lon: 126.8882, city: "광주" },
  대구: { lat: 35.8409, lon: 128.6813, city: "대구" },
  사직: { lat: 35.1937, lon: 129.0611, city: "부산" },
  수원: { lat: 37.2979, lon: 127.0094, city: "수원" },
  인천: { lat: 37.437, lon: 126.6931, city: "인천" },
  창원: { lat: 35.2229, lon: 128.582, city: "창원" },
  대전: { lat: 36.3171, lon: 127.4299, city: "대전" },
  청주: { lat: 36.6424, lon: 127.489, city: "청주" },
};

function getStadiumCoords(stadiumName: string) {
  for (const [key, val] of Object.entries(STADIUM_COORDS)) {
    if (stadiumName.includes(key)) return val;
  }
  // 기본값: 서울
  return { lat: 37.5665, lon: 126.978, city: "서울" };
}

interface WeatherBannerProps {
  stadiumName?: string;
}

export function WeatherBanner({ stadiumName }: WeatherBannerProps) {
  const coords = getStadiumCoords(stadiumName || "");
  const weather = useWeather(coords.lat, coords.lon);

  if (!weather) return null;

  return (
    <div className="flex items-center gap-3 sm:gap-4 px-4 py-2.5 mb-3 rounded-xl bg-muted/40 border border-border/60 text-[13px] overflow-hidden">
      <span className="text-xl shrink-0">{weather.icon}</span>
      <span className="font-bold text-foreground shrink-0">{coords.city}</span>
      <span className="font-black text-foreground text-base shrink-0">{weather.temp}°C</span>
      <span className="text-muted-foreground shrink-0">{weather.condition}</span>
      <span className="text-muted-foreground shrink-0 hidden sm:inline">
        체감 {weather.feelsLike}°
      </span>
      <div className="flex items-center gap-3 ml-auto shrink-0">
        <span className="flex items-center gap-1 text-muted-foreground">
          <Droplets className="w-3.5 h-3.5 text-blue-400" />
          {weather.humidity}%
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <Wind className="w-3.5 h-3.5 text-cyan-400" />
          {weather.windSpeed}m/s
        </span>
      </div>
    </div>
  );
}
