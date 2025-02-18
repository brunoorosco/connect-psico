import { Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfessionalCardProps {
  name: string;
  specialty: string;
  rating: number;
  imageUrl: string;
  onSchedule: () => void;
}

export const ProfessionalCard = ({
  name,
  specialty,
  rating,
  imageUrl,
  onSchedule,
}: ProfessionalCardProps) => {
  return (
    <div className='group relative overflow-hidden rounded-lg bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl animate-fade-up'>
      <div className='flex items-start gap-4'>
        <div className='h-16 w-16 overflow-hidden rounded-full'>
          <img
            src={imageUrl}
            alt={name}
            className='h-full w-full object-cover'
          />
        </div>
        <div className='flex-1'>
          <h3 className='text-lg font-semibold text-gray-900'>{name}</h3>
          <p className='text-sm text-gray-600'>{specialty}</p>
          <div className='mt-2 flex items-center gap-1'>
            <Star className='h-4 w-4 text-yellow-400' />
            <span className='text-sm text-gray-600'>{rating.toFixed(1)}</span>
          </div>
        </div>
        <Button
          onClick={onSchedule}
          className='flex items-center gap-2 bg-primary hover:bg-primary-hover transition-colors'
        >
          <Calendar className='h-4 w-4' />
          <span>Agendar</span>
        </Button>
      </div>
    </div>
  );
};
