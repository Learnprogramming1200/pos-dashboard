import Image from "next/image";
import { Calendar, User, Clock, Tag } from "lucide-react";
import { ServerActions } from "@/lib";
import { ssrPublicAPI } from "@/lib/ssr-api";
import { landingPageTypes } from "@/types";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
export const revalidate = 600;

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Get the blog post data
async function getBlogPost(slug: string): Promise<landingPageTypes.BlogRow | null> {
  try {
    const bySlug = await ssrPublicAPI.getBlogBySlug(slug);
    const response = (bySlug as any)?.data?.data ?? (bySlug as any)?.data;

    if (!response || !response.slug) {
      return null;
    }

    return response as landingPageTypes.BlogRow;
  } catch {
    return null;
  }
}

function BlogPostContent({ post }: { post: landingPageTypes.BlogRow | null }) {
  if (!post) {
    return (
      <div className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            {Constants.commonConstants.landingStrings.blogPost.notFoundTitle}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            {Constants.commonConstants.landingStrings.blogPost.notFoundDescription}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <WebComponents.Breadcrumbs items={[
          { label: Constants.commonConstants.landingStrings.common.home, href: "/" },
          { label: Constants.commonConstants.landingStrings.common.blog, href: "/blog" },
          { label: post.title }
        ]} />
        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white mb-2">{post.title}</h1>
        <hr className="border-slate-200 dark:border-slate-700 mb-8" />
        {/* Featured Image */}
        <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl overflow-hidden mb-8 relative">
          {post.blogImage ? (
            <Image
              src={post.blogImage}
              alt={post.title}
              layout="fill"
              objectFit="cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white text-8xl font-bold opacity-20">
                {post.title ? post.title.charAt(0) : "?"}
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white mb-4">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {post.createdAt && ServerActions.DatePretier.isValidDate(post.createdAt)
                ? ServerActions.DatePretier.formatDate(post.createdAt, "MMMM d, yyyy")
                : Constants.commonConstants.landingStrings.common.dateUnavailable}
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              <span>{post.createdBy || Constants.commonConstants.landingStrings.common.unknown}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>{Constants.commonConstants.landingStrings.blogPost.estimatedReadTime}</span>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <Tag className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-1" />
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none dark:prose-invert">
          <div
            className="text-slate-700 dark:text-slate-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.description }}
          />
        </article>
      </div>
    </div>
  );
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const post = await getBlogPost(resolvedParams.slug);


  return (
    <BlogPostContent post={post} />
  );
}
