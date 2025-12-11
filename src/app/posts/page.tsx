import Link from "next/link";
import { Suspense } from "react";
import { getAllPosts } from "@/lib/posts";
import { PostsList } from "./posts-list";

export default function PostsPage() {
  const allPosts = getAllPosts().map(({ slug, title, date, excerpt }) => ({
    slug,
    title,
    date,
    excerpt,
  }));

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

        <Suspense fallback={<div className="text-[var(--fg-muted)]">Loading...</div>}>
          <PostsList posts={allPosts} />
        </Suspense>

        <footer className="mt-20 pt-8 border-t border-[var(--border)] animate-in stagger-5">
          <p className="text-xs text-[var(--fg-muted)]">
            <span className="text-[var(--accent)]">©</span> {new Date().getFullYear()} — <span className="text-[var(--accent-tertiary)]">Built with care</span>
          </p>
        </footer>
      </div>
    </main>
  );
}
