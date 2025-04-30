import React from "react";
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  Video,
  Globe,
  Plus,
  Trash2
} from "lucide-react";
import { useFormContext } from "react-hook-form";
import { MapPin } from "@/components/ui/map-pin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { toast } from "sonner";
import { ProfileFormValues, TimeInterval, weekdays } from "@/schemas/PsicologoProfileSchema";

export const AppointmentDetailsForm: React.FC = () => {
  const { control, watch, setValue } = useFormContext<ProfileFormValues>();
  const availableHours = watch("availableHours") || [];

  const addTimeInterval = () => {
    const newInterval: TimeInterval = {
      startTime: "08:00",
      endTime: "17:00"
    };
    setValue("availableHours", [...availableHours, newInterval]);
    toast.success("Intervalo de horário adicionado");
  };

  const removeTimeInterval = (index: number) => {
    if (availableHours.length <= 1) {
      toast.error("É necessário ter pelo menos um intervalo de horário");
      return;
    }
    
    const updatedIntervals = availableHours.filter((_, idx) => idx !== index);
    setValue("availableHours", updatedIntervals);
    toast.success("Intervalo de horário removido");
  };

  return (
    <Card className="therapy-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-therapy-tertiary" />
          <CardTitle>Disponibilidade e Consulta</CardTitle>
        </div>
        <CardDescription>
          Configure os detalhes sobre suas consultas e disponibilidade
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={control}
            name="sessionDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duração da consulta (minutos)</FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    <Slider
                      min={30}
                      max={120}
                      step={5}
                      value={[field.value]}
                      onValueChange={(vals) => field.onChange(vals[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>30 min</span>
                      <span>{field.value} min</span>
                      <span>120 min</span>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="sessionPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da consulta (R$)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      className="pl-9"
                      placeholder="150"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="appointmentType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo de atendimento</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="remote" id="remote" />
                    <FormLabel htmlFor="remote" className="font-normal flex items-center gap-1">
                      <Video className="h-4 w-4" /> Somente Remoto
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="presential" id="presential" />
                    <FormLabel htmlFor="presential" className="font-normal flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> Somente Presencial
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <FormLabel htmlFor="both" className="font-normal flex items-center gap-1">
                      <Globe className="h-4 w-4" /> Ambos
                    </FormLabel>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Collapsible className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Configuração de disponibilidade</h4>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm">Configurar horários</Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-4">
            <FormField
              control={control}
              name="availableDays"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Dias disponíveis</FormLabel>
                    <CardDescription>
                      Selecione os dias em que você está disponível para atendimento
                    </CardDescription>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {weekdays.map((day) => (
                      <FormField
                        key={day.value}
                        control={control}
                        name="availableDays"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={day.value}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(day.value)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, day.value])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== day.value
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {day.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base">Intervalos de horários</FormLabel>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addTimeInterval}
                >
                  <Plus className="h-4 w-4 mr-1" /> Adicionar intervalo
                </Button>
              </div>
              <CardDescription className="mb-4">
                Configure os intervalos de horários em que você estará disponível para atendimento
              </CardDescription>

              {availableHours.map((_, index) => (
                <div key={index} className="border rounded-md p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Intervalo {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTimeInterval(index)}
                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name={`availableHours.${index}.startTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horário inicial</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="time"
                                className="pl-9"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`availableHours.${index}.endTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horário final</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="time"
                                className="pl-9"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};