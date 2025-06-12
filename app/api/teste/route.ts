import { sendEmail } from "@/infra/email/sendEmail";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    
  const email = await sendEmail({
    from: "'Bruno Orosco' <brunoorosco@gmail.com>",
    subject: "teste email",
    to: req.nextUrl.searchParams.get("email") || "brunoorosco@gmail.com",
    text: "teste testetete",
    html: "teste",
  });
  return NextResponse.json({
    email,
  });
};
