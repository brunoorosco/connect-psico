"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CreditCard, DollarSign, Calendar, User, Mail } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";

interface AppointmentData {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  appointment_type: {
    name: string;
    price: number;
  };
  patient: {
    name: string;
    email: string;
  };
  therapist: {
    name: string;
    email: string;
  };
}

const PatientPayment = () => {
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { toast } = useToast();
  const navigate = useRouter();
  // const session = useSession();

  useEffect(() => {
    const fetchAppointmentData = async () => {
      if (!appointmentId) {
        toast({
          title: "Erro",
          description: "ID da consulta não fornecido.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      //   try {
      //     const { data, error } = await supabase
      //       .from("appointments")
      //       .select(
      //         `
      //         id,
      //         appointment_date,
      //         start_time,
      //         end_time,
      //         status,
      //         appointment_type:appointment_type_id (name, price),
      //         patient:patient_id (name, email),
      //         therapist:therapist_id (name, email)
      //       `
      //       )
      //       .eq("id", appointmentId)
      //       .single();

      //     if (error) {
      //       throw error;
      //     }

      //     if (data) {
      //       setAppointmentData(data as AppointmentData);
      //     } else {
      //       toast({
      //         title: "Consulta não encontrada",
      //         description: "Não foi possível encontrar os detalhes da consulta.",
      //         variant: "destructive",
      //       });
      //     }
      //   } catch (error: any) {
      //     console.error("Erro ao buscar detalhes da consulta:", error);
      //     toast({
      //       title: "Erro",
      //       description: "Não foi possível carregar os detalhes da consulta.",
      //       variant: "destructive",
      //     });
      //   } finally {
      //     setLoading(false);
      //   }
    };

    fetchAppointmentData();
  }, [appointmentId, toast]);

  const handlePayment = () => {
    toast({
      title: "Pagamento efetuado",
      description: "O pagamento foi processado com sucesso!",
    });
    navigate.push("/appointments");
  };

  // if (loading) {
  //   return <div className="text-center">Carregando informações de pagamento...</div>;
  // }

  // if (!appointmentData) {
  //   return <div className="text-center">Detalhes da consulta não encontrados.</div>;
  // }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Pagamento</h2>
          <p className="text-muted-foreground">Detalhes do pagamento da sua consulta</p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Informações da Consulta</h3>
            <div className="text-muted-foreground">
              <p>
                <Calendar className="mr-2 inline-block h-4 w-4 align-middle" />
                Data: {/* {new Date(appointmentData?.appointment_date).toLocaleDateString()} */}
              </p>
              <p>
                <Calendar className="mr-2 inline-block h-4 w-4 align-middle" />
                Horário: {appointmentData?.start_time} - {appointmentData?.end_time}
              </p>
              <p>
                <User className="mr-2 inline-block h-4 w-4 align-middle" />
                Terapeuta: {appointmentData?.therapist?.name || "Terapeuta"}
              </p>
              <p>
                <Mail className="mr-2 inline-block h-4 w-4 align-middle" />
                Email do Terapeuta: {appointmentData?.therapist?.email || ""}
              </p>
              <p>
                <DollarSign className="mr-2 inline-block h-4 w-4 align-middle" />
                Valor da Consulta: R$ {appointmentData?.appointment_type.price}
              </p>
              <Badge variant="secondary">Status: {appointmentData?.status}</Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Informações de Pagamento</h3>
            <Select onValueChange={setPaymentMethod}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o método de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit-card">Cartão de Crédito</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === "credit-card" && (
            <div className="space-y-2">
              <Label htmlFor="card-number">Número do Cartão</Label>
              <Input id="card-number" placeholder="0000 0000 0000 0000" type="number" />
              <div className="flex space-x-2">
                <div className="w-1/2">
                  <Label htmlFor="expiry-date">Data de Expiração</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "MM/dd/yyyy") : <span>Selecione a data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center" side="bottom">
                      <DayPicker
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={{ before: new Date() }}
                        className="border-none shadow-md"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="w-1/2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" type="number" />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "paypal" && (
            <div className="text-center">
              <p className="text-muted-foreground">
                Você será redirecionado para o PayPal para completar o pagamento.
              </p>
            </div>
          )}

          {paymentMethod === "pix" && (
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Chave PIX: <Badge variant="secondary">chave_pix_aleatoria</Badge>
              </p>
              <p className="text-muted-foreground">
                Escaneie o código QR abaixo para efetuar o pagamento:
              </p>
              <div className="flex justify-center">
                <img
                  src="https://via.placeholder.com/150"
                  alt="Código QR PIX"
                  className="w-36 h-36"
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handlePayment}>
            Efetuar Pagamento
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PatientPayment;
