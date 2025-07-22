import { NextRequest, NextResponse } from "next/server"
import { addScheduleVideoCall } from "@/actions/scheduleVideo/addScheduleVideo"

export const GET = async (req: NextRequest) => {
 const resp =  await addScheduleVideoCall({
    scheduledAt: new Date(Date.now() + 1000 * 60 * 30), // daqui 30 minutos
    participantUserIds: ["cmcag78ct0000js04rrju8rgg", "cmd0ny5z10000k1043slk49nj"],
  })

  return NextResponse.json({
    message: resp,
  })
}
