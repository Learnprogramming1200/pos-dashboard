import { Suspense } from "react";
import { WebComponents } from "@/components";

export default function OTPPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WebComponents.ForgotPassWordComponents.ForgotPasswordComponent.OTPVerification/>
    </Suspense>
  );
} 