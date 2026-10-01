import { render, screen } from '@testing-library/react'
import { mockStore } from 'features/mining/testUtils/mockStore'

import { MiningPower } from './MiningPower'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)
jest.mock('features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon', () => ({
  GlossaryInfoIcon: () => null,
}))

describe('MiningPower', () => {
  it('shows the value for the bag on the mining land', () => {
    mockStore({
      state: {
        atomic: {
          bagAssets: [{ schema: { schema_name: 'tool.worlds' }, data: { ease: 30 } }],
          landAsset: { data: { ease: 15 } },
        },
      },
    })

    render(<MiningPower />)

    expect(screen.getByText('4.50%')).toBeInTheDocument()
  })
})
