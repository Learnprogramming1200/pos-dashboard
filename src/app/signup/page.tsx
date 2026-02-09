import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";

export default async function SignupPage() {
  const response = await ServerActions.ServerApilib.ssrPublicAPI.getBusinessCategories();
  const businessCategories = response.data?.data?.data || [];
  return <WebComponents.AuthenticationComponents.AuthComponent.Signup
    initialBusinessCategories={businessCategories}
  />;
}