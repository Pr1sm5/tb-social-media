import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-lg font-semibold">Seite nicht gefunden</h2>
      <p className="text-sm text-gray-500">
        Der angeforderte Inhalt existiert nicht (mehr).
      </p>
      <Link href="/" className="rounded bg-black px-4 py-2 text-sm text-white">
        Zurück zur Startseite
      </Link>
    </div>
  )
}
