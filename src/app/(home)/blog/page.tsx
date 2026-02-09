import Link from "next/link";
import Image from "next/image";
import { ServerActions } from "@/lib";
import { ssrPublicAPI } from "@/lib/ssr-api";
import { Calendar, User, ArrowRight } from "lucide-react";
import { landingPageTypes } from "@/types";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
export const revalidate = 600;

async function getBlogPosts(): Promise<landingPageTypes.BlogRow[]> {
  try {
    const resp = await ssrPublicAPI.getBlogs();
    const list = Array.isArray((resp as any)?.data?.data)
      ? (resp as any).data.data
      : Array.isArray((resp as any)?.data)
        ? (resp as any).data
        : [];
    return (list as landingPageTypes.BlogRow[]) || [];
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();
  return (
    <div className="py-20 bg-white dark:bg-slate-900">
      <div className="container mx-auto">
        <WebComponents.Breadcrumbs items={[
          { label: Constants.commonConstants.landingStrings.common.home, href: "/" },
          { label: Constants.commonConstants.landingStrings.common.blog }
        ]} />
        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white mb-2">
          {Constants.commonConstants.landingStrings.common.blog}
        </h1>
        <hr className="border-slate-200 dark:border-slate-700 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <article
              key={post.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/20 overflow-hidden hover-lift animate-slide-up border border-gray-200 dark:border-slate-700"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
                {post.blogImage ? (
                  <Image
                    src={post.blogImage}
                    alt={post.title}
                    layout="fill"
                    objectFit="cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-white text-6xl font-bold opacity-20">
                      {post.title ? post.title.charAt(0) : "?"}
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              <div className="p-6">
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  {post.createdAt && ServerActions.DatePretier.isValidDate(post.createdAt)
                    ? ServerActions.DatePretier.formatDate(post.createdAt, "MMM d, yyyy")
                    : Constants.commonConstants.landingStrings.common.dateUnavailable}
                  <span className="mx-2">•</span>
                  <User className="w-4 h-4 mr-2" />
                  <span>{post.createdBy || Constants.commonConstants.landingStrings.common.unknown}</span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                  {post.overview}
                </p>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <Link
                  href={`/blog/${post.slug}`}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm flex items-center group"
                >
                  {Constants.commonConstants.landingStrings.common.readMore}
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

