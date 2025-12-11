"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface PostData {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
}

export function PostsList({ posts }: { posts: PostData[] }) {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 5;
  const totalPages = Math.ceil(posts.length / limit);
  const start = (page - 1) * limit;
  const paginatedPosts = posts.slice(start, start + limit);

  return (
    <>
      <section>
        <ul className="list-none p-0 space-y-6">
          {paginatedPosts.map((post, i) => (
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
    </>
  );
}
