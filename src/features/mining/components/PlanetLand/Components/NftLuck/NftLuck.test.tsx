import { render, screen } from '@testing-library/react'
import { mockStore } from 'features/mining/testUtils/mockStore'

import { NftLuck } from './NftLuck'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)
jest.mock('features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon', () => ({
  GlossaryInfoIcon: () => null,
}))

describe('NftLuck', () => {
  it('shows the value for the bag on the mining land', () => {
    mockStore({
      state: {
        atomic: {
          bagAssets: [
            { schema: { schema_name: 'tool.worlds' }, data: { luck: 20, rarity: 'Rare' } },
          ],
          landAsset: { data: { luck: 12 } },
        },
      },
    })

    render(<NftLuck />)

    expect(screen.getByText('2.40')).toBeInTheDocument()
  })
})
