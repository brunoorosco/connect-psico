import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, DollarSign, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { ProfessionalModel } from "@/domain/model/professional";

interface ProfessionalCardProps {
  professional: ProfessionalModel;
  onShowDetails: (professional: ProfessionalModel) => void;
}

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  professional,
  onShowDetails,
}) => {
  return (
    <Card className="therapy-card hover:scale-[1.01] transition-transform cursor-pointer overflow-hidden">
      <div 
        className="relative h-48 bg-cover bg-center"
        style={{ backgroundImage: `url(${professional.image || '/placeholder.svg'})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <h3 className="text-xl font-semibold">{professional.name}</h3>
          <p className="text-sm opacity-90">{professional.especialidade.join(", ")}</p>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-therapy-primary" />
            <p className="text-sm text-gray-600 flex-1">
              <span className="font-medium">{professional.experiencia}</span> anos de experiência
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-therapy-primary" />
            <p className="text-sm text-gray-600">
              <span className="font-medium">R${professional.valorAtendimento}</span>/sessão
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-therapy-primary" />
            <p className="text-sm text-gray-600">
              <span className="font-medium">{45}</span> minutos
            </p>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mt-2">
            {professional.abordagem}
          </p>
          
          <Button 
            onClick={() => onShowDetails(professional)} 
            className="w-full mt-3 bg-therapy-primary hover:bg-therapy-tertiary"
          >
            Ver detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfessionalCard;