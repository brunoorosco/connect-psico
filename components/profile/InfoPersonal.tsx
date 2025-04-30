import React from "react";
import { User } from "lucide-react";
import { useFormContext } from "react-hook-form";
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
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProfileFormValues } from "@/schemas/PsicologoProfileSchema";

export const PersonalInfoForm: React.FC = () => {
  const { control } = useFormContext<ProfileFormValues>();

  return (
    <Card className="therapy-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-therapy-tertiary" />
          <CardTitle>Dados Pessoais</CardTitle>
        </div>
        <CardDescription>
          Informações básicas sobre você que serão exibidas no seu perfil
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <Input placeholder="Dr. João Silva" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="joao.silva@exemplo.com" {...field} />
                </FormControl>
                <FormDescription>
                  Email para contato profissional
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="(11) 99999-9999" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="profilePhoto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Foto de perfil</FormLabel>
                <FormControl>
                  <Input type="file" accept="image/*" onChange={(e) => {
                    field.onChange(e.target.value);
                  }} />
                </FormControl>
                <FormDescription>
                  Recomendado: 400x400px
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biografia</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Fale um pouco sobre você, sua abordagem e experiência..."
                  className="min-h-24"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Esta descrição será exibida publicamente em seu perfil
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
