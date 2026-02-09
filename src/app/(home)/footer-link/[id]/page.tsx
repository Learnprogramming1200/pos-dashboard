
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { generateFooterLinkMetadata, formatDescription } from '@/utils/footerLinkUtils';
import FooterLinkClient from './FooterLinkClient';
import { HomeTypes } from '@/types';
import { ServerActions } from '@/lib/server-lib';

interface FooterLinkPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: FooterLinkPageProps): Promise<Metadata> {
  let footerLink: HomeTypes.FooterLink | null = null;
  const { id } = await params;

  try {
    const footerResp = await ServerActions.ServerApilib.ssrPublicAPI.getFooterSection();
    const footerData = footerResp?.data?.data || footerResp?.data;

    // Check for links in the correct structure based on your API response
    const links = footerData?.links || footerData?.data?.links || [];

    if (links.length > 0) {
      footerLink = links.find((link: HomeTypes.FooterLink) => link._id === id);
    }
  } catch (error) {
    console.error('Error fetching footer link for metadata:', error);
  }

  if (!footerLink) {
    return {
      title: 'Page Not Found | POSPro',
      description: 'The requested page could not be found.',
    };
  }

  return generateFooterLinkMetadata(footerLink);
}

export default async function FooterLinkPage({ params }: FooterLinkPageProps) {
  let footerLink: HomeTypes.FooterLink | null = null;
  const { id } = await params;

  try {
    // Fetch footer section to get the specific link
    const footerResp = await ServerActions.ServerApilib.ssrPublicAPI.getFooterSection();
    const footerData = footerResp?.data?.data || footerResp?.data;

    // Check for links in the correct structure based on your API response
    const links = footerData?.links || footerData?.data?.links || [];

    if (links.length > 0) {
      footerLink = links.find((link: HomeTypes.FooterLink) => link._id === id);
    }
  } catch (error) {
    console.error('Error fetching footer link:', error);
  }

  if (!footerLink) {
    notFound();
  }

  const formattedDescription = formatDescription(footerLink.description || '');
  const hasDescription = Boolean(footerLink.description && footerLink.description.trim().length > 0);

  return (
    <FooterLinkClient
      footerLink={footerLink}
      formattedDescription={formattedDescription}
      hasDescription={hasDescription}
    />
  );
}

export async function generateStaticParams() {
  try {
    const footerResp = await ServerActions.ServerApilib.ssrPublicAPI.getFooterSection();
    const footerData = footerResp?.data?.data || footerResp?.data;

    if (footerData?.links) {
      return footerData.links.map((link: HomeTypes.FooterLink) => ({
        id: link._id,
      }));
    }
  } catch (error) {
    console.error('Error generating static params:', error);
  }

  return [];
}
