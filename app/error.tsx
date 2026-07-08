'use client' // Error boundaries must be Client Components

import { useEffect } from 'react'

export default function Error({
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-lg font-semibold">Etwas ist schiefgelaufen.</h2>
      <p className="text-sm text-gray-500">
        Bitte versuche es erneut. Falls das Problem bestehen bleibt, lade die Seite neu.
      </p>
      <button
        onClick={() => unstable_retry()}
        className="rounded bg-black px-4 py-2 text-sm text-white"
      >
        Erneut versuchen
      </button>
    </div>
  )
}
