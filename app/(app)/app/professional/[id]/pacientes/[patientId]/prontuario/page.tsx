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

import { toast } from "sonner";
import { startAsyncTranscription } from "@/services/consultationService";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { useCurrentUser } from "@hooks/use-current-user";

export default function ProntuarioPage() {
  const { patientId } = useParams() as { patientId: string };
  const user = useCurrentUser();
  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<number | null>(null);

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

  const handleGenerateSummary = async (apt: any) => {
    if (!apt.summaryIdMongo || !user?.id) return;

    setGeneratingId(apt.id);
    try {
      // Utiliza notes (transcrição) e summaryIdMongo (sessionId) para gerar resumo
      await startAsyncTranscription(
        apt.summaryIdMongo,
        undefined,
        "pt-BR",
        user.id,
        patientId,
        apt.notes
      );
      toast.success("Gerando resumo...", {
        description: "Você será notificado quando estiver pronto."
      });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao solicitar resumo.");
    } finally {
      setGeneratingId(null);
    }
  };

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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                Consulta em {format(new Date(apt.appointmentDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1"><strong>Profissional:</strong> {apt.professional?.name ?? "Não informado"}</p>
                <Separator className="my-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-lg">Evolução Clínica / Transcrição</p>
                  {/* Botão Gerar Resumo se tiver transcrição e não tiver resumo/prescrição */}
                  {apt.summaryIdMongo && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateSummary(apt)}
                      disabled={generatingId === apt.id}
                    >
                      {generatingId === apt.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                      )}
                      Gerar Resumo com IA
                    </Button>
                  )}
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md border text-sm whitespace-pre-line max-h-64 overflow-y-auto">
                  {apt.notes || "Sem anotações"}
                </div>
              </div>

              <div>
                <p className="font-semibold text-lg mb-2">Resumo / Prescrição</p>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md border text-sm whitespace-pre-line">
                  {apt.prescription || "Sem prescrição/resumo disponível."}
                </div>
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
