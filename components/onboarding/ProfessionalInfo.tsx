import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { ufCRP } from '@/utils/ufCRP';

interface ProfessionalInfoProps {
  onNext: (data: { numberConselho: string; ufConselho: string }) => void;
  isLoading: boolean;
}

const ProfessionalInfo: React.FC<ProfessionalInfoProps> = ({ onNext, isLoading }) => {
  const [numberConselho, setNumberConselho] = useState('');
  const [ufConselho, setUfConselho] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numberConselho && ufConselho) {
      onNext({ numberConselho, ufConselho });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Informações Profissionais</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Para validar seu perfil profissional, precisamos de algumas informações.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="registration">Registro Profissional</Label>
          <Input
            id="registration"
            type="text"
            maxLength={6}
            placeholder="123456"
            value={numberConselho}
            onChange={(e) => setNumberConselho(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Informe seu número de registro profissional (CRP ou equivalente).
          </p>
        </div>

        <div>
          <Label htmlFor="state">Estado</Label>
          <Select value={ufConselho} onValueChange={setUfConselho} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione seu estado" />
            </SelectTrigger>
            <SelectContent>
              {ufCRP.map((stateCode) => (
                <SelectItem key={stateCode} value={stateCode}>
                  CRP - {stateCode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          type="submit"
          disabled={!numberConselho || !ufConselho || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Finalizando...
            </>
          ) : (
            'Finalizar Cadastro'
          )}
        </Button>
      </form>
    </div>
  );
};

export default ProfessionalInfo;