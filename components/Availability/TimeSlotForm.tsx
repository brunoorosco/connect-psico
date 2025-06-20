import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { TimeSlot } from '@/pages/availability';

interface TimeSlotFormProps {
  onAddTimeSlot: (timeSlot: Omit<TimeSlot, 'id'>) => void;
}

const TimeSlotForm: React.FC<TimeSlotFormProps> = ({ onAddTimeSlot }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted', e);
    
    if (!startTime || !endTime) return;
    
    if (startTime >= endTime) {
      alert('O horário inicial deve ser anterior ao horário final');
      return;
    }

    onAddTimeSlot({
      startTime,
      endTime
    });

    // Limpar o formulário
    setStartTime('');
    setEndTime('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start-time-modal">Horário inicial</Label>
          <Input
            id="start-time-modal"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="end-time-modal">Horário final</Label>
          <Input
            id="end-time-modal"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        variant="outline" 
        className="w-full"
        disabled={!startTime || !endTime}
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Horário
      </Button>
    </form>
  );
};

export default TimeSlotForm;
