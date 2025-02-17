import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

import { logger } from '@/utils/shared/logger'
import { trackClientAnalytic } from '@/utils/web/clientAnalytics'

export function useHandlePageError({
  domain,
  humanReadablePageName,
  error,
}: {
  domain: string
  humanReadablePageName: string
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    const isIntentionalError = window.location.pathname.includes('debug-sentry')
    logger.info(`${humanReadablePageName} Error Page rendered with:`, error)
    Sentry.captureException(error, { tags: { domain } })
    const message = isIntentionalError
      ? `Testing Sentry Triggered ${humanReadablePageName} Error Page`
      : `${humanReadablePageName} Error Page Displayed`
    Sentry.captureMessage(message, { fingerprint: [`fingerprint-${message}`] })
    trackClientAnalytic('Error Page Visible', { Category: humanReadablePageName })
  }, [domain, error, humanReadablePageName])
}
