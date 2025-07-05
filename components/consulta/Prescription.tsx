import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { IPrescription } from "./types";

export const Prescription = ({ value, onChange }: IPrescription) => (
  <Card className="mb-6">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg font-medium text-therapy-tertiary">
        Receituário
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Textarea
        placeholder="Digite as recomendações e receitas se necessário..."
        className="min-h-[100px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </CardContent>
  </Card>
);