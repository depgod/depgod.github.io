import Link from "next/link";

export const metadata = {
  title: "About — Journal",
  description: "About this journal",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen px-6 py-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <nav className="mb-12 animate-in">
          <Link 
            href="/" 
            className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors inline-flex items-center gap-2"
          >
            <span>←</span>
            <span>back to journal</span>
          </Link>
        </nav>

        <article className="animate-in stagger-1">
          <header className="mb-12">
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight">
              About
            </h1>
          </header>

          <div className="prose">
            <p>
              This is a space for thinking out loud. A digital garden where ideas 
              are planted, tended, and occasionally left to compost.
            </p>

            <p>
              The design follows a simple philosophy: remove everything that 
              doesn&apos;t serve the words. No sidebars, no widgets, no distractions. 
              Just text, carefully typeset, on a quiet background.
            </p>

            <h2>Colophon</h2>

            <p>
              Set in <em>Cormorant Garamond</em>, a typeface that feels both 
              timeless and fresh. Code samples use <em>JetBrains Mono</em>.
            </p>

            <p>
              Inspired by the <em>no-style-please</em> Hugo theme, but with 
              a touch more refinement—subtle animations, considered spacing, 
              and a warm color palette.
            </p>

            <h2>Contact</h2>

            <p>
              Find me elsewhere on the web, or don&apos;t. The writing here should 
              stand on its own.
            </p>

            <ul>
              <li>Email: hello@example.com</li>
              <li>GitHub: @username</li>
              <li>Twitter: @username</li>
            </ul>
          </div>
        </article>

        <footer className="mt-20 pt-8 border-t border-[var(--border)] animate-in stagger-2">
          <Link 
            href="/"
            className="text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors"
          >
            ← Back to all posts
          </Link>
        </footer>
      </div>
    </main>
  );
}
