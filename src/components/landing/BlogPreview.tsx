import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar } from "lucide-react";
import { ServerActions } from "@/lib";
import { WebComponents } from "@/components";
import { Constants } from "@/constant";
import { landingPageTypes } from "@/types";

interface BlogPreviewProps {
  blogPosts: landingPageTypes.BlogRow[];
}

export default function BlogPreview({ blogPosts }: BlogPreviewProps) {
  // Use dummy data if no blog posts provided
  const displayBlogPosts = (!blogPosts || blogPosts.length === 0) ? Constants.commonConstants.landingStrings.blogPreview.dummyBlogPosts : blogPosts;

  if (!blogPosts || blogPosts.length === 0) {
    // Continue to render with dummy data instead of showing empty state
  }

  return (
    <div className="bg-white dark:bg-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-[130px]">

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-0">
          <div className="text-left">
            <p className="text-primary font-caveat font-normal text-sm sm:text-base md:text-lg lg:text-[22px] leading-5 sm:leading-6 md:leading-7 lg:leading-[32px]">Blog</p>
            <h2 className="text-textMain font-poppins font-semibold text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-[50px] leading-6 sm:leading-7 md:leading-8 lg:leading-9 xl:leading-[60px] pt-1 dark:text-white">Latest <span className="text-primary font-poppins font-semibold italic text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-[50px] leading-6 sm:leading-7 md:leading-8 lg:leading-9 xl:leading-[60px]">Articles</span> </h2>
            <p className="text-textSmall font-interTight font-normal text-sm sm:text-base md:text-lg leading-5 sm:leading-6 md:leading-7 lg:leading-[28px] pt-3 sm:pt-4 lg:pt-5">Practical tips, expert insights, and the latest trends to take your business further</p>
          </div>

          {/* View All Post Button */}
          <div className="py-0 sm:py-4 lg:py-[50px]">
            <WebComponents.UiComponents.UiWebComponents.Button
              asChild
              variant="outline"
              className="font-interTight font-semibold text-base leading-[24px] h-8 sm:h-9 md:h-10 lg:h-11 xl:h-12 2xl:h-[44px] w-full sm:w-auto lg:w-[179px] xl:w-[179px] 2xl:w-[179px] rounded-[4px] pt-[8px] sm:pt-[9px] md:pt-[10px] lg:pt-[10px] xl:pt-[10px] 2xl:pt-[10px] pb-[8px] sm:pb-[9px] md:pb-[10px] lg:pb-[10px] xl:pb-[10px] 2xl:pb-[10px] pl-[16px] sm:pl-[18px] md:pl-[20px] lg:pl-[20px] xl:pl-[20px] 2xl:pl-[20px] pr-[16px] sm:pr-[18px] md:pr-[20px] lg:pr-[20px] xl:pr-[20px] 2xl:pr-[20px] gap-2"
            >
              <Link href="/blog" className="flex items-center">
                View All Post
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              </Link>
            </WebComponents.UiComponents.UiWebComponents.Button>
          </div>

        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-[30px] pt-8 sm:pt-12 md:pt-16 lg:pt-[60px]">
          {displayBlogPosts.slice(0, 3).map((post, index) => (
            <div key={post.id || index} className="bg-white">
              <Link href={`/blog/${post.slug}`}>
                <figure className="bg-white">
                  {post.blogImage ? (
                    <Image
                      width={100}
                      height={100}
                      className="h-48 sm:h-64 md:h-80 lg:h-[360px] w-full object-cover rounded-[10px] transition-transform duration-300 ease-in-out hover:scale-105"
                      src={post.blogImage}
                      alt={post.title || "Blog post"}
                      onError={(e) => {
                        console.error('Image failed to load:', post.blogImage);
                        // Fallback to placeholder
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />

                  ) : (
                    <div className="h-48 sm:h-64 md:h-80 lg:h-[360px] w-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center rounded-[10px]">
                      <div className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold opacity-20">
                        {post.title ? post.title.charAt(0) : "?"}
                      </div>
                    </div>
                  )}
                </figure>
              </Link>

              <div className="pt-4 sm:pt-6 lg:pt-[36px] pl-0 sm:pl-4 lg:pl-[10px] dark:bg-dark">
                <p className="text-textSmall font-interTight font-normal text-xs sm:text-sm leading-4 sm:leading-5 lg:leading-[24px] flex items-center">
                  <Calendar className="w-6 h-6 pr-2" /> {post.createdAt && ServerActions.DatePretier.isValidDate(post.createdAt)
                    ? ServerActions.DatePretier.formatDate(post.createdAt, "MMM dd, yyyy")
                    : "Aug 15, 2025"} • {post.createdBy}
                </p>
                <h6 className="text-textMain font-poppins font-semibold text-base sm:text-lg lg:text-[20px] leading-5 sm:leading-6 lg:leading-[30px] pt-2 sm:pt-3 lg:pt-[10px] dark:text-white">
                  {post.title || "The Future of Point of Sale: How POSPro is Changing Retail"}
                </h6>

                {/* Read More Link */}
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-normal text-sm flex items-center group"
                >
                  Read More
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
