"use server";

import { prisma } from "@/lib/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const getAvailableDaysWithStatus = async (
  professionalId: string,
  year: number,
  month: number,
  durationPerSlotMinutes: number = 60
) => {
  console.log("getAvailableDaysWithStatus called with:", {
    professionalId,
    year,
    month,
    durationPerSlotMinutes,
  });
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const result = await prisma.$queryRaw`
    WITH availability_slots AS (
      SELECT
        a.start_time::date AS date,
        a.start_time::time AS start_time,
        a.end_time::time AS end_time,
        (EXTRACT(EPOCH FROM (a.end_time - a.start_time)) / 60) AS total_minutes,
        FLOOR((EXTRACT(EPOCH FROM (a.end_time - a.start_time)) / 60) / ${durationPerSlotMinutes}) AS total_slots
      FROM
        availabilities a
      WHERE
        a.professional_id = ${professionalId}
        AND a.is_available = TRUE
        AND a.start_time::date BETWEEN ${startDate} AND ${endDate}
    ),
    appointments_count AS (
      SELECT
        DATE(appointment_date) AS appointment_day,
        COUNT(*) AS total_appointments
      FROM
        appointments
      WHERE
        professional_id = ${professionalId}
        AND appointment_date >= ${startDate}
        AND appointment_date <= ${endDate}
      GROUP BY
        DATE(appointment_date)
    )
    SELECT 
      av.date,
      av.start_time,
      av.end_time,
      av.total_minutes,
      av.total_slots,
      COALESCE(ac.total_appointments, 0) AS appointments_made,
      CASE 
        WHEN COALESCE(ac.total_appointments, 0) < av.total_slots THEN TRUE
        ELSE FALSE
      END AS is_available
    FROM
      availability_slots av
      LEFT JOIN appointments_count ac ON ac.appointment_day = av.date
    ORDER BY
      av.date, av.start_time;
  `;
  console.log(result);
    return result;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return { error: "Erro ao buscar disponibilidades" };
    }

    throw error;
  }
};
