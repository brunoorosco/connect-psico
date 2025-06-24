import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ProfessionalCheckProps {
  onNext: (isProfessional: boolean) => void;
}

const ProfessionalCheck: React.FC<ProfessionalCheckProps> = ({ onNext }) => {
  const [isProfessional, setIsProfessional] = useState<boolean | null>(null);

  const handleSubmit = () => {
    if (isProfessional !== null) {
      onNext(isProfessional);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Você é um profissional da saúde?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Esta informação nos ajuda a personalizar sua experiência na plataforma.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="professional-yes"
            checked={isProfessional === true}
            onCheckedChange={() => setIsProfessional(true)}
          />
          <Label htmlFor="professional-yes" className="cursor-pointer">
            Sim, sou um profissional da saúde
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="professional-no"
            checked={isProfessional === false}
            onCheckedChange={() => setIsProfessional(false)}
          />
          <Label htmlFor="professional-no" className="cursor-pointer">
            Não, sou paciente
          </Label>
        </div>
      </div>

      <Button 
        onClick={handleSubmit}
        disabled={isProfessional === null}
        className="w-full"
      >
        Continuar
      </Button>
    </div>
  );
};

export default ProfessionalCheck;