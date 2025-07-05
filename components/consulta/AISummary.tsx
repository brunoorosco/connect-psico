import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { File } from "lucide-react";

const mockSummary = [
  "Paciente tem demonstrado progresso constante nas últimas sessões.",
  "Melhorias notáveis na capacidade de lidar com situações de estresse no ambiente de trabalho.",
  "Aplicação consistente das técnicas de mindfulness ensinadas nas sessões anteriores.",
  "Redução significativa nos episódios de ansiedade relatados desde o início do tratamento."
];

export const AiSummary = () => (
  <Card className="mb-6 therapy-card">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg font-medium text-therapy-tertiary flex items-center">
        <File className="h-4 w-4 mr-2" />
        Resumo IA - Evolução do Paciente
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="bg-therapy-light/30 p-3 rounded-lg text-sm">
        <ul className="list-disc list-inside space-y-1">
          {mockSummary.map((item, index) => (
            <li key={index} className="text-gray-700">{item}</li>
          ))}
        </ul>
      </div>
    </CardContent>
  </Card>
);
