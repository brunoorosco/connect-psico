import { MessageCircle } from "lucide-react";

export default async function LayoutPublic({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <a
        href="https://wa.me/5511940714391?text=Ol%C3%A1%21%20Gostaria%20de%20saber%20mais%20sobre%20os%20servi%C3%A7os%20da%20PsicoMais."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-green-600 transition-all"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline">Atendimento</span>
      </a>
    </>
  );
}
