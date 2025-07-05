import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { IClinicalEvolution } from "./types";

export const ClinicalEvolution = ({ value, onChange }: IClinicalEvolution) => (
  <Card className="mb-6">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg font-medium text-therapy-tertiary">
        Evolução Clínica
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Textarea
        placeholder="Digite suas observações sobre a consulta atual..."
        className="min-h-[150px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </CardContent>
  </Card>
);
