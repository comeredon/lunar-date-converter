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
    expect(screen.getByLabelText('Month')).toBeInTheDocument()
    expect(screen.getByLabelText('Day')).toBeInTheDocument()
    expect(screen.getByLabelText('Year')).toBeInTheDocument()
  })

  it('renders language toggle', () => {
    render(<App />)
    
    expect(screen.getByRole('button', { name: /toggle language/i })).toBeInTheDocument()
  })
})