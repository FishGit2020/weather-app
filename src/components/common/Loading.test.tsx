import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import Loading from './Loading'

describe('Loading', () => {
  it('renders a loading spinner', () => {
    render(<Loading />)
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('has correct styling classes', () => {
    render(<Loading />)
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toHaveClass('rounded-full', 'h-12', 'w-12', 'border-b-2', 'border-blue-500')
  })
})
