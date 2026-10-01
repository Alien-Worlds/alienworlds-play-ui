import { render, screen } from '@testing-library/react'
import { mockStore } from 'features/mining/testUtils/mockStore'

import { PowReduction } from './PowReduction'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)
jest.mock('features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon', () => ({
  GlossaryInfoIcon: () => null,
}))

describe('PowReduction', () => {
  it('shows the value for the bag on the mining land', () => {
    mockStore({
      state: {
        atomic: {
          bagAssets: [{ schema: { schema_name: 'tool.worlds' }, data: { difficulty: 2 } }],
          landAsset: { data: { difficulty: 1 } },
        },
      },
    })

    render(<PowReduction />)

    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
