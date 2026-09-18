import { useTranslation } from 'react-i18next'

export default function LogbookPage() {
  const { t } = useTranslation()

  return (
    <section className="mx-auto max-w-2xl text-center">
      <h2 className="text-xl font-semibold">{t('logbook.empty.title')}</h2>
      <p className="mt-2 text-slate-400">{t('logbook.empty.body')}</p>
    </section>
  )
}
