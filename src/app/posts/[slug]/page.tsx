import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts } from "@/lib/posts";
import { PostContent } from "./post-content";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} — Journal`,
    description: post.excerpt,
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

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
            <time className="text-sm text-[var(--fg-muted)] font-mono">
              {new Date(post.date).toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </time>
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight mt-2">
              {post.title}
            </h1>
            {post.tags && (
              <div className="flex gap-2 mt-4">
                {post.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="text-xs font-mono text-[var(--fg-muted)] bg-[var(--code-bg)] px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <PostContent content={post.content} />
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
