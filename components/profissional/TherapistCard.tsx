
import { MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TherapistCardProps {
  therapist: {
    id: string;
    name: string;
    specialty: string;
    image: string;
    bio: string;
    price: string;
  };
  onSelect: () => void;
}

export const TherapistCard = ({ therapist, onSelect }: TherapistCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onSelect}>
      <CardHeader>
        <div className="flex items-center gap-4">
          <img
            src={therapist.image}
            alt={therapist.name}
            className="w-16 h-16 bg-slate-300 rounded-full object-cover"
          />
          <div>
            <h3 className="text-lg font-semibold">{therapist.name}</h3>
            <p className="text-sm text-muted-foreground">{therapist.specialty}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4">{therapist.bio}</p>
        <div className="flex items-center justify-between">
          <span className="font-semibold">{therapist.price} / sessão</span>
          <Button variant="outline" size="sm">
            <MessageCircle className="w-4 h-4 mr-2" />
            Conversar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
