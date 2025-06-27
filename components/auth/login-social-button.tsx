"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import type { ReactNode } from "react";
// import { signIn } from "@/auth";

type Props = {
  provider: "google" | "apple";
  callbackUrl?: string;
  children?: ReactNode;
};

const LoginSocialButton = ({ children, provider, callbackUrl }: Props) => {
  return (
    // biome-ignore lint: TODO: Need to implement key stroke shortcuts
    <Button
      variant={"outline"}
      size={"default"}
      className=" rounded-lg"
      onClick={async () => {
        signIn(provider, { redirectTo: callbackUrl });
        // signIn(provider, { redirect: true, callbackUrl, redirectTo: });
      }}
    >
      {children}
    </Button>
  );
};

export default LoginSocialButton;
