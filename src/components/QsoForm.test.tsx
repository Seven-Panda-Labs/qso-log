import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Qso } from '../domain/qso'
import QsoForm from './QsoForm'

const existing: Qso = {
  id: 'abc',
  call: 'W1AW',
  qsoDate: '20260918',
  timeOn: '1432',
  band: '20m',
  mode: 'SSB',
  rstSent: '59',
}

describe('QsoForm', () => {
  it('defaults a new contact to now, in UTC', () => {
    vi.setSystemTime(new Date('2026-09-18T14:32:00Z'))
    render(<QsoForm onSave={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByLabelText('Date (UTC)')).toHaveValue('2026-09-18')
    expect(screen.getByLabelText('Time (UTC)')).toHaveValue('14:32')
    vi.useRealTimers()
  })

  it('uppercases the callsign as it is typed', async () => {
    render(<QsoForm onSave={vi.fn()} onCancel={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Callsign'), 'w1aw')
    expect(screen.getByLabelText('Callsign')).toHaveValue('W1AW')
  })

  it('saves a complete contact', async () => {
    const onSave = vi.fn()
    render(<QsoForm onSave={onSave} onCancel={vi.fn()} />)

    await userEvent.type(screen.getByLabelText('Callsign'), '2E0XXX')
    await userEvent.type(screen.getByLabelText('Mode'), 'FT8')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ call: '2E0XXX', mode: 'FT8' }))
  })

  it('loads an existing contact for editing and keeps its id', async () => {
    const onSave = vi.fn()
    render(<QsoForm qso={existing} onSave={onSave} onCancel={vi.fn()} />)

    expect(screen.getByLabelText('Callsign')).toHaveValue('W1AW')
    await userEvent.clear(screen.getByLabelText('Notes'))
    await userEvent.type(screen.getByLabelText('Notes'), 'Nice QSO')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ id: 'abc', comment: 'Nice QSO' }))
  })

  it('fills the band in from the frequency', async () => {
    const onSave = vi.fn()
    render(<QsoForm onSave={onSave} onCancel={vi.fn()} />)

    await userEvent.type(screen.getByLabelText('Callsign'), 'W1AW')
    await userEvent.type(screen.getByLabelText('Mode'), 'CW')
    await userEvent.type(screen.getByLabelText('Frequency (MHz)'), '14.074')

    expect(screen.getByText('Band 20m from the frequency')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ band: '20m', freq: 14.074 }))
  })

  // FT8 operators have a dB signal to noise figure, not 59.
  it('asks for the report the mode actually uses', async () => {
    render(<QsoForm onSave={vi.fn()} onCancel={vi.fn()} />)

    await userEvent.type(screen.getByLabelText('Mode'), 'SSB')
    expect(screen.getByText('Signal report, for example 59')).toBeInTheDocument()

    await userEvent.clear(screen.getByLabelText('Mode'))
    await userEvent.type(screen.getByLabelText('Mode'), 'FT8')
    expect(screen.getByText('Signal report in dB, for example -12')).toBeInTheDocument()
  })

  it('will not save without a callsign or a mode', async () => {
    const onSave = vi.fn()
    render(<QsoForm onSave={onSave} onCancel={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSave).not.toHaveBeenCalled()
    expect(screen.getByText('A callsign is needed')).toBeInTheDocument()
    expect(screen.getByText('A mode is needed')).toBeInTheDocument()
  })

  /**
   * The rule the domain layer sets: an unusual callsign is flagged, never
   * refused. The operator knows who they worked.
   */
  it('saves an unusual callsign after warning about it', async () => {
    const onSave = vi.fn()
    render(<QsoForm onSave={onSave} onCancel={vi.fn()} />)

    await userEvent.type(screen.getByLabelText('Callsign'), 'SPECIAL')
    await userEvent.type(screen.getByLabelText('Mode'), 'SSB')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ call: 'SPECIAL' }))
  })

  it('cancels without saving', async () => {
    const onSave = vi.fn()
    const onCancel = vi.fn()
    render(<QsoForm onSave={onSave} onCancel={onCancel} />)

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onSave).not.toHaveBeenCalled()
  })
})
