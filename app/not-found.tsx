import Image from "next/image"
import Link from "next/link"

export default function NotFound() {
  return (
    <main className="lost-root">
      <div className="lost-container">
        <div className="lost-illustration">
          <Image
            src="/not-found.svg"
            alt="Page not found"
            fill
            priority
            className="lost-img"
          />
        </div>

        <h1 className="lost-title">Oh no. We lost this page</h1>

        <p className="lost-subtitle">
          We searched everywhere but couldn&apos;t find what you&apos;re looking for.
          <br />
          Let&apos;s find a better place for you to go.
        </p>

        <Link href="/" className="lost-button">
          Back to homepage
        </Link>
      </div>
    </main>
  )
}
