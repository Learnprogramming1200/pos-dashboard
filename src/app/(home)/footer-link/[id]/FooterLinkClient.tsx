'use client';

import { ExternalLink } from 'lucide-react';
import { WebComponents } from '@/components';
import type { HomeTypes } from '@/types';

interface FooterLinkClientProps {
  footerLink: HomeTypes.FooterLink;
  formattedDescription: string;
  hasDescription: boolean;
}

export default function FooterLinkClient({
  footerLink,
  formattedDescription,
  hasDescription
}: FooterLinkClientProps) {
  return (
    <div className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <WebComponents.Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: footerLink.title }
        ]} />

        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white mb-2">
          {footerLink.title}
        </h1>
        <hr className="border-slate-200 dark:border-slate-700 mb-8" />

        {/* Content */}
        {hasDescription ? (
          <article className="prose prose-lg max-w-none dark:prose-invert">
            <div
              className="text-slate-700 dark:text-slate-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formattedDescription }}
            />
          </article>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExternalLink className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Content Coming Soon</h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              We're working on adding detailed information about {footerLink.title}. Please check back later or contact us for more information.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
