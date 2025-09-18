import React from 'react';
import { Shield } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { env } from '@/config/application';

const PrivacyPolicy = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-4xl font-bold">Política de Privacidade</h1>
          </div>
          
          <p className="text-gray-600 mb-8 text-center">
            Última atualização: 1 de Maio de 2025
          </p>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introdução</h2>
            <p>
              {`A ${env.applicationName} está comprometida em proteger sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, divulgamos, transferimos e armazenamos suas informações pessoais quando você utiliza nossa plataforma.`}
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Informações que Coletamos</h2>
            <p>
              Para fornecer e melhorar nossos serviços, coletamos os seguintes tipos de informações:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Informações de Registro:</strong> Nome, endereço de e-mail, número de telefone e informações de contato semelhantes.</li>
              <li><strong>Informações do Perfil:</strong> Foto de perfil, biografia, especialidades (para profissionais) e outras informações que você decide compartilhar em seu perfil.</li>
              <li><strong>Informações de Sessão:</strong> Dados sobre suas sessões de terapia, incluindo agendamentos e notas.</li>
              <li><strong>Informações de Pagamento:</strong> Dados necessários para processar pagamentos, incluindo números de cartão de crédito e informações de faturamento.</li>
              <li><strong>Comunicações:</strong> Mensagens, chats e outras comunicações na plataforma.</li>
              <li><strong>Dados de Uso:</strong> Informações sobre como você interage com nossa plataforma.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Como Usamos suas Informações</h2>
            <p>Utilizamos suas informações para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fornecer, manter e melhorar nossos serviços.</li>
              <li>Processar transações e enviar notificações relacionadas.</li>
              <li>Responder a suas solicitações, perguntas e comentários.</li>
              <li>Personalizar e melhorar sua experiência.</li>
              <li>Monitorar e analisar tendências, uso e atividades.</li>
              <li>Prevenir fraudes e abusos.</li>
              <li>Cumprir obrigações legais.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Compartilhamento de Informações</h2>
            <p>
              Podemos compartilhar suas informações pessoais com as seguintes partes e nas seguintes circunstâncias:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Profissionais de Saúde Mental:</strong> Compartilhamos suas informações com os profissionais de saúde mental com quem você agenda sessões.</li>
              <li><strong>Prestadores de Serviço:</strong> Trabalhamos com terceiros que fornecem serviços como hospedagem, análise de dados e processamento de pagamentos.</li>
              <li><strong>Requisitos Legais:</strong> Podemos divulgar suas informações se acreditarmos que isso é necessário para cumprir uma lei, regulamento ou processo legal.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Segurança das Informações</h2>
            <p>
              Implementamos medidas de segurança para proteger suas informações pessoais, incluindo:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encriptação de dados sensíveis.</li>
              <li>Revisões regulares de segurança.</li>
              <li>Acesso restrito a informações pessoais.</li>
              <li>Manutenção de salvaguardas administrativas, técnicas e físicas.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Seus Direitos e Escolhas</h2>
            <p>
              Você tem certos direitos relacionados às suas informações pessoais:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acesso e atualização de suas informações pessoais.</li>
              <li>Exclusão de sua conta e dados pessoais.</li>
              <li>Oposição ao processamento de suas informações pessoais.</li>
              <li>Retirada de consentimento a qualquer momento.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. A versão mais recente estará sempre disponível em nosso site, com a data da "última atualização" no topo.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Contato</h2>
            <p>
              Se você tiver alguma dúvida ou preocupação sobre esta Política de Privacidade ou nossas práticas de dados, entre em contato conosco em:
            </p>
            <p className="mt-2">
              <strong>E-mail:</strong> contato@psicomais.com<br />
              <strong>Endereço:</strong> Rua Gupeva, 56, São Paulo - SP, CEP 08030-320
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
