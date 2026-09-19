import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Qso } from '../domain/qso'
import AdifButtons from './AdifButtons'

const qsos: Qso[] = [
  { id: '1', call: 'W1AW', qsoDate: '20260918', timeOn: '1432', band: '20m', mode: 'FT8' },
]

const SAMPLE = `<ADIF_VER:5>3.1.4
<EOH>
<CALL:5>2E0XX <QSO_DATE:8>20260918 <TIME_ON:4>1432 <BAND:3>20m <MODE:3>FT8 <EOR>
<CALL:4>W1AW <QSO_DATE:8>20260917 <TIME_ON:4>0905 <BAND:3>40m <MODE:3>SSB <EOR>
`

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => 'blob:test')
  URL.revokeObjectURL = vi.fn()
})

describe('AdifButtons', () => {
  it('exports the log as a file', async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    render(<AdifButtons qsos={qsos} onImport={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Export ADIF' }))
    expect(URL.createObjectURL).toHaveBeenCalled()
    expect(click).toHaveBeenCalled()
    click.mockRestore()
  })

  it('cannot export an empty log', () => {
    render(<AdifButtons qsos={[]} onImport={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Export ADIF' })).toBeDisabled()
  })

  it('imports contacts from a file', async () => {
    const onImport = vi.fn()
    render(<AdifButtons qsos={[]} onImport={onImport} />)

    const file = new File([SAMPLE], 'log.adi', { type: 'text/plain' })
    await userEvent.upload(screen.getByLabelText('Import ADIF'), file)

    await vi.waitFor(() => expect(onImport).toHaveBeenCalled())
    const imported = onImport.mock.calls[0]?.[0] as Qso[]
    expect(imported).toHaveLength(2)
    expect(imported[0]).toMatchObject({ call: '2E0XX', band: '20m', mode: 'FT8' })
    expect(await screen.findByText('2 contacts imported')).toBeInTheDocument()
  })

  // An imported file is a separate record of the same contacts. Reusing ids
  // from another program would overwrite the operator's own entries.
  it('gives imported contacts new ids', async () => {
    const onImport = vi.fn()
    render(<AdifButtons qsos={[]} onImport={onImport} />)

    await userEvent.upload(
      screen.getByLabelText('Import ADIF'),
      new File([SAMPLE], 'log.adi', { type: 'text/plain' }),
    )

    await vi.waitFor(() => expect(onImport).toHaveBeenCalled())
    const imported = onImport.mock.calls[0]?.[0] as Qso[]
    expect(new Set(imported.map((qso) => qso.id)).size).toBe(2)
  })

  it('says so when a file holds no contacts', async () => {
    const onImport = vi.fn()
    render(<AdifButtons qsos={[]} onImport={onImport} />)

    await userEvent.upload(
      screen.getByLabelText('Import ADIF'),
      new File(['not an adif file'], 'notes.txt', { type: 'text/plain' }),
    )

    expect(await screen.findByText('No contacts found in that file')).toBeInTheDocument()
    expect(onImport).not.toHaveBeenCalled()
  })
})
