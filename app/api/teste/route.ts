import { getMessages } from "@/actions/messages";
import { NextRequest, NextResponse } from "next/server";

export const GET = async(req: NextRequest) => {
    const resp = await getMessages("user_1");
    console.log(resp)
    return NextResponse.json({
            resp
})

}
