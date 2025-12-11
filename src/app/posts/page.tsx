import Link from "next/link";
import { getPaginatedPosts } from "@/lib/posts";

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const { posts, totalPages } = getPaginatedPosts(page, 5);

  return (
    <main className="min-h-screen px-6 py-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 animate-in">
          <div className="flex items-center gap-2 mb-4 text-[var(--fg-muted)] text-sm">
            <span className="text-[var(--accent)]">$</span>
            <span>ls ~/journal/posts/</span>
            <span className="terminal-cursor"></span>
          </div>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
            All Posts
          </h1>
          <p className="text-[var(--fg-muted)] text-base">
            <span className="text-[var(--accent-tertiary)]">//</span> Browse all writings
          </p>
        </header>

        <nav className="mb-12 animate-in stagger-1">
          <ul className="flex gap-6 text-sm list-none p-0">
            <li className="m-0">
              <Link href="/" className="text-[var(--fg-muted)] hover:text-[var(--accent)]">
                ./home
              </Link>
            </li>
            <li className="m-0">
              <Link href="/posts" className="text-[var(--accent)] border-b border-[var(--accent)]">
                ./all-posts
              </Link>
            </li>
            <li className="m-0">
              <Link href="/about" className="text-[var(--fg-muted)] hover:text-[var(--accent)]">
                ./about
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
                  <Link href={`/posts/${post.slug}`} className="block border-none">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                      <h2 className="text-lg font-normal text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors duration-200">
                        <span className="text-[var(--accent-secondary)] mr-2 opacity-60">→</span>
                        {post.title}
                      </h2>
                      <time className="text-xs text-[var(--fg-muted)] font-mono shrink-0 opacity-60">
                        {new Date(post.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
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

        {totalPages > 1 && (
          <nav className="mt-12 flex items-center justify-center gap-2 animate-in stagger-4">
            {page > 1 && (
              <Link
                href={`/posts?page=${page - 1}`}
                className="px-4 py-2 text-sm rounded-lg bg-[var(--code-bg)] border border-[var(--border)] text-[var(--fg-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
              >
                ← Prev
              </Link>
            )}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/posts?page=${p}`}
                  className={`px-3 py-2 text-sm rounded-lg transition-all ${
                    p === page
                      ? "bg-[var(--accent)] text-[var(--bg)] font-medium"
                      : "bg-[var(--code-bg)] border border-[var(--border)] text-[var(--fg-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
            {page < totalPages && (
              <Link
                href={`/posts?page=${page + 1}`}
                className="px-4 py-2 text-sm rounded-lg bg-[var(--code-bg)] border border-[var(--border)] text-[var(--fg-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
              >
                Next →
              </Link>
            )}
          </nav>
        )}

        <footer className="mt-20 pt-8 border-t border-[var(--border)] animate-in stagger-5">
          <p className="text-xs text-[var(--fg-muted)]">
            <span className="text-[var(--accent)]">©</span> {new Date().getFullYear()} — <span className="text-[var(--accent-tertiary)]">Built with care</span>
          </p>
        </footer>
      </div>
    </main>
  );
}
