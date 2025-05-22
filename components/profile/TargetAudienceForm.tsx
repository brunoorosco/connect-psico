import React from "react";
import { Users } from "lucide-react";
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
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { publicoAlvo, ProfileFormValues } from "@/schemas/PsicologoProfileSchema";
import { ProfessionalModel } from "@/domain/model/professional";

type Props = {
  profile: ProfessionalModel;
}
export const TargetAudienceForm = ({profile}:Props) => {
  const { control } = useFormContext<ProfileFormValues>();

  return (
    <Card className="therapy-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-therapy-tertiary" />
          <CardTitle>Público Alvo</CardTitle>
        </div>
        <CardDescription>
          Defina quais públicos você atende
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="publicoAlvo"
          render={({ field }) => (
            <FormItem>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {publicoAlvo.map((audience) => (
                  <FormItem
                    key={audience}
                    className="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <Checkbox
                        checked={(field.value ?? []).includes(audience)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...(field.value ?? []), audience])
                          } else {
                            field.onChange(
                              (field.value ?? []).filter((v) => v !== audience)
                            )
                          }
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {audience}
                    </FormLabel>
                  </FormItem>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
