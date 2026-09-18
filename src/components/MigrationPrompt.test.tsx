import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Qso } from '../domain/qso'
import type { LogStore } from '../storage/logStore'
import MigrationPrompt from './MigrationPrompt'

const { useAuth, createLocalLogStore, migrateLog } = vi.hoisted(() => ({
  useAuth: vi.fn(),
  createLocalLogStore: vi.fn(),
  migrateLog: vi.fn(),
}))

vi.mock('../auth/AuthProvider', () => ({ useAuth }))
vi.mock('../storage/localLogStore', () => ({ createLocalLogStore }))
vi.mock('../storage/migrate', () => ({ migrateLog }))

const contact: Qso = {
  id: '1',
  call: 'W1AW',
  qsoDate: '20260918',
  timeOn: '1432',
  band: '20m',
  mode: 'FT8',
}

function localWith(qsos: Qso[]): LogStore {
  return {
    list: vi.fn().mockResolvedValue(qsos),
    put: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
    subscribe: vi.fn(() => () => {}),
  }
}

const cloud = localWith([])

beforeEach(() => {
  vi.clearAllMocks()
  useAuth.mockReturnValue({ status: 'signed-in' })
  createLocalLogStore.mockReturnValue(localWith([contact, { ...contact, id: '2' }]))
  migrateLog.mockResolvedValue({ moved: 2, skipped: 0 })
})

describe('MigrationPrompt', () => {
  it('offers to move a local log after signing in', async () => {
    render(<MigrationPrompt cloud={cloud} />)
    expect(await screen.findByText('You have 2 contacts logged on this device. Add them to your account?')).toBeInTheDocument()
  })

  it('moves them when the operator agrees', async () => {
    render(<MigrationPrompt cloud={cloud} />)
    await userEvent.click(await screen.findByRole('button', { name: 'Add to my account' }))

    expect(migrateLog).toHaveBeenCalled()
    expect(await screen.findByText('2 contacts added to your account')).toBeInTheDocument()
  })

  /**
   * Signing in on a borrowed device must not sweep the owner's contacts into
   * the visitor's account, which is why this asks instead of acting.
   */
  it('does nothing when the operator declines', async () => {
    render(<MigrationPrompt cloud={cloud} />)
    await userEvent.click(await screen.findByRole('button', { name: 'Keep on device' }))

    expect(migrateLog).not.toHaveBeenCalled()
    expect(screen.queryByText(/Add them to your account/)).not.toBeInTheDocument()
  })

  it('says nothing was lost when the move fails', async () => {
    migrateLog.mockRejectedValue(new Error('offline'))
    render(<MigrationPrompt cloud={cloud} />)

    await userEvent.click(await screen.findByRole('button', { name: 'Add to my account' }))
    expect(await screen.findByText('Could not add them, nothing was lost')).toBeInTheDocument()
  })

  it('stays out of the way with an empty local log', async () => {
    createLocalLogStore.mockReturnValue(localWith([]))
    const { container } = render(<MigrationPrompt cloud={cloud} />)
    await vi.waitFor(() => expect(container).toBeEmptyDOMElement())
  })

  it('stays out of the way for a guest', () => {
    useAuth.mockReturnValue({ status: 'guest' })
    const { container } = render(<MigrationPrompt cloud={cloud} />)
    expect(container).toBeEmptyDOMElement()
  })
})
