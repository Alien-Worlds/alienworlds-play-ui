import { renderHook, waitFor } from '@testing-library/react'

import { useGetTemplatesByIds } from './useGetTemplatesByIds'
import { createQueryWrapper } from '../testUtils'

const mockGetTemplatesByIds = jest.fn()
jest.mock('shared/util/atomicassets', () => ({
  getTemplatesByIds: (ids: string[]) => mockGetTemplatesByIds(ids),
}))

describe('useGetTemplatesByIds', () => {
  beforeEach(() => mockGetTemplatesByIds.mockReset().mockResolvedValue([{ template_id: '10' }]))

  it('loads the templates for the comma-separated ids', async () => {
    const { wrapper } = createQueryWrapper()
    const { result } = renderHook(() => useGetTemplatesByIds('10,20'), { wrapper })

    await waitFor(() => expect(result.current.data).toEqual([{ template_id: '10' }]))
    expect(mockGetTemplatesByIds).toHaveBeenCalledWith(['10', '20'])
  })

  it('waits until there are ids', () => {
    const { wrapper } = createQueryWrapper()
    renderHook(() => useGetTemplatesByIds(''), { wrapper })

    expect(mockGetTemplatesByIds).not.toHaveBeenCalled()
  })
})
