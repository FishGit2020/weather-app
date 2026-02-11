import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import WeatherIcon from './WeatherIcon'

describe('WeatherIcon', () => {
  it('renders an image with correct alt text', () => {
    render(<WeatherIcon code="01d" />)
    const img = screen.getByAltText('Weather icon')
    expect(img).toBeInTheDocument()
  })

  it('uses medium size by default', () => {
    render(<WeatherIcon code="01d" />)
    const img = screen.getByAltText('Weather icon')
    expect(img).toHaveClass('w-16', 'h-16')
  })

  it('applies small size class when specified', () => {
    render(<WeatherIcon code="01d" size="small" />)
    const img = screen.getByAltText('Weather icon')
    expect(img).toHaveClass('w-12', 'h-12')
  })

  it('applies large size class when specified', () => {
    render(<WeatherIcon code="01d" size="large" />)
    const img = screen.getByAltText('Weather icon')
    expect(img).toHaveClass('w-24', 'h-24')
  })

  it('generates correct icon URL', () => {
    render(<WeatherIcon code="10d" />)
    const img = screen.getByAltText('Weather icon') as HTMLImageElement
    expect(img.src).toContain('10d')
  })
})
