import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <section className="mx-auto max-w-2xl text-center">
      <h2 className="text-xl font-semibold">{t('notFound.title')}</h2>
      <Link to="/" className="mt-2 inline-block text-brand-500 underline">
        {t('notFound.back')}
      </Link>
    </section>
  )
}
