import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Qso } from '../domain/qso'
import StatsPage from './StatsPage'

const useLog = vi.hoisted(() => vi.fn())
vi.mock('../storage/useLog', () => ({ useLog }))

function qso(overrides: Partial<Qso> = {}): Qso {
  return {
    id: crypto.randomUUID(),
    call: '2E0XXX',
    qsoDate: '20260918',
    timeOn: '1432',
    band: '20m',
    mode: 'FT8',
    ...overrides,
  }
}

describe('StatsPage', () => {
  it('says there is nothing to count for an empty log', () => {
    useLog.mockReturnValue({ qsos: [], loading: false, unavailable: false })
    render(<StatsPage />)
    expect(screen.getByText('Nothing to count yet')).toBeInTheDocument()
  })

  it('counts contacts, stations, and days', () => {
    useLog.mockReturnValue({
      qsos: [
        qso({ call: 'W1AW', qsoDate: '20260917' }),
        qso({ call: 'W1AW/P', qsoDate: '20260918' }),
        qso({ call: 'M0ABC', qsoDate: '20260918', band: '40m', mode: 'SSB' }),
      ],
      loading: false,
      unavailable: false,
    })

    render(<StatsPage />)
    expect(screen.getByText('Contacts').previousSibling).toHaveTextContent('3')
    // W1AW and W1AW/P are one station.
    expect(screen.getByText('Stations').previousSibling).toHaveTextContent('2')
    expect(screen.getByText('Days on air').previousSibling).toHaveTextContent('2')
    expect(screen.getByText('2026-09-17')).toBeInTheDocument()
  })

  it('breaks the log down by band and mode', () => {
    useLog.mockReturnValue({
      qsos: [qso({ band: '20m' }), qso({ band: '20m' }), qso({ band: '40m', mode: 'SSB' })],
      loading: false,
      unavailable: false,
    })

    render(<StatsPage />)
    expect(screen.getByRole('heading', { name: 'Bands' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Modes' })).toBeInTheDocument()
    expect(screen.getByText('20m')).toBeInTheDocument()
    expect(screen.getByText('SSB')).toBeInTheDocument()
  })

  it('renders nothing while the log is loading', () => {
    useLog.mockReturnValue({ qsos: [], loading: true, unavailable: false })
    const { container } = render(<StatsPage />)
    expect(container).toBeEmptyDOMElement()
  })
})
