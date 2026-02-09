import type { FooterLink } from '@/types/home';

/**
 * Generates page metadata for footer link pages
 */
export function generateFooterLinkMetadata(footerLink: FooterLink) {
  return {
    title: `${footerLink.title} | POSPro`,
    description: footerLink.description || `Learn more about ${footerLink.title} at POSPro`,
    keywords: [footerLink.title, 'POSPro', 'Point of Sale', 'Business Management'],
    openGraph: {
      title: `${footerLink.title} | POSPro`,
      description: footerLink.description || `Learn more about ${footerLink.title} at POSPro`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${footerLink.title} | POSPro`,
      description: footerLink.description || `Learn more about ${footerLink.title} at POSPro`,
    },
  };
}

/**
 * Sanitizes HTML content for safe rendering
 */
export function sanitizeHtmlContent(html: string): string {
  // Basic HTML sanitization - you might want to use a library like DOMPurify for production
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '');
}

/**
 * Formats the description content for better display
 */
export function formatDescription(description: string): string {
  if (!description) return '';
  
  // If it's already HTML, return sanitized version
  if (description.includes('<')) {
    return sanitizeHtmlContent(description);
  }
  
  // If it's plain text, convert line breaks to HTML
  return description
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}

/**
 * Extracts a preview of the description for meta tags
 */
export function getDescriptionPreview(description: string, maxLength: number = 160): string {
  if (!description) return '';
  
  // Remove HTML tags for preview
  const plainText = description.replace(/<[^>]*>/g, '');
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  return plainText.substring(0, maxLength).trim() + '...';
}
