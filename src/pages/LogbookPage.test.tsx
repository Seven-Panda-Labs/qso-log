import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthProvider'
import { ThemeProvider } from '../theme/ThemeProvider'
import LogbookPage from './LogbookPage'

/**
 * These go through the real IndexedDB store, so they cover the path an
 * operator actually takes: type a contact, see it in the log, edit it, remove
 * it. Only the database name is faked, per test, to keep them isolated.
 */
vi.mock('../storage/localLogStore', async () => {
  const actual = await vi.importActual<typeof import('../storage/localLogStore')>(
    '../storage/localLogStore',
  )
  return {
    createLocalLogStore: () => actual.createLocalLogStore(databaseName),
  }
})

let databaseName = 'test'

function renderPage() {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <MemoryRouter>
          <LogbookPage />
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>,
  )
}

async function addContact(call: string, mode = 'FT8', extras: { freq?: string } = {}) {
  await userEvent.click(await screen.findByRole('button', { name: 'Add contact' }))
  await userEvent.type(screen.getByLabelText('Callsign'), call)
  await userEvent.type(screen.getByLabelText('Mode'), mode)
  if (extras.freq) await userEvent.type(screen.getByLabelText('Frequency (MHz)'), extras.freq)
  await userEvent.click(screen.getByRole('button', { name: 'Save' }))
  await screen.findByText(call)
}

beforeEach(() => {
  databaseName = `qso-log-test-${crypto.randomUUID()}`
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('the logbook', () => {
  it('starts empty and invites the first contact', async () => {
    renderPage()
    expect(await screen.findByRole('heading', { name: 'No contacts logged yet' })).toBeInTheDocument()
  })

  it('logs a contact and shows it in the log', async () => {
    renderPage()
    await addContact('2E0XXX')

    expect(screen.getByText('2E0XXX')).toBeInTheDocument()
    expect(screen.getByText('1 contact')).toBeInTheDocument()
  })

  it('keeps a contact across a reload', async () => {
    const { unmount } = renderPage()
    await addContact('2E0XXX')
    unmount()

    renderPage()
    expect(await screen.findByText('2E0XXX')).toBeInTheDocument()
  })

  it('derives the band from the frequency', async () => {
    renderPage()
    await addContact('W1AW', 'CW', { freq: '14.074' })

    const row = screen.getAllByRole('row')[1] as HTMLElement
    expect(within(row).getByText('20m')).toBeInTheDocument()
  })

  it('edits a contact', async () => {
    renderPage()
    await addContact('2E0XXX')

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.clear(screen.getByLabelText('Callsign'))
    await userEvent.type(screen.getByLabelText('Callsign'), 'M0ABC')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('M0ABC')).toBeInTheDocument()
    expect(screen.queryByText('2E0XXX')).not.toBeInTheDocument()
    expect(screen.getByText('1 contact')).toBeInTheDocument()
  })

  it('deletes a contact only after confirming', async () => {
    renderPage()
    await addContact('2E0XXX')

    vi.spyOn(window, 'confirm').mockReturnValue(false)
    await userEvent.click(screen.getByRole('button', { name: 'Delete 2E0XXX' }))
    expect(screen.getByText('2E0XXX')).toBeInTheDocument()

    vi.spyOn(window, 'confirm').mockReturnValue(true)
    await userEvent.click(screen.getByRole('button', { name: 'Delete 2E0XXX' }))
    expect(await screen.findByRole('heading', { name: 'No contacts logged yet' })).toBeInTheDocument()
  })

  it('searches the log', async () => {
    renderPage()
    await addContact('2E0XXX')
    await addContact('W1AW', 'SSB')

    await userEvent.type(screen.getByLabelText('Search'), 'w1aw')
    expect(screen.getByText('W1AW')).toBeInTheDocument()
    expect(screen.queryByText('2E0XXX')).not.toBeInTheDocument()
    expect(screen.getByText('1 contact')).toBeInTheDocument()
  })

  it('offers a way back when a search matches nothing', async () => {
    renderPage()
    await addContact('2E0XXX')

    await userEvent.type(screen.getByLabelText('Search'), 'nothing here')
    expect(screen.getByText('No contacts match this search')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.getByText('2E0XXX')).toBeInTheDocument()
  })

  it('filters by band', async () => {
    renderPage()
    await addContact('2E0XXX', 'FT8', { freq: '14.074' })
    await addContact('W1AW', 'SSB', { freq: '7.174' })

    await userEvent.selectOptions(screen.getByLabelText('Band'), '40m')
    expect(screen.getByText('W1AW')).toBeInTheDocument()
    expect(screen.queryByText('2E0XXX')).not.toBeInTheDocument()
  })

  it('sorts by callsign', async () => {
    renderPage()
    await addContact('W1AW')
    await addContact('M0ABC')

    await userEvent.click(screen.getByRole('button', { name: /Callsign/ }))
    const rows = screen.getAllByRole('row').slice(1)
    expect(within(rows[0] as HTMLElement).getByText('M0ABC')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /Callsign/ }))
    const reversed = screen.getAllByRole('row').slice(1)
    expect(within(reversed[0] as HTMLElement).getByText('W1AW')).toBeInTheDocument()
  })

  it('cancels an entry without logging it', async () => {
    renderPage()
    await userEvent.click(await screen.findByRole('button', { name: 'Add contact' }))
    await userEvent.type(screen.getByLabelText('Callsign'), '2E0XXX')
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(await screen.findByRole('heading', { name: 'No contacts logged yet' })).toBeInTheDocument()
  })

  it('round trips the log through ADIF export and import', async () => {
    renderPage()
    await addContact('2E0XXX', 'FT8', { freq: '14.074' })

    const blobs: Blob[] = []
    URL.createObjectURL = vi.fn((blob: Blob) => {
      blobs.push(blob)
      return 'blob:test'
    }) as never
    URL.revokeObjectURL = vi.fn()
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    await userEvent.click(screen.getByRole('button', { name: 'Export ADIF' }))
    const exported = await (blobs[0] as Blob).text()
    expect(exported).toContain('<CALL:6>2E0XXX')

    await userEvent.upload(
      screen.getByLabelText('Import ADIF'),
      new File([exported], 'log.adi', { type: 'text/plain' }),
    )

    // Imported as a second copy: same contact, new id, nothing overwritten.
    expect(await screen.findByText('2 contacts')).toBeInTheDocument()
  })
})
