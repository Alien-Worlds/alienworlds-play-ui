import { render, screen } from '@testing-library/react'

import { WalletSelector } from './WalletSelector'

describe('WalletSelector', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('renders both wallet options', () => {
    render(<WalletSelector />)
    expect(screen.getByText('WCW')).toBeInTheDocument()
    expect(screen.getByText('WOMBAT')).toBeInTheDocument()
  })

  it('defaults to the wax wallet when nothing is stored', () => {
    render(<WalletSelector />)
    const wcwImg = screen.getByAltText('WCW')
    expect(wcwImg).toBeInTheDocument()
  })

  it('reflects the currently selected wallet from localStorage', () => {
    localStorage.setItem('aw_currentWallet', 'wombat')
    render(<WalletSelector />)

    expect(screen.getByText('WOMBAT')).toBeInTheDocument()
    expect(screen.getByText('WCW')).toBeInTheDocument()
  })
})
