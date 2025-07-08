import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import * as z from "zod";
import { Consultation } from "@/domain/model/consultation";
import createConsultation from "@/actions/consultation/addConsultation";

const schema = z.object({
  patientId: z.number(),
  notes: z.string(),
  prescription: z.string().optional(),
  professionalId: z.string(),
});

export type ConsultationFormData = z.infer<typeof schema>;

interface UseConsultationFormProps {
  notePatient?: Consultation | null;
  onSubmit?: (data: Omit<Consultation, "id" | "createdAt">) => void;
}

export function useConsultationForm({ notePatient, onSubmit }: UseConsultationFormProps) {
  const { data: session } = useSession();

  const form = useForm<ConsultationFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      notes: notePatient?.notes || "",
      patientId: notePatient?.patientId ?? 0,
      prescription: notePatient?.prescription || "",
      professionalId: session?.user?.id || "",
    },
  });

  const handleSubmit = async (data: ConsultationFormData) => {
    try {
      await createConsultation(data);
      toast.success("Consulta finalizada com sucesso!");
      form.reset();

      if (onSubmit) {
        onSubmit(data); // chama callback opcional
      }
    } catch (error) {
      toast.error("Erro ao salvar consulta.");
      console.error("Erro ao salvar consulta:", error);
    }
  };

  return { form, handleSubmit };
}
