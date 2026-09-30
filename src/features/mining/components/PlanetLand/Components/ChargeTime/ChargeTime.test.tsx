import { render, screen } from '@testing-library/react'
import { mockStore } from 'features/mining/testUtils/mockStore'

import { ChargeTime } from './ChargeTime'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)
jest.mock('features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon', () => ({
  GlossaryInfoIcon: () => null,
}))

const setup = (bagAssets: any, landAsset: any) => {
  mockStore({ state: { atomic: { bagAssets, landAsset } } })
  return render(<ChargeTime />)
}

describe('ChargeTime', () => {
  it('shows the charge time for the bag on the mining land', () => {
    setup([{ data: { delay: 100 } }], { data: { delay: 20 } })

    expect(screen.getByText('200s')).toBeInTheDocument()
  })

  it('renders nothing until the bag and land are loaded', () => {
    const { container } = setup(null, { data: { delay: 20 } })

    expect(container).toBeEmptyDOMElement()
  })
})
