import { fireEvent, screen } from '@testing-library/react'
import { buildDaoDetails, buildWalletDaoDetails } from 'features/syndicates/testUtils/fixtures'
import { graphqlHooks, mockGraphql } from 'features/syndicates/testUtils/graphqlMock'
import { mockStore, renderSyndicates } from 'features/syndicates/testUtils/mockStore'
import { useGetMemberTerms } from 'shared/hooks/queries/wax/useGetMemberTerms'
import { useModalStore } from 'shared/store/modalStore'
import { useSessionStore } from 'shared/store/sessionStore'
import { SigningDACTermsState } from 'store/main/state'

import { PlanetMemberTerms } from './PlanetMemberTerms'

jest.mock('store', () => jest.requireActual('features/syndicates/testUtils/mockStore').storeMock)
jest.mock(
  'graphql/hooks/useDaoDetails',
  () => jest.requireActual('features/syndicates/testUtils/graphqlMock').modules.useDaoDetails
)
jest.mock(
  'graphql/hooks/useWalletDaoDetails',
  () => jest.requireActual('features/syndicates/testUtils/graphqlMock').modules.useWalletDaoDetails
)
jest.mock(
  '@alien-worlds/uikit',
  () => jest.requireActual('features/syndicates/testUtils/mocks').uikitMock
)
jest.mock(
  'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon',
  () => jest.requireActual('features/syndicates/testUtils/mocks').glossaryIconMock
)
jest.mock(
  'react-markdown',
  () => jest.requireActual('features/syndicates/testUtils/mocks').reactMarkdownMock
)
jest.mock('shared/hooks/queries/wax/useGetMemberTerms', () => ({ useGetMemberTerms: jest.fn() }))

const mockUseGetMemberTerms = useGetMemberTerms as jest.Mock

const setup = ({
  signingDACTermsState = SigningDACTermsState.Unknown,
  selectedDacId = 'kavian',
} = {}) => {
  const wax = { signPlanetMemberTerms: jest.fn() }
  const main = { showGovernanceMemberTerms: jest.fn() }
  mockStore({
    state: { wax: { selectedDacId }, main: { signingDACTermsState } },
    actions: { wax, main },
  })
  renderSyndicates(<PlanetMemberTerms />, {
    at: '/syndicates/kavian/memberterms',
    path: '/syndicates/:planetId/memberterms',
  })
  return { ...wax, ...main }
}

beforeEach(() => {
  useSessionStore.setState({ walletId: 'voter.wam', isDemoUser: false })
  useModalStore.getState().resetAllPrimaryModals()
  mockUseGetMemberTerms.mockReturnValue({ data: 'Be excellent to each other.' })
  mockGraphql({
    daoDetails: buildDaoDetails({ member_terms: { version: 3, terms: 'ipfs://kavian-terms' } }),
    walletDaoDetails: buildWalletDaoDetails({ agreed_terms_version: 2 }),
  })
})

describe('PlanetMemberTerms', () => {
  it('reports the visit for the planet in the URL', () => {
    const { showGovernanceMemberTerms } = setup()

    expect(showGovernanceMemberTerms).toHaveBeenCalledWith('kavian')
  })

  it("shows the selected planet's current terms", () => {
    setup()

    expect(graphqlHooks.useDaoDetails).toHaveBeenLastCalledWith('kavian')
    expect(graphqlHooks.useWalletDaoDetails).toHaveBeenLastCalledWith({
      dacId: 'kavian',
      walletId: 'voter.wam',
    })
    expect(mockUseGetMemberTerms).toHaveBeenLastCalledWith('ipfs://kavian-terms')
    expect(screen.getByText('Version 3')).toBeInTheDocument()
    expect(screen.getByTestId('markdown')).toHaveTextContent('Be excellent to each other.')
  })

  it('signs the terms of the selected planet', () => {
    const { signPlanetMemberTerms } = setup({ selectedDacId: 'magor' })

    fireEvent.click(screen.getByRole('button', { name: 'Sign Member Terms' }))

    expect(signPlanetMemberTerms).toHaveBeenCalledWith('magor')
  })

  it('asks a demo user to log in instead', () => {
    useSessionStore.setState({ isDemoUser: true })
    const { signPlanetMemberTerms } = setup()

    fireEvent.click(screen.getByRole('button', { name: 'Sign Member Terms' }))

    expect(signPlanetMemberTerms).not.toHaveBeenCalled()
    expect(useModalStore.getState().primaryModals.LoginModal).toBe(true)
  })

  it('shows the signing state from main.signingDACTermsState', () => {
    setup({ signingDACTermsState: SigningDACTermsState.Signing })

    expect(screen.getByRole('button', { name: 'Signing Member Terms..' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sign Member Terms' })).not.toBeInTheDocument()
  })

  it('shows the terms as signed when the wallet agreed to the current version', () => {
    mockGraphql({
      daoDetails: buildDaoDetails({ member_terms: { version: 3 } }),
      walletDaoDetails: buildWalletDaoDetails({ agreed_terms_version: 3 }),
    })
    setup()

    expect(screen.getByRole('button', { name: 'Member Terms signed' })).toBeInTheDocument()
  })
})
