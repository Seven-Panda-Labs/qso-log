import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Qso } from '../domain/qso'
import LogTable from './LogTable'

const qsos: Qso[] = [
  { id: '1', call: 'W1AW', qsoDate: '20260918', timeOn: '1432', band: '20m', mode: 'FT8', rstSent: '-12' },
  { id: '2', call: 'M0ABC', qsoDate: '20260917', timeOn: '0905', band: '40m', mode: 'SSB' },
]

function renderTable(overrides = {}) {
  const props = {
    qsos,
    sort: { field: 'date', direction: 'desc' } as const,
    onSort: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  }
  render(<LogTable {...props} />)
  return props
}

describe('LogTable', () => {
  it('shows a row per contact', () => {
    renderTable()
    expect(screen.getByText('W1AW')).toBeInTheDocument()
    expect(screen.getByText('M0ABC')).toBeInTheDocument()
  })

  it('formats dates and times for reading, not for ADIF', () => {
    renderTable()
    expect(screen.getByText('2026-09-18')).toBeInTheDocument()
    expect(screen.getByText('14:32')).toBeInTheDocument()
  })

  it('sorts when a sortable header is clicked', async () => {
    const { onSort } = renderTable()
    await userEvent.click(screen.getByRole('button', { name: /Callsign/ }))
    expect(onSort).toHaveBeenCalledWith('call')
  })

  it('marks the sorted column for screen readers', () => {
    renderTable({ sort: { field: 'call', direction: 'asc' } })
    expect(screen.getByRole('button', { name: /Callsign/ })).toHaveAttribute('aria-sort', 'ascending')
  })

  it('edits and deletes a contact', async () => {
    const { onEdit, onDelete } = renderTable()

    await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0] as HTMLElement)
    expect(onEdit).toHaveBeenCalledWith(qsos[0])

    // The delete buttons are told apart by callsign, so a mis-click is visible.
    await userEvent.click(screen.getByRole('button', { name: 'Delete M0ABC' }))
    expect(onDelete).toHaveBeenCalledWith(qsos[1])
  })

  it('renders an empty log without rows', () => {
    renderTable({ qsos: [] })
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
  })
})
