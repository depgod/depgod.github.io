import Link from "next/link";
import { getRecentPosts, getAllPosts } from "@/lib/posts";

export default function Home() {
  const posts = getRecentPosts(5);
  const totalPosts = getAllPosts().length;

  return (
    <main className="min-h-screen px-6 py-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 animate-in">
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

        <div className="flex items-center gap-4 mb-6 animate-in stagger-1">
          <a
            href="https://discord.gg/"
            target="_blank"
            rel="noopener noreferrer"
            className="group p-2.5 rounded-lg bg-[var(--code-bg)] border border-[var(--border)] hover:border-[#5865F2] hover:shadow-[0_0_20px_rgba(88,101,242,0.4)] transition-all duration-300"
            aria-label="Discord"
          >
            <svg className="w-5 h-5 text-[var(--fg-muted)] group-hover:text-[#5865F2] transition-colors" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </a>
          <a
            href="https://t.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="group p-2.5 rounded-lg bg-[var(--code-bg)] border border-[var(--border)] hover:border-[#26A5E4] hover:shadow-[0_0_20px_rgba(38,165,228,0.4)] transition-all duration-300"
            aria-label="Telegram"
          >
            <svg className="w-5 h-5 text-[var(--fg-muted)] group-hover:text-[#26A5E4] transition-colors" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </a>
          <a
            href="https://matrix.to/"
            target="_blank"
            rel="noopener noreferrer"
            className="group p-2.5 rounded-lg bg-[var(--code-bg)] border border-[var(--border)] hover:border-[#00D4AA] hover:shadow-[0_0_20px_rgba(0,212,170,0.4)] transition-all duration-300"
            aria-label="Matrix"
          >
            <svg className="w-5 h-5 text-[var(--fg-muted)] group-hover:text-[#00D4AA] transition-colors" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.632.55v22.9H2.28V24H0V0h2.28v.55zm7.043 7.26v1.157h.033c.309-.443.683-.784 1.117-1.024.433-.245.936-.365 1.5-.365.54 0 1.033.107 1.481.314.448.208.785.582 1.02 1.108.254-.374.6-.706 1.034-.992.434-.287.95-.43 1.546-.43.453 0 .872.056 1.26.167.388.11.716.286.993.53.276.245.489.559.646.951.152.392.23.863.23 1.417v5.728h-2.349V11.52c0-.286-.01-.559-.032-.812a1.755 1.755 0 0 0-.18-.66 1.106 1.106 0 0 0-.438-.448c-.194-.11-.457-.166-.785-.166-.332 0-.6.064-.803.189a1.38 1.38 0 0 0-.48.499 1.946 1.946 0 0 0-.231.696 5.56 5.56 0 0 0-.06.785v4.768h-2.35v-4.8c0-.254-.004-.503-.018-.752a2.074 2.074 0 0 0-.143-.688 1.052 1.052 0 0 0-.415-.503c-.194-.125-.476-.19-.853-.19-.11 0-.258.022-.438.063-.18.04-.37.126-.566.26a1.5 1.5 0 0 0-.49.583c-.13.254-.197.593-.197 1.024v4.994h-2.35V7.81zm14.667 14.64H24V0h-2.28v.55h1.648v22.9h-1.648z"/>
            </svg>
          </a>
          <a
            href="mailto:hello@example.com"
            className="group p-2.5 rounded-lg bg-[var(--code-bg)] border border-[var(--border)] hover:border-[var(--accent)] hover:shadow-[0_0_20px_var(--glow)] transition-all duration-300"
            aria-label="Email"
          >
            <svg className="w-5 h-5 text-[var(--fg-muted)] group-hover:text-[var(--accent)] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </a>
        </div>

        <nav className="mb-12 animate-in stagger-1">
          <ul className="flex gap-6 text-sm list-none p-0">
            <li className="m-0">
              <Link href="/" className="text-[var(--accent)] border-b border-[var(--accent)]">
                ./writings
              </Link>
            </li>
            <li className="m-0">
              <Link href="/posts" className="text-[var(--fg-muted)] hover:text-[var(--accent)]">
                ./all-posts
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
          <div className="flex items-center justify-between mb-6 animate-in stagger-2">
            <h2 className="text-sm text-[var(--fg-muted)] font-mono">
              <span className="text-[var(--accent-tertiary)]">#</span> Recent posts
            </h2>
            <span className="text-xs text-[var(--fg-muted)] opacity-60">
              {totalPosts} total
            </span>
          </div>
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

          {totalPosts > 5 && (
            <div className="mt-8 text-center animate-in stagger-5">
              <Link
                href="/posts"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm rounded-lg bg-[var(--code-bg)] border border-[var(--border)] text-[var(--fg-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:shadow-[0_0_20px_var(--glow)] transition-all duration-300"
              >
                View all {totalPosts} posts
                <span className="text-[var(--accent)]">→</span>
              </Link>
            </div>
          )}
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