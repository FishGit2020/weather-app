import { describe, it, expect } from 'vitest'
import { getWeatherIconUrl, getWindDirection, getWeatherDescription } from './weatherHelpers'

describe('weatherHelpers', () => {
  describe('getWeatherIconUrl', () => {
    it('returns correct URL for icon code', () => {
      expect(getWeatherIconUrl('01d')).toBe('https://openweathermap.org/img/wn/01d@2x.png')
    })

    it('handles different icon codes', () => {
      expect(getWeatherIconUrl('10n')).toBe('https://openweathermap.org/img/wn/10n@2x.png')
      expect(getWeatherIconUrl('04d')).toBe('https://openweathermap.org/img/wn/04d@2x.png')
    })
  })

  describe('getWindDirection', () => {
    it('returns N for 0 degrees', () => {
      expect(getWindDirection(0)).toBe('N')
    })

    it('returns NE for 45 degrees', () => {
      expect(getWindDirection(45)).toBe('NE')
    })

    it('returns E for 90 degrees', () => {
      expect(getWindDirection(90)).toBe('E')
    })

    it('returns S for 180 degrees', () => {
      expect(getWindDirection(180)).toBe('S')
    })

    it('returns W for 270 degrees', () => {
      expect(getWindDirection(270)).toBe('W')
    })

    it('wraps around for 360 degrees', () => {
      expect(getWindDirection(360)).toBe('N')
    })

    it('handles intermediate degrees', () => {
      expect(getWindDirection(135)).toBe('SE')
      expect(getWindDirection(225)).toBe('SW')
      expect(getWindDirection(315)).toBe('NW')
    })
  })

  describe('getWeatherDescription', () => {
    it('returns correct colors for Clear weather', () => {
      const result = getWeatherDescription('Clear')
      expect(result.color).toBe('text-yellow-600')
      expect(result.bgColor).toBe('bg-yellow-100')
    })

    it('returns correct colors for Rain weather', () => {
      const result = getWeatherDescription('Rain')
      expect(result.color).toBe('text-blue-600')
      expect(result.bgColor).toBe('bg-blue-100')
    })

    it('returns correct colors for Clouds weather', () => {
      const result = getWeatherDescription('Clouds')
      expect(result.color).toBe('text-gray-600')
      expect(result.bgColor).toBe('bg-gray-100')
    })

    it('returns default colors for unknown weather', () => {
      const result = getWeatherDescription('Unknown')
      expect(result.color).toBe('text-gray-600')
      expect(result.bgColor).toBe('bg-gray-100')
    })

    it('returns correct colors for Thunderstorm weather', () => {
      const result = getWeatherDescription('Thunderstorm')
      expect(result.color).toBe('text-purple-600')
      expect(result.bgColor).toBe('bg-purple-100')
    })

    it('returns correct colors for Snow weather', () => {
      const result = getWeatherDescription('Snow')
      expect(result.color).toBe('text-cyan-600')
      expect(result.bgColor).toBe('bg-cyan-100')
    })
  })
})
