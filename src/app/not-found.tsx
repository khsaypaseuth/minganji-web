import Link from "next/link";
import "./globals.css";

// Fallback for paths outside the locale segment (rare: the proxy adds a locale).
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <main style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Page not found</h1>
          <p><Link href="/en" style={{ color: "#d7261e" }}>Go to MingAnji.ai</Link></p>
        </main>
      </body>
    </html>
  );
}
