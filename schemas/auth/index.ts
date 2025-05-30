import { z } from "zod";

export const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  code: z.optional(z.string()),
});

export const RegisterSchema = z.object({
  name: z.string().min(5),
  email: z.string().email(),
  password: z.string().min(6),
  numConselho: z.string().optional(),
  ufConselho: z.string().optional(),
  especialidade: z.string().optional(),
  publico: z.string().optional(),
  professional: z.boolean(),
  phone: z.string(),
})
.superRefine((data, ctx) => {
  if (data.professional) {
    if (!data.ufConselho || data.ufConselho.length !== 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "UF do conselho é obrigatório e deve ter 2 caracteres.",
        path: ["ufConselho"],
      });
    }
    if (!data.numConselho || data.numConselho.length < 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Número do conselho é obrigatório e deve ter pelo menos 4 dígitos.",
        path: ["numConselho"],
      });
    }
  }
});
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
      if (values.password && !values.newPassword) return false;
      return true;
    },
    {
      message: "Nova senha requerida",
      path: ["newPassword"],
    }
  )
  .refine(
    (values) => {
      if (values.newPassword && !values.password) return false;
      return true;
    },
    {
      message: "Senha requerida",
      path: ["password"],
    }
  );
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
});

export const NewPasswordSchema = z.object({
  password: z.string().min(6),
});

export const MagicLinkSignInSchema = z.object({
  email: z.string().email(),
});
