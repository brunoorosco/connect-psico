import { useState } from "react";
import { ProfessionalCard } from "./ProfessionalCard";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Mock data - replace with real data later
const professionals = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Clinical Psychology",
    rating: 4.8,
    imageUrl: "/placeholder.svg",
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Psychoanalysis",
    rating: 4.9,
    imageUrl: "/placeholder.svg",
  },
  {
    id: 3,
    name: "Dr. Emma Wilson",
    specialty: "Cognitive Behavioral Therapy",
    rating: 4.7,
    imageUrl: "/placeholder.svg",
  },
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSchedule = (professionalId: number) => {
    console.log("Scheduling with professional:", professionalId);
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-white to-gray-50 px-4 py-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-12 text-center'>
          <h1 className='mb-4 text-4xl font-bold text-gray-900 animate-fade-up'>
            Find Your Perfect Match in Mental Health Care
          </h1>
          <p className='mx-auto mb-8 max-w-2xl text-gray-600 animate-fade-up'>
            Connect with top psychology and psychoanalysis professionals
            tailored to your needs
          </p>
          <div className='relative mx-auto mb-12 max-w-xl animate-fade-up'>
            <Search className='absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
            <Input
              type='text'
              placeholder='Search by name or specialty...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-12 pr-4 py-3 text-gray-900 rounded-full border-gray-200 focus:border-primary focus:ring-primary'
            />
          </div>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {professionals.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              {...professional}
              onSchedule={() => handleSchedule(professional.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
