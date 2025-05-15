
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Appointment {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  appointment_types: {
    name: string;
    price: number;
  };
  therapist: {
    name: string;
    image_url?: string;
  };
  status: string;
}

interface AppointmentSummaryProps {
  appointment: Appointment | null;
}

const AppointmentSummary = ({ appointment }: AppointmentSummaryProps) => {
  if (!appointment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            Nenhuma consulta selecionada
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
              {appointment.therapist?.image_url ? (
                <img 
                  src={appointment.therapist.image_url} 
                  alt={appointment.therapist.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                  {appointment.therapist?.name?.charAt(0) || 'T'}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium">{appointment.therapist?.name}</h3>
              <p className="text-sm text-muted-foreground">{appointment.appointment_types?.name}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Data:</span>
              <span className="font-medium">
                {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Horário:</span>
              <span className="font-medium">
                {appointment.start_time.substring(0, 5)} - {appointment.end_time.substring(0, 5)}
              </span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>R$ {appointment.appointment_types?.price?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentSummary;
