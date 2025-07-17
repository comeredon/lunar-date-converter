import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../App'

describe('App', () => {
  it('renders the application title', () => {
    render(<App />)
    
    expect(screen.getByText('Chinese Lunar Calendar Converter')).toBeInTheDocument()
  })

  it('renders the conversion form', () => {
    render(<App />)
    
    expect(screen.getByText('Date Conversion')).toBeInTheDocument()
    expect(screen.getByText('Lunar Month')).toBeInTheDocument()
    expect(screen.getByText('Lunar Day')).toBeInTheDocument()
    expect(screen.getByText('Gregorian Year')).toBeInTheDocument()
  })

  it('renders language toggle buttons', () => {
    render(<App />)
    
    expect(screen.getByRole('button', { name: /EN/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /CN/i })).toBeInTheDocument()
  })
})