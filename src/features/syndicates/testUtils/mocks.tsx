// Module stand-ins the syndicates component tests share. Use them as, e.g.:
//   jest.mock('@alien-worlds/uikit', () =>
//     jest.requireActual('features/syndicates/testUtils/mocks').uikitMock)
// The jest.fn()s here lose their implementation before every test (CRA's resetMocks), so they
// only record calls.

// The uikit button's styles break jsdom's selector engine once Chakra recomputes styles on mount.
// Like the real one it sets no `type`, so a button inside a form submits it. FormField needs a
// Formik field context; a plain input is enough to drive the amount the component keeps in state.
export const uikitMock = {
  ...jest.requireActual('@alien-worlds/uikit'),
  Button: ({ children, onClick, isDisabled, disabled, type, leftIcon, rightIcon }: any) => (
    // eslint-disable-next-line react/button-has-type
    <button type={type} onClick={onClick} disabled={Boolean(isDisabled || disabled)}>
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  ),
  // PlaceRing keys its parts with a bundled uuid that needs crypto.getRandomValues.
  PlaceRing: ({ src }: any) => <img alt="place ring" src={src} />,
  FormField: ({ name, placeholder, value, onChange, disabled, type }: any) => (
    <input
      aria-label={name}
      name={name}
      type={type === 'number' ? 'number' : 'text'}
      placeholder={placeholder}
      value={value ?? ''}
      onChange={onChange}
      disabled={disabled}
    />
  ),
}

// The glossary store imports Overmind's main actions (and the Wharf wallets).
export const glossaryIconMock = {
  GlossaryInfoIcon: () => null,
}

// A planet button per DAO id, so tests can click "planet kavian".
export const planetImageMock = {
  PlanetImage: ({ dacId, onClick }: any) => (
    <button type="button" aria-label={`planet ${dacId}`} onClick={onClick} />
  ),
}

export const mockApolloClient = { refetchQueries: jest.fn() }

// The components only use the client to refetch after a transaction; the queries stay real.
export const apolloMock = {
  ...jest.requireActual('@apollo/client'),
  useApolloClient: () => mockApolloClient,
}

// react-select as a native select, labelled by its placeholder.
export const reactSelectMock = {
  __esModule: true,
  default: ({ options = [], value, onChange, placeholder }: any) => (
    <select
      aria-label={placeholder}
      value={value?.value ?? ''}
      onChange={({ target }) =>
        onChange(options.find((option: any) => String(option.value) === target.value))
      }
    >
      <option value="">-</option>
      {options.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}

// react-markdown is ESM-only, which CRA's Jest doesn't transform.
export const reactMarkdownMock = {
  __esModule: true,
  default: ({ children }: any) => <div data-testid="markdown">{children}</div>,
}

// Chakra's Slider measures its thumb with ResizeObserver, which jsdom doesn't have.
export const stubResizeObserver = () => {
  window.ResizeObserver = class {
    observe() {}

    unobserve() {}

    disconnect() {}
  } as any
}

// The 3D carousel animates with react-spring; the slides are enough.
export const carouselMock = {
  __esModule: true,
  default: ({ slides }: any) => (
    <div>
      {slides.map((slide: any) => (
        <div key={slide.key}>{slide.content}</div>
      ))}
    </div>
  ),
}
