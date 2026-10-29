import { render, screen } from '@testing-library/react'
import { Colors } from 'shared/util/colors'

import { getColorsBySupply, getSupplyLeft, NftOfferSupplyBadge } from './NftOfferSupplyBadge'

jest.mock('@alien-worlds/icons', () => ({
  InfinityIcon: () => <span data-testid="infinity" />,
}))

describe('getSupplyLeft', () => {
  it('is the max supply minus what has been issued', () => {
    expect(getSupplyLeft('30', '100')).toBe(70)
  })
})

describe('getColorsBySupply', () => {
  it.each([
    [120, Colors.AQUA],
    [50, Colors.AQUA],
    [49, Colors.ROBINS_EGG_BLUE],
    [40, Colors.ROBINS_EGG_BLUE],
    [39, Colors.INCH_WORM],
    [30, Colors.INCH_WORM],
    [29, Colors.SCHOOL_BUS_YELLOW],
    [20, Colors.SCHOOL_BUS_YELLOW],
    [19, Colors.TANGERINE],
    [10, Colors.TANGERINE],
    [9, Colors.RADICAL_RED],
    [1, Colors.RADICAL_RED],
  ])('borders %i left with its supply colour', (supplyLeft, borderColor) => {
    expect(getColorsBySupply(supplyLeft, '200')).toEqual({
      borderColor,
      bgColor: Colors.MINE_SHAFT,
    })
  })

  it('fills a sold-out offer red', () => {
    expect(getColorsBySupply(0, '200')).toEqual({
      borderColor: Colors.MINE_SHAFT,
      bgColor: Colors.RADICAL_RED,
    })
  })

  it('borders an unlimited offer (max supply 0) white', () => {
    expect(getColorsBySupply(0, '0').borderColor).toBe(Colors.SNOW_WHITE)
  })
})

describe('NftOfferSupplyBadge', () => {
  it('shows how many are left', () => {
    render(<NftOfferSupplyBadge maxSupply="100" issuedSupply="58" />)
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('remaining')).toBeInTheDocument()
  })

  it('caps the count at 99+', () => {
    render(<NftOfferSupplyBadge maxSupply="500" issuedSupply="10" />)
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('shows infinity for an unlimited offer', () => {
    render(<NftOfferSupplyBadge maxSupply="0" issuedSupply="10" />)
    expect(screen.getByTestId('infinity')).toBeInTheDocument()
    expect(screen.queryByText('remaining')).not.toBeInTheDocument()
  })
})
