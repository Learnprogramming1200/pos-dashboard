import { Suspense } from "react";
import { WebComponents } from "@/components";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WebComponents.ForgotPassWordComponents.ForgotPasswordComponent.ResetPassword />
    </Suspense>
  );
} 