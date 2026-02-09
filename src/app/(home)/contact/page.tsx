import ContactUsContent from "@/components/landing/Contactus";
import { ServerActions } from "@/lib/server-lib";

export default async function ContactPage() {
  const response = await ServerActions.ServerApilib.ssrPublicAPI.getGeneralSettings();
  const data = response?.data?.data;

  return <ContactUsContent generalSettings={data} />;
}
