"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPatientByUserId } from "@/actions/patients/getPatientByUserId";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getAppointmentsByUserId } from "@/actions/appointments";

export default function ProntuarioPage() {
  const { patientId } = useParams() as { patientId: string };
  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, apts] = await Promise.all([
          getPatientByUserId(patientId),
          getAppointmentsByUserId({ userId: patientId }),
        ]);
        setPatient(p);
        setAppointments(apts.data);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Prontuário Médico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Nome:</strong> {patient?.name}</p>
          <p><strong>Data de nascimento:</strong> {patient?.birthDate}</p>
          <p><strong>Sexo:</strong> {patient?.gender}</p>
          <p><strong>Telefone:</strong> {patient?.phone}</p>
        </CardContent>
      </Card>

      {appointments.length > 0 ? (
        appointments.map((apt, index) => (
          <Card key={apt.id} className="border-l-4 border-blue-500">
            <CardHeader>
              <CardTitle>
                Consulta em {format(new Date(apt.appointmentDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Profissional:</strong> {apt.professional?.name ?? "Não informado"}</p>
              <Separator />
              <div>
                <p className="font-semibold">Evolução Clínica:</p>
                <p className="whitespace-pre-line">{apt.notes || "Sem anotações"}</p>
              </div>
              <div>
                <p className="font-semibold">Prescrição:</p>
                <p className="whitespace-pre-line">{apt.prescription || "Sem prescrição"}</p>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center text-gray-500">Nenhuma informação clínica registrada.</div>
      )}
    </div>
  );
}
