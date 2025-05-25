import { getAvailableDaysWithStatus } from "@/actions/availability/getAvailabilityByMonth";
import { NextResponse } from "next/server";

function convertBigIntToString(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  } else if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, convertBigIntToString(value)])
    );
  } else if (typeof obj === "bigint") {
    return obj.toString();
  } else {
    return obj;
  }
}

const formatTime = (date: Date) => date.toISOString().substring(11, 16);

export const GET = async (request: Request) => {
  try {
    const resp = await getAvailableDaysWithStatus("user_1", 2025, 5, 60);
    console.log(resp);
    const novosHorarios = resp?.map((horario: any) => ({
      ...horario,
      date: new Date(horario.date).toString(),
      start_time: formatTime(horario.start_time),
      end_time: formatTime(horario.end_time),
    }));

    const safeResp = convertBigIntToString(novosHorarios);
    return NextResponse.json(
      {
        message: safeResp,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: error,
      },
      { status: 500 }
    );
  }
};
