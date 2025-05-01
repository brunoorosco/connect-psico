
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
import { audiences, ProfileFormValues } from "@/schemas/PsicologoProfileSchema";

export const TargetAudienceForm: React.FC = () => {
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
          name="targetAudience"
          render={() => (
            <FormItem>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {audiences.map((audience) => (
                  <FormField
                    key={audience}
                    control={control}
                    name="targetAudience"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={audience}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(audience)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, audience])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== audience
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {audience}
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
      </CardContent>
    </Card>
  );
};