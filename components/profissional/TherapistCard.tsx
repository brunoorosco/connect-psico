import { MessageCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Button from "../shared/Button";
import { ProfessionalModel } from "@/domain/model/professional";

export type TProfessionalParams = {
  professional: ProfessionalModel;
  onSelect: () => void;
};


export const ProfessionalCard = ({ professional, onSelect }: TProfessionalParams) => {
  return (
    <Card
      className="hover:shadow-lg transition-shadow h-full flex flex-col justify-between"
      // onClick={onSelect}
    >
      <CardHeader>
        <div className="flex items-center gap-4">
          <img
            src={professional.image as string}
            alt={professional.name}
            className="w-18 h-18 bg-slate-300 rounded-full object-cover"
          />
          <div>
            <h3 className="text-lg font-semibold">{professional.name}</h3>
            <p className="text-sm text-muted-foreground">
              {professional?.publicoAlvo?.join(", ")}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col justify-between flex-grow">
        <p className="text-sm mb-4">
          {(professional?.bio || "").slice(0, 120)}
          {professional?.bio?.length > 120 && "..."}
        </p>

        <div className="mt-auto flex items-center justify-between pt-3 border-t">
          <span className="font-semibold">
          {(Number(professional?.valorAtendimento) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / sessão
          </span>
          <Button variant="primary" size="sm" onClick={onSelect} className="cursor-pointer">
            <MessageCircle className="w-4 h-4 mr-2" />
            Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

