export function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

export function getWeatherDescription(main: string): { color: string; bgColor: string } {
  const weatherColors: Record<string, { color: string; bgColor: string }> = {
    Clear: { color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    Clouds: { color: 'text-gray-600', bgColor: 'bg-gray-100' },
    Rain: { color: 'text-blue-600', bgColor: 'bg-blue-100' },
    Drizzle: { color: 'text-blue-400', bgColor: 'bg-blue-50' },
    Thunderstorm: { color: 'text-purple-600', bgColor: 'bg-purple-100' },
    Snow: { color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
    Mist: { color: 'text-gray-500', bgColor: 'bg-gray-50' },
    Fog: { color: 'text-gray-500', bgColor: 'bg-gray-50' }
  };

  return weatherColors[main] || { color: 'text-gray-600', bgColor: 'bg-gray-100' };
}

export function formatTemperature(temp: number, unit: 'C' | 'F' = 'C'): string {
  if (unit === 'F') {
    return `${Math.round(temp * 9/5 + 32)}°F`;
  }
  return `${Math.round(temp)}°C`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
}
