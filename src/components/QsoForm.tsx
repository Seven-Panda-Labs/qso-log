import { type FormEvent, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { bandForFrequency } from '../domain/band'
import { MODES, reportStyle } from '../domain/mode'
import { type Qso, validateQso } from '../domain/qso'
import { toAdifDate, toAdifTime } from '../domain/time'
import { newQsoId } from '../storage/logStore'

/** ADIF YYYYMMDD to the YYYY-MM-DD an <input type="date"> speaks, and back. */
const toInputDate = (adif: string) =>
  adif.length === 8 ? `${adif.slice(0, 4)}-${adif.slice(4, 6)}-${adif.slice(6, 8)}` : ''
const fromInputDate = (value: string) => value.replaceAll('-', '')
const toInputTime = (adif: string) =>
  adif.length >= 4 ? `${adif.slice(0, 2)}:${adif.slice(2, 4)}` : ''
const fromInputTime = (value: string) => value.replace(':', '')

function blank(): Qso {
  const now = new Date()
  return {
    id: newQsoId(),
    call: '',
    qsoDate: toAdifDate(now),
    timeOn: toAdifTime(now),
    band: '',
    mode: '',
  }
}

export default function QsoForm({
  qso,
  onSave,
  onCancel,
}: {
  qso?: Qso
  onSave: (qso: Qso) => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState<Qso>(qso ?? blank())
  // Frequency stays text while typing. Parsing every keystroke turns "14." into
  // 14 and re-renders the field without the decimal point, so the operator
  // cannot type 14.074 at all.
  const [freqText, setFreqText] = useState(qso?.freq?.toString() ?? '')
  const [submitted, setSubmitted] = useState(false)

  const freq = freqText.trim() === '' ? undefined : Number(freqText)
  const contact = useMemo<Qso>(
    () => ({ ...draft, freq: freq !== undefined && Number.isFinite(freq) ? freq : undefined }),
    [draft, freq],
  )
  const issues = useMemo(() => validateQso(contact), [contact])
  const blocking = issues.filter((issue) => issue === 'call-missing' || issue === 'mode-missing')
  const derivedBand = contact.freq === undefined ? undefined : bandForFrequency(contact.freq)
  const style = reportStyle(draft.mode)

  const set = (changes: Partial<Qso>) => setDraft((current) => ({ ...current, ...changes }))

  function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (blocking.length > 0) return
    onSave(contact)
  }

  return (
    <form onSubmit={submit} className="space-y-3" aria-label={qso ? t('form.editTitle') : t('form.addTitle')}>
      <h2 className="text-lg font-semibold">{qso ? t('form.editTitle') : t('form.addTitle')}</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-slate-400">{t('field.call')}</span>
          <input
            value={draft.call}
            onChange={(event) => set({ call: event.target.value.toUpperCase() })}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            autoFocus
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-lg tracking-wide"
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-400">{t('field.mode')}</span>
          <input
            list="modes"
            value={draft.mode}
            onChange={(event) => set({ mode: event.target.value.toUpperCase() })}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
          />
          <datalist id="modes">
            {MODES.map((mode) => (
              <option key={mode.code} value={mode.code} />
            ))}
          </datalist>
        </label>

        <label className="block">
          <span className="text-sm text-slate-400">{t('field.date')}</span>
          <input
            type="date"
            value={toInputDate(draft.qsoDate)}
            onChange={(event) => set({ qsoDate: fromInputDate(event.target.value) })}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-400">{t('field.time')}</span>
          <input
            type="time"
            value={toInputTime(draft.timeOn)}
            onChange={(event) => set({ timeOn: fromInputTime(event.target.value) })}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-400">{t('field.freq')}</span>
          <input
            inputMode="decimal"
            value={freqText}
            onChange={(event) => {
              setFreqText(event.target.value)
              const parsed = Number(event.target.value)
              const band = Number.isFinite(parsed) ? bandForFrequency(parsed) : undefined
              if (band) set({ band })
            }}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
          />
          {derivedBand ? (
            <span className="mt-1 block text-xs text-slate-500">
              {t('form.bandFromFreq', { band: derivedBand })}
            </span>
          ) : null}
        </label>

        <label className="block">
          <span className="text-sm text-slate-400">{t('field.band')}</span>
          <input
            value={draft.band}
            onChange={(event) => set({ band: event.target.value })}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-400">{t('field.rstSent')}</span>
          <input
            value={draft.rstSent ?? ''}
            onChange={(event) => set({ rstSent: event.target.value })}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-400">{t('field.rstRcvd')}</span>
          <input
            value={draft.rstRcvd ?? ''}
            onChange={(event) => set({ rstRcvd: event.target.value })}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
          />
          <span className="mt-1 block text-xs text-slate-500">
            {style === 'db' ? t('form.reportHintDb') : t('form.reportHintRst')}
          </span>
        </label>

        <label className="block">
          <span className="text-sm text-slate-400">{t('field.gridsquare')}</span>
          <input
            value={draft.gridsquare ?? ''}
            onChange={(event) => set({ gridsquare: event.target.value })}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm text-slate-400">{t('field.comment')}</span>
          <input
            value={draft.comment ?? ''}
            onChange={(event) => set({ comment: event.target.value })}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
          />
        </label>
      </div>

      {/* Warnings, not gates. Only a missing callsign or mode stops a save,
          because everything else may be exactly what the operator worked. */}
      {submitted && issues.length > 0 ? (
        <ul className="space-y-1 text-sm text-amber-300">
          {issues.map((issue) => (
            <li key={issue}>{t(`issue.${issue}`)}</li>
          ))}
        </ul>
      ) : null}

      <div className="flex gap-2">
        <button type="submit" className="rounded-md bg-brand-600 px-4 py-2 font-medium">
          {t('action.save')}
        </button>
        <button type="button" onClick={onCancel} className="rounded-md px-4 py-2 underline">
          {t('action.cancel')}
        </button>
      </div>
    </form>
  )
}
