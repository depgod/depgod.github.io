import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen px-6 py-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <header className="mb-16 animate-in">
          <div className="flex items-center gap-2 mb-4 text-[var(--fg-muted)] text-sm">
            <span className="text-[var(--accent)]">$</span>
            <span>cat ~/journal/README.md</span>
            <span className="terminal-cursor"></span>
          </div>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
            Journal
          </h1>
          <p className="text-[var(--fg-muted)] text-base">
            <span className="text-[var(--accent-tertiary)]">//</span> Notes on simplicity, technology, and the craft of thinking.
          </p>
        </header>

        <nav className="mb-12 animate-in stagger-1">
          <ul className="flex gap-6 text-sm list-none p-0">
            <li className="m-0">
              <Link href="/" className="text-[var(--accent)] border-b border-[var(--accent)]">
                ./writings
              </Link>
            </li>
            <li className="m-0">
              <Link href="/about" className="text-[var(--fg-muted)] hover:text-[var(--accent)]">
                ./about
              </Link>
            </li>
            <li className="m-0">
              <Link href="/rss.xml" className="text-[var(--fg-muted)] hover:text-[var(--accent)]">
                ./rss
              </Link>
            </li>
          </ul>
        </nav>

        <section>
          <ul className="list-none p-0 space-y-6">
            {posts.map((post, i) => (
              <li 
                key={post.slug} 
                className={`animate-in stagger-${Math.min(i + 2, 5)} m-0`}
              >
                <article className="group p-4 -mx-4 rounded-lg transition-all duration-300 hover:bg-[var(--code-bg)] hover:shadow-[0_0_30px_var(--glow)]">
                  <Link 
                    href={`/posts/${post.slug}`}
                    className="block border-none"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                      <h2 className="text-lg font-normal text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors duration-200">
                        <span className="text-[var(--accent-secondary)] mr-2 opacity-60">→</span>
                        {post.title}
                      </h2>
                      <time className="text-xs text-[var(--fg-muted)] font-mono shrink-0 opacity-60">
                        {new Date(post.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </time>
                    </div>
                    <p className="mt-2 text-sm text-[var(--fg-muted)] leading-relaxed pl-5">
                      {post.excerpt}
                    </p>
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-20 pt-8 border-t border-[var(--border)] animate-in stagger-5">
          <p className="text-xs text-[var(--fg-muted)]">
            <span className="text-[var(--accent)]">©</span> {new Date().getFullYear()} — <span className="text-[var(--accent-tertiary)]">Built with care</span>
          </p>
        </footer>
      </div>
    </main>
  );
}