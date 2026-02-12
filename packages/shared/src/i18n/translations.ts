export type Locale = 'en' | 'es';

export type TranslationKey = keyof typeof en;

const en = {
  // Navigation
  'nav.home': 'Home',
  'nav.compare': 'Compare',
  'nav.skipToContent': 'Skip to content',

  // Home page
  'home.title': 'Find Weather for Any City',
  'home.subtitle': 'Search for a city to get current weather conditions, forecasts, and more.',
  'home.orSearchBelow': 'or search below',

  // Search
  'search.placeholder': 'Search for a city...',
  'search.noResults': 'No cities found',
  'search.noResultsHint': 'Try a different search term',
  'search.recentSearches': 'Recent Searches',
  'search.popularCities': 'Popular Cities',
  'search.useMyLocation': 'Use my current location',
  'search.gettingLocation': 'Getting location...',
  'search.geolocationNotSupported': 'Geolocation not supported',
  'search.locationPermissionDenied': 'Location permission denied',
  'search.locationUnavailable': 'Location unavailable',
  'search.locationTimeout': 'Location request timed out',
  'search.unableToGetLocation': 'Unable to get location',
  'search.couldNotDetermineLocation': 'Could not determine location',
  'search.failedToLookUp': 'Failed to look up location',
  'search.removeFromRecent': 'Remove from recent searches',
  'search.suggestedCities': 'Did you mean?',

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
  'weather.today': 'Today',
  'weather.now': 'Now',
  'weather.rain': 'rain',
  'weather.sunVisibility': 'Sun & Visibility',
  'weather.sunrise': 'Sunrise',
  'weather.daylight': 'Daylight',
  'weather.sunset': 'Sunset',
  'weather.visibility': 'Visibility',
  'weather.whatToWear': 'What to Wear',
  'weather.refreshData': 'Refresh weather data',

  // Dashboard settings
  'dashboard.settings': 'Dashboard settings',
  'dashboard.customizeWidgets': 'Customize dashboard widgets',
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
  'notifications.alreadyEnabled': 'Notifications already enabled',
  'notifications.blocked': 'Notifications blocked by browser',
  'notifications.notConfigured': 'Push notifications not configured',
  'notifications.failedToEnable': 'Failed to enable notifications',

  // Compare
  'compare.title': 'Compare Weather',
  'compare.needCities': 'You need at least 2 cities in your favorites or recent searches to compare weather.',
  'compare.addCities': 'Search for cities and add them to your favorites first.',
  'compare.chooseCity': 'Choose a city...',
  'compare.5dayComparison': '5-Day Temperature Comparison',
  'compare.selectCity': 'Select',
  'compare.cityA': 'City A',
  'compare.cityB': 'City B',
  'compare.chartHighLow': 'Solid: High \u00B7 Dashed: Low',

  // Favorites
  'favorites.title': 'Favorite Cities',
  'favorites.favorited': 'Favorited',
  'favorites.favorite': 'Favorite',
  'favorites.removeFromFavorites': 'Remove from favorites',
  'favorites.addToFavorites': 'Add to favorites',

  // Share
  'share.share': 'Share',
  'share.copied': 'Copied!',
  'share.image': 'Image',
  'share.saving': 'Saving...',
  'share.shareLink': 'Share link',
  'share.saveAsImage': 'Save as image',

  // Auth
  'auth.signIn': 'Sign In',
  'auth.signOut': 'Sign Out',

  // Errors
  'error.somethingWentWrong': 'Something went wrong',
  'error.failedToLoadMFE': 'Failed to load micro frontend',
  'error.tryAgain': 'Try Again',
  'error.geolocationNotSupported': 'Geolocation is not supported by your browser',
  'error.locationPermissionDenied': 'Location permission denied. Please enable location access.',
  'error.locationUnavailable': 'Location information unavailable',
  'error.locationTimeout': 'Location request timed out',
  'error.unableToGetLocation': 'Unable to get your location',
  'error.couldNotDetermineLocation': 'Could not determine your location name',

  // App-level
  'app.offline': "You're offline \u2014 showing cached data",
  'app.pageNotFound': 'Page not found',

  // Weather alerts
  'alert.extremeHeat': 'Extreme Heat',
  'alert.heatAdvisory': 'Heat Advisory',
  'alert.extremeCold': 'Extreme Cold',
  'alert.coldAdvisory': 'Cold Advisory',
  'alert.highWindWarning': 'High Wind Warning',
  'alert.windAdvisory': 'Wind Advisory',
  'alert.thunderstorm': 'Thunderstorm',
  'alert.rainExpected': 'Rain Expected',
  'alert.lowVisibility': 'Low Visibility',

  // Clothing suggestion categories
  'wear.catTops': 'Tops',
  'wear.catBottoms': 'Bottoms',
  'wear.catFootwear': 'Footwear',
  'wear.catAccessories': 'Accessories',
  'wear.catProtection': 'Protection',
  'wear.catTips': 'Tips',

  // Clothing suggestions — tops
  'wear.heavyWinterCoat': 'Heavy winter coat',
  'wear.thermalBaseLayer': 'Thermal base layer',
  'wear.fleeceMiddleLayer': 'Fleece mid-layer',
  'wear.winterCoat': 'Winter coat',
  'wear.warmJacket': 'Warm jacket',
  'wear.layeredTop': 'Layered top (shirt + sweater)',
  'wear.lightJacketSweater': 'Light jacket or sweater',
  'wear.longSleeveShirt': 'Long-sleeve shirt',
  'wear.tshirtLightShirt': 'T-shirt or light shirt',
  'wear.lightBreathable': 'Light, breathable clothing',
  'wear.tankTopSleeveless': 'Tank top or sleeveless',
  'wear.minimalLight': 'Minimal, light clothing',
  'wear.uvProtectiveShirt': 'UV-protective shirt',

  // Clothing suggestions — bottoms
  'wear.insulatedPants': 'Insulated pants',
  'wear.thermalLeggings': 'Thermal leggings',
  'wear.longPants': 'Long pants',
  'wear.jeansPants': 'Jeans or pants',
  'wear.lightPantsJeans': 'Light pants or jeans',
  'wear.shorts': 'Shorts',
  'wear.lightLinenPants': 'Light linen pants',

  // Clothing suggestions — footwear
  'wear.winterBoots': 'Winter boots',
  'wear.woolSocks': 'Wool socks',
  'wear.closedShoes': 'Closed shoes',
  'wear.sneakers': 'Sneakers',
  'wear.openShoesSandals': 'Sandals or open shoes',
  'wear.waterproofShoes': 'Waterproof shoes',
  'wear.waterproofBoots': 'Waterproof boots',

  // Clothing suggestions — accessories
  'wear.insulatedGloves': 'Insulated gloves',
  'wear.scarfWarmHat': 'Scarf & warm hat',
  'wear.faceCovering': 'Face covering for wind',
  'wear.gloves': 'Gloves',
  'wear.scarf': 'Scarf',
  'wear.warmHat': 'Warm hat',
  'wear.lightScarf': 'Light scarf',
  'wear.beanie': 'Beanie',
  'wear.sunglasses': 'Sunglasses',
  'wear.hatSunProtection': 'Wide-brim sun hat',
  'wear.snowGoggles': 'Snow goggles',

  // Clothing suggestions — protection
  'wear.umbrella': 'Umbrella',
  'wear.waterproofJacket': 'Waterproof jacket',
  'wear.waterproofPants': 'Waterproof pants',
  'wear.windbreaker': 'Windbreaker',
  'wear.sunscreen': 'Sunscreen (SPF 30+)',

  // Clothing suggestions — tips
  'wear.moistureWicking': 'Moisture-wicking fabrics',
  'wear.looseFittingClothes': 'Loose-fitting clothes',
  'wear.cottonOrLinen': 'Cotton or linen fabrics',
  'wear.brightReflective': 'Bright or reflective clothing',
  'wear.waterBottle': 'Carry a water bottle',
  'wear.coolingTowel': 'Cooling towel',
  'wear.secureFittingClothes': 'Secure, close-fitting clothes',
  'wear.dressInLayers': 'Dress in layers',

  // MFE labels
  'mfe.citySearch': 'City Search Micro Frontend',
  'mfe.weatherDisplay': 'Weather Display Micro Frontend',

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

  // Home page
  'home.title': 'Encuentra el clima de cualquier ciudad',
  'home.subtitle': 'Busca una ciudad para obtener condiciones climáticas actuales, pronósticos y más.',
  'home.orSearchBelow': 'o busca abajo',

  // Search
  'search.placeholder': 'Buscar una ciudad...',
  'search.noResults': 'No se encontraron ciudades',
  'search.noResultsHint': 'Prueba con otro término de búsqueda',
  'search.recentSearches': 'Búsquedas recientes',
  'search.popularCities': 'Ciudades populares',
  'search.useMyLocation': 'Usar mi ubicación actual',
  'search.gettingLocation': 'Obteniendo ubicación...',
  'search.geolocationNotSupported': 'Geolocalización no soportada',
  'search.locationPermissionDenied': 'Permiso de ubicación denegado',
  'search.locationUnavailable': 'Ubicación no disponible',
  'search.locationTimeout': 'Solicitud de ubicación expiró',
  'search.unableToGetLocation': 'No se pudo obtener ubicación',
  'search.couldNotDetermineLocation': 'No se pudo determinar la ubicación',
  'search.failedToLookUp': 'Error al buscar ubicación',
  'search.removeFromRecent': 'Quitar de búsquedas recientes',
  'search.suggestedCities': '¿Quisiste decir?',

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
  'weather.today': 'Hoy',
  'weather.now': 'Ahora',
  'weather.rain': 'lluvia',
  'weather.sunVisibility': 'Sol y visibilidad',
  'weather.sunrise': 'Amanecer',
  'weather.daylight': 'Luz del día',
  'weather.sunset': 'Atardecer',
  'weather.visibility': 'Visibilidad',
  'weather.whatToWear': 'Qué ponerse',
  'weather.refreshData': 'Actualizar datos del clima',

  // Dashboard settings
  'dashboard.settings': 'Configuración del panel',
  'dashboard.customizeWidgets': 'Personalizar widgets del panel',
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
  'notifications.alreadyEnabled': 'Notificaciones ya activadas',
  'notifications.blocked': 'Notificaciones bloqueadas por el navegador',
  'notifications.notConfigured': 'Notificaciones push no configuradas',
  'notifications.failedToEnable': 'Error al activar notificaciones',

  // Compare
  'compare.title': 'Comparar Clima',
  'compare.needCities': 'Necesitas al menos 2 ciudades en favoritos o búsquedas recientes para comparar el clima.',
  'compare.addCities': 'Busca ciudades y agrégalas a tus favoritos primero.',
  'compare.chooseCity': 'Elige una ciudad...',
  'compare.5dayComparison': 'Comparación de temperatura de 5 días',
  'compare.selectCity': 'Seleccionar',
  'compare.cityA': 'Ciudad A',
  'compare.cityB': 'Ciudad B',
  'compare.chartHighLow': 'Sólido: Máxima \u00B7 Punteado: Mínima',

  // Favorites
  'favorites.title': 'Ciudades favoritas',
  'favorites.favorited': 'Favorito',
  'favorites.favorite': 'Favorito',
  'favorites.removeFromFavorites': 'Quitar de favoritos',
  'favorites.addToFavorites': 'Agregar a favoritos',

  // Share
  'share.share': 'Compartir',
  'share.copied': '¡Copiado!',
  'share.image': 'Imagen',
  'share.saving': 'Guardando...',
  'share.shareLink': 'Compartir enlace',
  'share.saveAsImage': 'Guardar como imagen',

  // Auth
  'auth.signIn': 'Iniciar sesión',
  'auth.signOut': 'Cerrar sesión',

  // Errors
  'error.somethingWentWrong': 'Algo salió mal',
  'error.failedToLoadMFE': 'Error al cargar micro frontend',
  'error.tryAgain': 'Intentar de nuevo',
  'error.geolocationNotSupported': 'Tu navegador no soporta geolocalización',
  'error.locationPermissionDenied': 'Permiso de ubicación denegado. Habilita el acceso a la ubicación.',
  'error.locationUnavailable': 'Información de ubicación no disponible',
  'error.locationTimeout': 'La solicitud de ubicación expiró',
  'error.unableToGetLocation': 'No se pudo obtener tu ubicación',
  'error.couldNotDetermineLocation': 'No se pudo determinar el nombre de tu ubicación',

  // App-level
  'app.offline': 'Estás sin conexión \u2014 mostrando datos en caché',
  'app.pageNotFound': 'Página no encontrada',

  // Weather alerts
  'alert.extremeHeat': 'Calor extremo',
  'alert.heatAdvisory': 'Aviso de calor',
  'alert.extremeCold': 'Frío extremo',
  'alert.coldAdvisory': 'Aviso de frío',
  'alert.highWindWarning': 'Alerta de viento fuerte',
  'alert.windAdvisory': 'Aviso de viento',
  'alert.thunderstorm': 'Tormenta eléctrica',
  'alert.rainExpected': 'Lluvia esperada',
  'alert.lowVisibility': 'Baja visibilidad',

  // Clothing suggestion categories
  'wear.catTops': 'Parte superior',
  'wear.catBottoms': 'Parte inferior',
  'wear.catFootwear': 'Calzado',
  'wear.catAccessories': 'Accesorios',
  'wear.catProtection': 'Protección',
  'wear.catTips': 'Consejos',

  // Clothing suggestions — tops
  'wear.heavyWinterCoat': 'Abrigo de invierno pesado',
  'wear.thermalBaseLayer': 'Capa base térmica',
  'wear.fleeceMiddleLayer': 'Capa intermedia de polar',
  'wear.winterCoat': 'Abrigo de invierno',
  'wear.warmJacket': 'Chaqueta abrigada',
  'wear.layeredTop': 'Capas (camisa + suéter)',
  'wear.lightJacketSweater': 'Chaqueta ligera o suéter',
  'wear.longSleeveShirt': 'Camisa de manga larga',
  'wear.tshirtLightShirt': 'Camiseta o camisa ligera',
  'wear.lightBreathable': 'Ropa ligera y transpirable',
  'wear.tankTopSleeveless': 'Camiseta sin mangas',
  'wear.minimalLight': 'Ropa mínima y ligera',
  'wear.uvProtectiveShirt': 'Camisa con protección UV',

  // Clothing suggestions — bottoms
  'wear.insulatedPants': 'Pantalones aislados',
  'wear.thermalLeggings': 'Leggings térmicos',
  'wear.longPants': 'Pantalones largos',
  'wear.jeansPants': 'Jeans o pantalones',
  'wear.lightPantsJeans': 'Pantalones ligeros o jeans',
  'wear.shorts': 'Pantalones cortos',
  'wear.lightLinenPants': 'Pantalones de lino ligeros',

  // Clothing suggestions — footwear
  'wear.winterBoots': 'Botas de invierno',
  'wear.woolSocks': 'Calcetines de lana',
  'wear.closedShoes': 'Zapatos cerrados',
  'wear.sneakers': 'Zapatillas deportivas',
  'wear.openShoesSandals': 'Sandalias o zapatos abiertos',
  'wear.waterproofShoes': 'Zapatos impermeables',
  'wear.waterproofBoots': 'Botas impermeables',

  // Clothing suggestions — accessories
  'wear.insulatedGloves': 'Guantes aislados',
  'wear.scarfWarmHat': 'Bufanda y gorro cálido',
  'wear.faceCovering': 'Protección facial contra el viento',
  'wear.gloves': 'Guantes',
  'wear.scarf': 'Bufanda',
  'wear.warmHat': 'Gorro cálido',
  'wear.lightScarf': 'Bufanda ligera',
  'wear.beanie': 'Gorro de lana',
  'wear.sunglasses': 'Gafas de sol',
  'wear.hatSunProtection': 'Sombrero de ala ancha',
  'wear.snowGoggles': 'Gafas de nieve',

  // Clothing suggestions — protection
  'wear.umbrella': 'Paraguas',
  'wear.waterproofJacket': 'Chaqueta impermeable',
  'wear.waterproofPants': 'Pantalones impermeables',
  'wear.windbreaker': 'Cortavientos',
  'wear.sunscreen': 'Protector solar (FPS 30+)',

  // Clothing suggestions — tips
  'wear.moistureWicking': 'Telas que absorben humedad',
  'wear.looseFittingClothes': 'Ropa holgada',
  'wear.cottonOrLinen': 'Telas de algodón o lino',
  'wear.brightReflective': 'Ropa brillante o reflectante',
  'wear.waterBottle': 'Llevar botella de agua',
  'wear.coolingTowel': 'Toalla refrescante',
  'wear.secureFittingClothes': 'Ropa ajustada y segura',
  'wear.dressInLayers': 'Vestirse en capas',

  // MFE labels
  'mfe.citySearch': 'Micro Frontend de Búsqueda de Ciudades',
  'mfe.weatherDisplay': 'Micro Frontend de Visualización del Clima',

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
