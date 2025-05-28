"use server";

import { auth } from "@/auth";
import { ButtonStartClient } from "./client";
import { redirect } from "next/navigation";

export async function ButtonStartWrapper({ id }: { id: string }) {
  const session = await auth();
  if (!session) {
    return redirect("/");
  }

  return <ButtonStartClient id={id} userId={session?.user.id as string} />;
}
