import { getProfessionalByUsername } from "@/actions/users/getProfissionalsByUsername"
import { env } from "@/config/application"
import ProfessionalProfilePage from "@presentation/pages/professional/publicProfile"
import { Metadata } from "next"

type Props = {
  params: { name: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata | undefined> {
  const slug = params.name

  const profile = await getProfessionalByUsername(slug)
  if (!profile) return undefined
  return {
    title: `${profile.name} — PsicoMais`,
    description: profile?.bio,
    openGraph: {
      type: "profile",
      url: `${env.urlBase}/terapeutas/${slug}`,
      title: `${profile.name} — PsicoMais`,
      description: profile?.bio,
      images: [
        {
          url: profile.image as string,
          width: 1200,
          height: 630,
          alt: `Foto de ${profile.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${profile.name} — PsicoMais`,
      description: profile?.bio,
      images: [profile.image as string],
    },
  }
}

export default function PublicProfilePage() {
  return <ProfessionalProfilePage />
}
