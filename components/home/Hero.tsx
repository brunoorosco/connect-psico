
import Link from "next/link";
import Button from "../shared/Button";
import { env } from "@/config/application";

// const Hero = () => {
//   return (
//     <section className="relative overflow-hidden bg-gradient-to-br from-white via-therapy-light/30 to-therapy-light/50 py-16 md:py-24 lg:py-32">
//       <div className="absolute inset-0 z-0 overflow-hidden">
//         <div className="absolute -right-96 -top-96 h-[500px] w-[500px] rounded-full bg-therapy-blue-calm/10 blur-3xl"></div>
//         <div className="absolute -bottom-96 -left-96 h-[600px] w-[600px] rounded-full bg-therapy-green-heal/10 blur-3xl"></div>
//       </div>
      
//       <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
//           <div className="lg:w-1/2 lg:pr-12">
//             <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-therapy-dark leading-tight">
//               Cuidado psicológico <span className="text-therapy-primary">acessível</span> e <span className="text-therapy-primary">personalizado</span>
//             </h1>
//             <p className="mt-6 text-lg text-therapy-dark/80 max-w-2xl text-balance">
//               Conectamos você aos melhores profissionais de psicologia, oferecendo suporte para sua saúde mental de forma simples e eficaz. Consultas online ou presenciais com psicólogos qualificados.
//             </p>
//             <div className="mt-10 flex flex-col sm:flex-row gap-4">
//               <Link href="/find-therapist">
//                 <Button size="lg">Encontrar um Terapeuta</Button>
//               </Link>
//               <Link href="/how-it-works">
//                 <Button variant="outline" size="lg">Como Funciona</Button>
//               </Link>
//             </div>
            
//             <div className="mt-10 flex items-center space-x-4">
//               <div className="flex -space-x-2">
//                 {[1, 2, 3, 4, 5].map((i) => (
//                   <div key={i} className={`h-10 w-10 rounded-full border-2 border-white bg-therapy-light flex items-center justify-center text-therapy-primary/70 font-medium`}>
//                     {String.fromCharCode(64 + i)}
//                   </div>
//                 ))}
//               </div>
//               <div>
//                 <div className="text-sm font-medium text-therapy-dark">Mais de 1.200+ profissionais</div>
//                 <div className="text-xs text-therapy-dark/70">Prontos para ajudar você</div>
//               </div>
//             </div>
//           </div>
          
//           <div className="mt-12 lg:mt-0 lg:w-1/2 rounded-2xl overflow-hidden shadow-xl">
//             <div className="bg-white p-1 rounded-2xl shadow-inner">
//               <div className="aspect-[4/3] bg-therapy-light/30 rounded-xl overflow-hidden relative">
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <div className="text-center p-8">
//                     <div className="w-20 h-20 rounded-full bg-therapy-primary/20 mx-auto flex items-center justify-center">
//                       <div className="w-16 h-16 rounded-full bg-therapy-primary/30 flex items-center justify-center">
//                         <div className="w-12 h-12 rounded-full bg-therapy-primary flex items-center justify-center text-white">
//                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
//                             <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
//                           </svg>
//                         </div>
//                       </div>
//                     </div>
//                     <p className="mt-4 text-therapy-dark font-medium">Veja como funciona a plataforma</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Hero;


const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-psychology-dark pt-16">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white dark:bg-psychology-dark sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <svg
            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white dark:text-psychology-dark transform translate-x-1/2"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>

          <div className="pt-16 mx-auto max-w-7xl px-4 sm:pt-24 sm:px-6 lg:px-8">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                <span className="block xl:inline">{`${env.applicationName}`}</span>{' '}
                <span className="block text-psychology-primary xl:inline">Cuidado psicológico acessível e personalizado</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 dark:text-gray-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto lg:mx-0 md:mt-5 md:text-xl">
              Conectamos você aos melhores profissionais de psicologia, oferecendo suporte para sua saúde mental de forma simples e eficaz. Consultas online ou presenciais com psicólogos qualificados.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Link href="/auth/signup">
                    <Button size="lg" className="w-full">Registra-se Já</Button>
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link href="/professionals">
                    <Button variant="outline" size="lg" className="w-full">Encontre um Profissional</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
          alt="Therapist consultation"
        />
      </div>
    </div>
  );
};
export default Hero;