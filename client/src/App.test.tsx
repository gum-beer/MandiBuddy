import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App.tsx'
import { comparison, features } from './features/homepage/content.ts'

describe('homepage', () => {
  it('renders every feature from the content file', () => {
    render(<App />)
    for (const feature of features) {
      expect(screen.getByRole('heading', { name: feature.title })).toBeInTheDocument()
    }
  })

  it('links the nav to sections that exist on the page', () => {
    render(<App />)
    for (const id of ['features', 'about']) {
      const link = screen.getByRole('link', { name: new RegExp(id, 'i') })
      expect(link).toHaveAttribute('href', `#${id}`)
      expect(document.getElementById(id)).not.toBeNull()
    }
  })

  it('renders one comparison row per entry', () => {
    render(<App />)
    // +1 for the header row.
    expect(screen.getAllByRole('row')).toHaveLength(comparison.length + 1)
  })
})
