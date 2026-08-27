import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ArenaSelect } from './ArenaSelect'

const options = [
  { label: 'All', value: 'All' },
  { label: 'Racing', value: 'Racing' },
]

describe('ArenaSelect', () => {
  it('defaults to the first option', () => {
    render(<ArenaSelect options={options} onChange={jest.fn()} />)

    expect(screen.getByText('All')).toBeInTheDocument()
  })

  it('calls onChange with the selected option value', async () => {
    const onChange = jest.fn()
    render(<ArenaSelect options={options} onChange={onChange} />)

    await userEvent.click(screen.getByText('All'))
    await userEvent.click(await screen.findByText('Racing'))

    expect(onChange).toHaveBeenCalledWith('Racing')
  })
})
