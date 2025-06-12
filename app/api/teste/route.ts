import { getMessages } from "@/actions/messages/getMessages";
import { sendEmail } from "@/infra/email/sendEmail";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    
  const email = await sendEmail({
    subject: "teste email",
    to: req.nextUrl.searchParams.get("email") || "brunoorosco@gmail.com",
    text: "teste testetete",
    html: "teste",
  });
  // const resp = await getMessages();
  console.log(email);
  return NextResponse.json({
    email,
  });
};
