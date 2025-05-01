'use client'
import { useState } from 'react'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, ExternalLink } from 'lucide-react'
import PsychologistProfile from '@/components/PsychoProfile'
import Link from 'next/link'

const Index = () => {
	const [selectedPsychologist, setSelectedPsychologist] = useState<
		number | null
	>(null)

	return (
		<div className="min-h-screen from-primary-light to-white p-4 md:p-8">
			<div className="max-w-full mx-auto">
				<h1 className="text-3xl font-bold text-center mb-8 text-primary-dark">
					Encontre seu Psicólogo
				</h1>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{psychologists.map(psych => (
						<Link href={`./professional/${psych.id}`}>
							<Card
								key={psych.id}
								className="p-6 backdrop-blur-sm bg-card/90 hover:shadow-lg transition-all duration-300 cursor-pointer group"
								//   onClick={() => setSelectedPsychologist(psych.id)}
							>
								<div className="flex items-start gap-4">
									<div className="relative">
										<img
											src={psych.image}
											alt={psych.name}
											className="w-20 h-20 rounded-full object-cover border-2 border-primary"
										/>
										<Badge className="absolute -top-2 -right-2 bg-primary text-white">
											<Star className="w-3 h-3 mr-1" />
											{psych.rating}
										</Badge>
									</div>
									<div className="flex-1">
										<div className="flex items-start justify-between">
											<h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
												{psych.name}
											</h2>
											<ExternalLink className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
										</div>
										<p className="text-sm text-gray-600 mb-3 line-clamp-2">
											{psych.bio}
										</p>
										<div className="flex flex-wrap gap-2">
											{psych.specialties.slice(0, 2).map(specialty => (
												<Badge
													key={specialty.id}
													className="bg-accent text-primary-dark"
												>
													{specialty.name}
												</Badge>
											))}
											{psych.specialties.length > 2 && (
												<Badge variant="outline">
													+{psych.specialties.length - 2}
												</Badge>
											)}
										</div>
									</div>
								</div>
								<div className="mt-4 grid grid-cols-2 gap-4 text-sm">
									<div className="text-center p-2 bg-primary/5 rounded-md">
										<p className="font-semibold text-primary-dark">
											Experiência
										</p>
										<p className="text-gray-600">{psych.experience}</p>
									</div>
									<div className="text-center p-2 bg-primary/5 rounded-md">
										<p className="font-semibold text-primary-dark">Valor</p>
										<p className="text-gray-600">{psych.price}</p>
									</div>
								</div>
							</Card>
						</Link>
					))}
				</div>
			</div>
		</div>
	)
}

export default Index
