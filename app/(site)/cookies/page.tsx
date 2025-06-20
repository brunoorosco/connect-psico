import React from 'react';
import { Cookie } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const CookiePolicy = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <Cookie className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-4xl font-bold">Política de Cookies</h1>
          </div>
          
          <p className="text-gray-600 mb-8 text-center">
            Última atualização: 1 de Maio de 2025
          </p>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. O que são Cookies?</h2>
            <p>
              Cookies são pequenos arquivos de texto armazenados no seu dispositivo (computador, tablet ou celular) quando você visita um site. Eles são amplamente utilizados para fazer os sites funcionarem de maneira mais eficiente, bem como fornecer informações aos proprietários do site.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Como Utilizamos os Cookies</h2>
            <p>
              A MindfulTherapy utiliza cookies para diversos propósitos, incluindo:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Cookies Essenciais:</strong> Necessários para o funcionamento básico do site. Eles permitem que você navegue pelo site e utilize seus recursos, como acessar áreas seguras.</li>
              <li><strong>Cookies de Preferências:</strong> Permitem que o site se lembre de informações que mudam a forma como o site se comporta ou parece, como seu idioma preferido ou a região em que você está.</li>
              <li><strong>Cookies Estatísticos:</strong> Nos ajudam a entender como os visitantes interagem com nosso site, coletando e relatando informações anonimamente.</li>
              <li><strong>Cookies de Marketing:</strong> Utilizados para rastrear visitantes em sites. A intenção é exibir anúncios relevantes e envolventes para o usuário individual.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Tipos Específicos de Cookies que Utilizamos</h2>
            <p>
              Nossa plataforma utiliza os seguintes tipos de cookies:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Cookies de Sessão:</strong> Cookies temporários que são excluídos quando você fecha o navegador.</li>
              <li><strong>Cookies Persistentes:</strong> Ficam no seu dispositivo até serem excluídos manualmente ou até expirarem.</li>
              <li><strong>Cookies Primários:</strong> Definidos por nós.</li>
              <li><strong>Cookies de Terceiros:</strong> Definidos por nossos parceiros de confiança, como serviços de análise e publicidade.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Como Gerenciar os Cookies</h2>
            <p>
              A maioria dos navegadores web permite algum controle sobre a maioria dos cookies através das configurações do navegador. Para saber mais sobre como gerenciar cookies, visite:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><a href="https://support.google.com/chrome/answer/95647" className="text-primary hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/pt-BR/kb/ative-e-desative-os-cookies-que-os-sites-usam" className="text-primary hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/pt-br/guide/safari/sfri11471/mac" className="text-primary hover:underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/pt-br/microsoft-edge/excluir-cookies-no-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className="text-primary hover:underline">Microsoft Edge</a></li>
            </ul>
            <p className="mt-4">
              Observe que restringir cookies pode impactar sua experiência em nosso site e impedir que determinados recursos funcionem corretamente.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Cookies de Terceiros</h2>
            <p>
              Alguns cookies em nosso site são definidos por terceiros que fornecem serviços em nosso nome. Exemplos incluem:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Google Analytics:</strong> Para análise de tráfego e comportamento do usuário.</li>
              <li><strong>Processadores de Pagamento:</strong> Para processamento seguro de transações.</li>
              <li><strong>Redes Sociais:</strong> Para integração de recursos de compartilhamento social.</li>
            </ul>
            <p className="mt-4">
              Cada um desses terceiros tem sua própria política de privacidade e cookies, que recomendamos que você consulte.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Alterações na Política de Cookies</h2>
            <p>
              Podemos atualizar esta Política de Cookies periodicamente para refletir, por exemplo, alterações nos cookies que utilizamos ou outras razões operacionais, legais ou regulatórias. Recomendamos que você visite regularmente esta página para se manter informado sobre o uso de cookies.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Contato</h2>
            <p>
              Se você tiver alguma dúvida sobre nosso uso de cookies, entre em contato conosco em:
            </p>
            <p className="mt-2">
              <strong>E-mail:</strong> privacidade@psicomais.com.br<br />
              <strong>Endereço:</strong> Av. Paulista, 1000, São Paulo - SP, CEP 01310-100
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CookiePolicy;
