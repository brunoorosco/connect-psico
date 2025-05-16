'use server'

import { PsychologistProfileProps } from '@/components/PsychoProfile'
import { prisma } from '@/lib/db'

export const professionalById = async (id: string): Promise<any> => {
	const professional = await prisma.user.findFirst({
		where: { id: 'cm7ay7v7800010dl881sy8dv5' },
		omit: {
			password: true,
			emailVerified: true,
			isTwoFactorAuthEnabled: true,
			twoFactorAuthVerified: true,
		},
		include: {
			Professional: {
				include: {
					Comentarios: true,
				},
			},
		},
	})
	if (!professional) {
		return { error: 'Usuário não encontrado' }
	}

	return professional
}
