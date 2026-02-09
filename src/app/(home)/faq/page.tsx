import { ServerActions } from "@/lib/server-lib";
import ExploreFaqSection from "@/components/landing/ExploreFaqSection";

export default async function FAQPage() {
  const response = await ServerActions.ServerApilib.ssrPublicAPI.getFAQs();
  const faqs = response?.data?.data || [];

  return <ExploreFaqSection faqs={faqs} />;
}
