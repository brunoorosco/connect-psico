import { getMessages } from "@/actions/messages/getMessages";
import { NextRequest, NextResponse } from "next/server";

export const GET = async(req: NextRequest) => {
    
    // const email = await sendEmail({})
    const resp = await getMessages();
    console.log(resp)
    return NextResponse.json({
            resp
})

}
