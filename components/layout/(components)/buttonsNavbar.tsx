"use server";

import { auth } from "@/auth";
import LogoutButton from "@/components/auth/logout-button";
import Button from "@/components/shared/Button";
import Link from "next/link";

const NavbarButtons = async () => {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  const NavLink = ({
    href,
    label,
    variant,
  }: {
    href: string;
    label: string;
    variant: "primary" | "outline";
  }) => (
    <Link href={href} className="w-full">
      <Button variant={variant} className="w-full" aria-label={label}>
        {label}
      </Button>
    </Link>
  );

  return (
    <div className="pt-4 pb-2 border-t border-primary flex gap-2 px-2">
      {isAuthenticated ? (
        <>
          <NavLink href="/app" label="Dashboard" variant="outline"/>
          <LogoutButton>
            <Button variant="primary" className="w-full" aria-label="Sair">
              Sair
            </Button>
          </LogoutButton>
        </>
      ) : (
        <>
          <NavLink href="/auth/login" label="Entrar" variant="outline" />
          <NavLink href="/auth/signup" label="Registre-se" variant="primary" />
        </>
      )}
    </div>
  );
};

export default NavbarButtons;
