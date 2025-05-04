import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const GET = auth((req) => {
  return NextResponse.json({
    message: "Usuário Autenticado",
  });
});
