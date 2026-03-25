import Image from "next/image";
import Link from "next/link";

export default function NotAuthorized() {
  return (
    <main className="error-root">
      <div className="error-container">
        <div className="error-illustration">
          <Image
            src="/not-authorized.svg"
            alt="Not authorized"
            fill
            priority
            className="error-img"
          />
        </div>

        <h1 className="error-title">Not Authorized</h1>

        <p className="error-subtitle">
          You don’t have permission to access this page.
        </p>

        <Link href="/dashboard" className="error-button">
          Back to Dashboard
        </Link>
      </div>

      <div className="error-bg-icon">
        <Image
          src="/error.svg"
          alt="Error background"
          fill
          className="error-bg-img"
        />
      </div>
    </main>
  );
}
