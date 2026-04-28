import Link from "next/link";
import { getSignalSessionClosedState } from "../../lib/campaign-access";

export default function SignalSessionClosedPage() {
  const session = getSignalSessionClosedState();

  return (
    <>
      <style>{`
        :root {
          --closed-bg: #020202;
          --closed-card: rgba(200, 245, 232, 0.06);
          --closed-line: rgba(200, 245, 232, 0.18);
          --closed-text: #ffffff;
          --closed-muted: rgba(255, 255, 255, 0.72);
          --closed-mint: #c8f5e8;
          --closed-sans: "Poppins", "Avenir Next", "Avenir", "Helvetica Neue", "Segoe UI", sans-serif;
          --closed-display: "Made Soulmaze", "Poppins", sans-serif;
        }

        html,
        body {
          margin: 0;
          background: var(--closed-bg);
          color: var(--closed-text);
          font-family: var(--closed-sans);
        }

        * {
          box-sizing: border-box;
        }

        .closed-page {
          min-height: 100svh;
          display: grid;
          place-items: center;
          padding: 32px 20px;
          background:
            radial-gradient(circle at top, rgba(200, 245, 232, 0.14), transparent 36%),
            linear-gradient(180deg, #050505 0%, #000000 100%);
        }

        .closed-card {
          width: min(720px, 100%);
          padding: clamp(28px, 5vw, 56px);
          border: 1px solid var(--closed-line);
          border-radius: 28px;
          background: var(--closed-card);
          text-align: center;
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.38);
        }

        .closed-kicker {
          margin: 0 0 16px;
          color: var(--closed-mint);
          font-size: 0.76rem;
          font-weight: 300;
          letter-spacing: 0.28em;
          text-transform: uppercase;
        }

        .closed-title {
          margin: 0;
          font-family: var(--closed-display);
          font-size: clamp(2.4rem, 7vw, 4.4rem);
          font-weight: 400;
          line-height: 0.98;
        }

        .closed-text {
          margin: 18px auto 0;
          max-width: 34rem;
          color: var(--closed-muted);
          font-size: 1rem;
          font-weight: 300;
          line-height: 1.8;
        }

        .closed-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 62px;
          margin-top: 28px;
          padding: 0 28px;
          border-radius: 999px;
          background: var(--closed-mint);
          color: #050505;
          font-size: 0.96rem;
          font-weight: 300;
          letter-spacing: 0.14em;
          text-decoration: none;
          text-transform: uppercase;
        }
      `}</style>
      <main className="closed-page">
        <section className="closed-card">
          <p className="closed-kicker">The Room × Give Me The Pitch</p>
          <h1 className="closed-title">{session.title}</h1>
          <p className="closed-text">{session.text}</p>
          <Link className="closed-cta" href={session.ctaHref}>
            {session.ctaLabel}
          </Link>
        </section>
      </main>
    </>
  );
}

