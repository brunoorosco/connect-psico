import { z } from "zod"

export const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  code: z.optional(z.string()),
})

export const RegisterSchema = z
  .object({
    name: z.string().min(5),
    email: z.string().email(),
    password: z.string().min(6),
    numConselho: z.string().optional(),
    ufConselho: z.string().optional(),
    especialidade: z.string().optional(),
    website: z.string().optional(),
    publico: z.string().optional(),
    professional: z.coerce.boolean(),
    phone: z.string().min(14, "Número muito curto").max(15),
    noRegistration: z.boolean().default(false),
    // .regex(/^\(\d{2}\) 9\d{4}-\d{4}$/, "Número inválido"),
  })
  .superRefine((data, ctx) => {
    if (data.professional && !data.noRegistration) {
      if (!data.numConselho) {
        ctx.addIssue({
          code: "custom",
          path: ["numConselho"],
          message: "Informe o número do conselho ou marque que não possui.",
        })
      }
      if (!data.ufConselho) {
        ctx.addIssue({
          code: "custom",
          path: ["ufConselho"],
          message: "Informe a UF ou marque que não possui.",
        })
      }
    }
  })
// .refine(
//   (values) => {
//     console.log(`Values ${JSON.stringify(values)}`);
//     return values.password === values.matchPassword;
//   },
//   {
//     message: "Passwords must match!",
//     path: ["confirmPassword"],
//   }
// );

export const UserSettingsSchema = z
  .object({
    name: z.optional(z.string().min(5)),
    email: z.optional(z.string().email()),
    password: z.optional(z.string().min(6)),
    newPassword: z.optional(z.string().min(6)),
    isTwoFactorAuthEnabled: z.optional(z.boolean()),
  })
  .refine(
    (values) => {
      if (values.password && !values.newPassword) return false
      return true
    },
    {
      message: "Nova senha requerida",
      path: ["newPassword"],
    }
  )
  .refine(
    (values) => {
      if (values.newPassword && !values.password) return false
      return true
    },
    {
      message: "Senha requerida",
      path: ["password"],
    }
  )
// .refine(
// 	(values) => {
// 		return values.password && values.newPassword && values.password === values.newPassword;
// 	},
// 	{
// 		message: "Os campos de Senha e Nova senha devem coincidir",
// 		path: ["password"],
// 	},
// );

export const ResetPasswordSchema = z.object({
  email: z.string().email(),
})

export const NewPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "A senha deve ter no mínimo 8 caracteres" })
      .regex(/[a-z]/, { message: "A senha deve conter pelo menos uma letra minúscula" })
      .regex(/[A-Z]/, { message: "A senha deve conter pelo menos uma letra maiúscula" })
      .regex(/[0-9]/, { message: "A senha deve conter pelo menos um número" }),
    confirmPassword: z.string().min(1, { message: "Confirme sua senha" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

export const MagicLinkSignInSchema = z.object({
  email: z.string().email(),
})
