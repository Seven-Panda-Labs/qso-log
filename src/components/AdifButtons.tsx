import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adifToQso, parseAdif, serializeAdif } from '../domain/adif'
import type { Qso } from '../domain/qso'
import { newQsoId } from '../storage/logStore'

export default function AdifButtons({
  qsos,
  onImport,
}: {
  qsos: Qso[]
  onImport: (qsos: Qso[]) => Promise<void> | void
}) {
  const { t } = useTranslation()
  const input = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)

  function exportLog() {
    const url = URL.createObjectURL(new Blob([serializeAdif(qsos)], { type: 'text/plain' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `qso-log-${new Date().toISOString().slice(0, 10)}.adi`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function importLog(file: File) {
    const { records } = parseAdif(await file.text())
    if (records.length === 0) {
      setMessage(t('adif.importFailed'))
      return
    }
    // New ids: an imported file is a separate record of the same contacts, and
    // reusing ids from another program would overwrite the operator's own.
    await onImport(records.map((record) => adifToQso(record, newQsoId())))
    setMessage(t('adif.imported', { count: records.length }))
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <button type="button" onClick={() => input.current?.click()} className="underline">
        {t('adif.import')}
      </button>
      <input
        ref={input}
        type="file"
        accept=".adi,.adif,text/plain"
        aria-label={t('adif.import')}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void importLog(file)
          event.target.value = ''
        }}
      />
      <button type="button" onClick={exportLog} disabled={qsos.length === 0} className="underline disabled:no-underline disabled:opacity-40">
        {t('adif.export')}
      </button>
      {message ? <span className="text-muted">{message}</span> : null}
    </div>
  )
}
