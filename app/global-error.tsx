"use client"

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "4rem", textAlign: "center" }}>
        <h2>Something went wrong</h2>
        <p>{error.message || "Please reload the page."}</p>
        <button onClick={reset} style={{ marginTop: "1rem", padding: "0.75rem 1.25rem" }}>
          Try again
        </button>
      </body>
    </html>
  )
}
