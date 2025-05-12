import { MessageCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Button from "../shared/Button";

export type TProfessionalParams = {
  professional: ProfessionalModel;
  onSelect: () => void;
};
export type ProfessionalModel = {
  id: string;
  name: string;
  image: string;
  Professional: Professional[];
};
type Professional = {
  especialidade: string[];
  abordagem: string;
  bio: string;
  valorAtendimento: string;
  education: string;
  publicoAlvo: string;
  numConselho: string;
  ufConselho: string;
};

export const ProfessionalCard = ({ professional, onSelect }: TProfessionalParams) => {
  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col justify-between"
      onClick={onSelect}
    >
      <CardHeader>
        <div className="flex items-center gap-4">
          <img
            src={professional.image}
            alt={professional.name}
            className="w-16 h-16 bg-slate-300 rounded-full object-cover"
          />
          <div>
            <h3 className="text-lg font-semibold">{professional.name}</h3>
            <p className="text-sm text-muted-foreground">
              {professional?.Professional[0]?.publicoAlvo}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col justify-between flex-grow">
        <p className="text-sm mb-4">
          {(professional.Professional[0]?.bio || "").slice(0, 120)}
          {professional.Professional[0]?.bio?.length > 120 && "..."}
        </p>

        <div className="mt-auto flex items-center justify-between pt-3 border-t">
          <span className="font-semibold">
            R$ {professional.Professional[0]?.valorAtendimento} / sessão
          </span>
          <Button variant="outline" size="sm">
            <MessageCircle className="w-4 h-4 mr-2" />
            Conversar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
