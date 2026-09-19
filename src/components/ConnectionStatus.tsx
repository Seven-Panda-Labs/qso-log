import { useTranslation } from 'react-i18next'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

export default function ConnectionStatus() {
  const { t } = useTranslation()
  const online = useOnlineStatus()

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        online ? 'bg-panel text-fg-soft' : 'bg-warn-surface text-warn'
      }`}
    >
      {online ? t('status.online') : t('status.offline')}
    </span>
  )
}
