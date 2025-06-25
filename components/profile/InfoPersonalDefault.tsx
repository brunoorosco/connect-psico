import React, { useRef } from "react";
import { UploadCloud, User } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ProfileFormValues } from "@/schemas/PsicologoProfileSchema";
import { uploadImageToCloudinary } from "@/services/cloudinaryService/uploadImage";
import { User as UserModel } from "@/domain/model/user";

type Props = {
  profile: UserModel;
};

export const UserInfoForm = ({ profile }: Props) => {
  const { control } = useFormContext<ProfileFormValues>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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
      <CardContent className="space-y-2">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input placeholder="João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4">
              <div className="w-3/4">
                <FormField
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="seu.email@exemplo.com" {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
            </div>
          </div>
          <div className="flex flex-col items-center ">
            <FormField
              control={control}
              name="profilePhoto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="">Foto de perfil</FormLabel>
                  <FormControl>
                    <div>
                      <label
                        onClick={() => fileInputRef.current?.click()}
                        className="w-32 h-32 rounded-full border flex items-center justify-center cursor-pointer hover:opacity-80 transition"
                      >
                        {typeof field.value === "string" && field.value ? (
                          <img
                            src={field.value}
                            alt="Preview da imagem"
                            className="w-32 h-32 object-cover rounded-full"
                          />
                        ) : (
                          <UploadCloud className="w-10 h-10 text-gray-400" />
                        )}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await uploadImageToCloudinary(file, profile.id as string);
                            field.onChange(url); // ✅ Agora sim, salva no form uma URL pública
                          }
                        }}
                        className="hidden"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
