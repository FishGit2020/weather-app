export type Locale = 'en' | 'es';

export type TranslationKey = keyof typeof en;

const en = {
  // Navigation
  'nav.home': 'Home',
  'nav.compare': 'Compare',
  'nav.skipToContent': 'Skip to content',

  // Search
  'search.placeholder': 'Search for a city...',
  'search.noResults': 'No cities found',
  'search.noResultsHint': 'Try a different search term',
  'search.recentSearches': 'Recent Searches',
  'search.popularCities': 'Popular Cities',
  'search.useMyLocation': 'Use my current location',
  'search.gettingLocation': 'Getting location...',

  // Weather Display
  'weather.backToSearch': 'Back to Search',
  'weather.refresh': 'Refresh',
  'weather.refreshing': 'Refreshing...',
  'weather.live': 'Live',
  'weather.lastUpdated': 'Last updated:',
  'weather.noLocation': 'No location selected. Search for a city to see weather.',
  'weather.hourlyForecast': 'Hourly Forecast',
  'weather.7dayForecast': '7-Day Forecast',
  'weather.feelsLike': 'Feels like',
  'weather.humidity': 'Humidity',
  'weather.wind': 'Wind',
  'weather.pressure': 'Pressure',
  'weather.cloudiness': 'Cloudiness',

  // Dashboard settings
  'dashboard.settings': 'Dashboard settings',
  'dashboard.showWidgets': 'Show Widgets',
  'dashboard.currentWeather': 'Current Weather',
  'dashboard.forecast': '7-Day Forecast',
  'dashboard.hourlyForecast': 'Hourly Forecast',
  'dashboard.hourlyChart': 'Hourly Chart',
  'dashboard.weatherAlerts': 'Weather Alerts',
  'dashboard.whatToWear': 'What to Wear',
  'dashboard.sunriseSunset': 'Sunrise & Sunset',
  'dashboard.weatherMap': 'Weather Map',

  // Notifications
  'notifications.enable': 'Enable notifications',
  'notifications.enabled': 'Notifications enabled',
  'notifications.blocked': 'Notifications blocked by browser',
  'notifications.notConfigured': 'Push notifications not configured',

  // Compare
  'compare.title': 'Compare Weather',
  'compare.needCities': 'You need at least 2 cities in your favorites or recent searches to compare weather.',
  'compare.addCities': 'Search for cities and add them to your favorites first.',
  'compare.chooseCIty': 'Choose a city...',
  'compare.5dayComparison': '5-Day Temperature Comparison',

  // Favorites
  'favorites.title': 'Favorite Cities',

  // Footer
  'footer.dataProvider': 'Weather data provided by',
  'footer.builtWith': 'Built with React, Vite, and Micro Frontend Architecture',

  // Language
  'language.label': 'Language',
  'language.en': 'English',
  'language.es': 'Español',
} as const;

const es: Record<TranslationKey, string> = {
  // Navigation
  'nav.home': 'Inicio',
  'nav.compare': 'Comparar',
  'nav.skipToContent': 'Saltar al contenido',

  // Search
  'search.placeholder': 'Buscar una ciudad...',
  'search.noResults': 'No se encontraron ciudades',
  'search.noResultsHint': 'Prueba con otro término de búsqueda',
  'search.recentSearches': 'Búsquedas recientes',
  'search.popularCities': 'Ciudades populares',
  'search.useMyLocation': 'Usar mi ubicación actual',
  'search.gettingLocation': 'Obteniendo ubicación...',

  // Weather Display
  'weather.backToSearch': 'Volver a Buscar',
  'weather.refresh': 'Actualizar',
  'weather.refreshing': 'Actualizando...',
  'weather.live': 'En vivo',
  'weather.lastUpdated': 'Última actualización:',
  'weather.noLocation': 'No se seleccionó ubicación. Busca una ciudad para ver el clima.',
  'weather.hourlyForecast': 'Pronóstico por hora',
  'weather.7dayForecast': 'Pronóstico de 7 días',
  'weather.feelsLike': 'Sensación térmica',
  'weather.humidity': 'Humedad',
  'weather.wind': 'Viento',
  'weather.pressure': 'Presión',
  'weather.cloudiness': 'Nubosidad',

  // Dashboard settings
  'dashboard.settings': 'Configuración del panel',
  'dashboard.showWidgets': 'Mostrar widgets',
  'dashboard.currentWeather': 'Clima actual',
  'dashboard.forecast': 'Pronóstico de 7 días',
  'dashboard.hourlyForecast': 'Pronóstico por hora',
  'dashboard.hourlyChart': 'Gráfico por hora',
  'dashboard.weatherAlerts': 'Alertas meteorológicas',
  'dashboard.whatToWear': 'Qué ponerse',
  'dashboard.sunriseSunset': 'Amanecer y atardecer',
  'dashboard.weatherMap': 'Mapa meteorológico',

  // Notifications
  'notifications.enable': 'Activar notificaciones',
  'notifications.enabled': 'Notificaciones activadas',
  'notifications.blocked': 'Notificaciones bloqueadas por el navegador',
  'notifications.notConfigured': 'Notificaciones push no configuradas',

  // Compare
  'compare.title': 'Comparar Clima',
  'compare.needCities': 'Necesitas al menos 2 ciudades en favoritos o búsquedas recientes para comparar el clima.',
  'compare.addCities': 'Busca ciudades y agrégalas a tus favoritos primero.',
  'compare.chooseCIty': 'Elige una ciudad...',
  'compare.5dayComparison': 'Comparación de temperatura de 5 días',

  // Favorites
  'favorites.title': 'Ciudades favoritas',

  // Footer
  'footer.dataProvider': 'Datos meteorológicos proporcionados por',
  'footer.builtWith': 'Construido con React, Vite y arquitectura Micro Frontend',

  // Language
  'language.label': 'Idioma',
  'language.en': 'English',
  'language.es': 'Español',
};

export const translations: Record<Locale, Record<TranslationKey, string>> = {
  en,
  es,
};
