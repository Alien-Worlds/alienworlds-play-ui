// Module stand-ins most missions component tests need. Use them as:
//   jest.mock('@alien-worlds/uikit', () => jest.requireActual('features/missions/testUtils/mocks').uikitMock)
//   jest.mock('shared/layouts', () => jest.requireActual('features/missions/testUtils/mocks').layoutsMock)
//   jest.mock('features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon', () =>
//     jest.requireActual('features/missions/testUtils/mocks').glossaryIconMock)

// The uikit button's styles break jsdom's selector engine once Chakra recomputes styles on mount.
export const uikitMock = {
  Button: ({ children, onClick, disabled, rightIcon, leftIcon }: any) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  ),
}

// The layouts barrel pulls in the top bar (and Overmind's main actions); the modal itself is real.
export const layoutsMock = {
  AppModal: jest.requireActual('shared/layouts/AppModal').default,
}

// The glossary store imports Overmind's main actions (and the Wharf wallets).
export const glossaryIconMock = {
  GlossaryInfoIcon: () => null,
}
