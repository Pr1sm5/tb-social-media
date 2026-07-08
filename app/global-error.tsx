'use client' // Error boundaries must be Client Components

import { useEffect } from 'react'

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    // global-error must include html and body tags
    <html lang="de">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
          <h2 className="text-lg font-semibold">Etwas ist schiefgelaufen.</h2>
          <p className="text-sm text-gray-500">
            Die Anwendung konnte nicht geladen werden. Bitte versuche es erneut.
          </p>
          <button
            onClick={() => unstable_retry()}
            className="rounded bg-black px-4 py-2 text-sm text-white"
          >
            Erneut versuchen
          </button>
        </div>
      </body>
    </html>
  )
}
