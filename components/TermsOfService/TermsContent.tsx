'use server'
import { env } from "@/config/application";
import React from "react";

export const TermsContent: React.FC = () => {
  return (
    <div className="terms-content">
      <section id="introduction" className="mb-8">
        <h1>Termos de Serviço</h1>
        <p>Última Atualização: 1 de Maio de 2025</p>
        <p>
          {`Bem-vindo ao ${env.applicationName}, uma plataforma que conecta profissionais terapêuticos com pacientes. Estes Termos de Serviço
          ("Termos") regem o seu uso da plataforma ${env.applicationName}, incluindo o site, aplicativo móvel e todos os serviços
          relacionados (coletivamente, o "Serviço").`}
        </p>
        <p>
          Ao acessar ou utilizar o Serviço, você concorda em cumprir estes Termos. Se você não concordar com estes Termos,
          não poderá acessar ou utilizar o Serviço.
        </p>
      </section>

      <section id="definitions" className="mb-8">
        <h2>1. Definições</h2>
        <p>Nestes Termos, as seguintes definições se aplicam:</p>
        <ul>
          <li>
            <strong>"Serviço"</strong> {`refere-se à plataforma ${env.applicationName}, incluindo o site, aplicativo móvel e todos os serviços
            relacionados.`}
          </li>
          <li>
            <strong>"Usuário"</strong> refere-se a qualquer indivíduo que acessa ou utiliza o Serviço, incluindo tanto Profissionais
            quanto Pacientes.
          </li>
          <li>
            <strong>"Profissional"</strong> refere-se aos profissionais terapêuticos registrados no Serviço, incluindo, mas não limitado a
            terapeutas, conselheiros, psicólogos e outros profissionais de saúde mental.
          </li>
          <li>
            <strong>"Paciente"</strong> refere-se a indivíduos que buscam serviços terapêuticos através do Serviço.
          </li>
          <li>
            <strong>"Conteúdo"</strong> refere-se a todas as informações, textos, gráficos, fotos, vídeos ou outros materiais carregados,
            baixados ou que aparecem no Serviço.
          </li>
        </ul>
      </section>

      <section id="user-eligibility" className="mb-8">
        <h2>2. Elegibilidade do Usuário</h2>
        <p>
          Para utilizar o Serviço, você deve ter pelo menos 18 anos de idade e ser capaz de formar um contrato legalmente
          vinculativo. Se você estiver acessando o Serviço em nome de uma empresa ou outra entidade legal, você declara que tem
          autoridade para vincular tal entidade a estes Termos.
        </p>
        <p>
          Para Profissionais: Você deve possuir todas as qualificações, certificações, licenças e seguros necessários conforme
          exigido pelas leis e regulamentos aplicáveis em sua jurisdição para fornecer os serviços terapêuticos oferecidos
          através do Serviço.
        </p>
      </section>

      <section id="accounts" className="mb-8">
        <h2>3. Contas</h2>
        <h3>3.1. Registro</h3>
        <p>
          Para acessar determinados recursos do Serviço, você deve criar uma conta. Você concorda em fornecer informações
          precisas, atuais e completas durante o processo de registro e em atualizar tais informações para mantê-las precisas,
          atuais e completas.
        </p>
        
        <h3>3.2. Segurança da Conta</h3>
        <p>
          {`Você é responsável por salvaguardar suas credenciais de conta e por todas as atividades que ocorrem em sua conta.
          Você concorda em notificar o ${env.applicationName} imediatamente sobre qualquer uso não autorizado da sua conta ou qualquer
          outra violação de segurança. O ${env.applicationName} não será responsável por qualquer perda ou dano decorrente do seu não
          cumprimento desta seção.`}
        </p>
        
        <h3>3.3. Tipos de Conta</h3>
        <p>
          {`O Serviço oferece diferentes tipos de conta para Profissionais e Pacientes, cada um com recursos e funcionalidades
          específicas. O ${env.applicationName} se reserva o direito de modificar, adicionar ou remover tipos de conta e recursos a
          qualquer momento.`}
        </p>
      </section>

      <section id="services" className="mb-8">
        <h2>4. Serviços</h2>
        <h3>4.1. Serviços de Conexão</h3>
        <p>
          O Serviço fornece uma plataforma para conectar Profissionais com Pacientes que buscam serviços terapêuticos. O Serene
          Care não fornece serviços terapêuticos diretamente, mas facilita a conexão entre os Usuários.
        </p>
        
        <h3>4.2. Armazenamento de Informações</h3>
        <p>
          O Serviço permite que os Usuários armazenem, gerenciem e troquem informações relacionadas a serviços terapêuticos,
          incluindo, mas não limitado a registros de pacientes, notas de sessão, planos de tratamento e comunicações.
        </p>
        
        <h3>4.3. Agendamento e Pagamentos</h3>
        <p>
          {`O Serviço pode incluir recursos para agendamento de consultas e processamento de pagamentos entre Profissionais e
          Pacientes. Estes recursos são fornecidos por conveniência e não estabelecem o ${env.applicationName} como parte da relação
          terapêutica.`}
        </p>
      </section>

      <section id="data-privacy" className="mb-8">
        <h2>5. Privacidade de Dados</h2>
        <p>
          {`O ${env.applicationName} coleta e processa dados pessoais de acordo com sua Política de Privacidade. Ao utilizar o Serviço, você
          consente com a coleta, uso e compartilhamento de suas informações conforme descrito na Política de Privacidade.`}
        </p>
        <p>
          Para Profissionais: Você concorda em cumprir todas as leis de proteção de dados e privacidade aplicáveis ao lidar com
          informações de Pacientes obtidas através do Serviço.
        </p>
        <p>
          Para Pacientes: Você entende que as informações que compartilha com Profissionais através do Serviço estão sujeitas a
          obrigações de confidencialidade profissional e requisitos legais aplicáveis.
        </p>
      </section>

      <section id="confidentiality" className="mb-8">
        <h2>6. Confidencialidade</h2>
        <p>
          O Serviço é projetado para facilitar comunicações confidenciais entre Profissionais e Pacientes. Todas as partes
          concordam em respeitar a confidencialidade dessas comunicações de acordo com leis aplicáveis e padrões profissionais.
        </p>
        <p>
          {`O ${env.applicationName} implementa medidas técnicas e organizacionais para proteger a confidencialidade, integridade e
          disponibilidade das informações armazenadas ou transmitidas através do Serviço, mas não pode garantir segurança
          absoluta.`}
        </p>
        <p>
          Os Usuários reconhecem que comunicações eletrônicas podem não ser totalmente seguras e que existem riscos inerentes à
          transmissão eletrônica de informações sensíveis.
        </p>
      </section>

      <section id="user-obligations" className="mb-8">
        <h2>7. Obrigações do Usuário</h2>
        <p>Como Usuário do Serviço, você concorda em:</p>
        <ul>
          <li>Cumprir estes Termos e todas as leis e regulamentos aplicáveis;</li>
          <li>Utilizar o Serviço apenas para fins lícitos e de acordo com estes Termos;</li>
          <li>Fornecer informações precisas e completas;</li>
          <li>Respeitar a privacidade e os direitos de outros Usuários;</li>
          <li>Não utilizar o Serviço de forma que possa danificar, desativar, sobrecarregar ou prejudicar o Serviço;</li>
          <li>Não tentar obter acesso não autorizado a qualquer parte do Serviço ou qualquer sistema ou rede conectada ao Serviço;</li>
          <li>Não utilizar meios automatizados, incluindo scripts, bots ou scrapers, para acessar ou interagir com o Serviço;</li>
          <li>Não se envolver em qualquer atividade que interfira ou interrompa o Serviço.</li>
        </ul>
      </section>

      <section id="professional-obligations" className="mb-8">
        <h2>8. Obrigações do Profissional</h2>
        <p>Como Profissional utilizando o Serviço, você adicionalmente concorda em:</p>
        <ul>
          <li>Manter todas as licenças, certificações e credenciais necessárias para fornecer serviços terapêuticos;</li>
          <li>Cumprir todos os padrões profissionais aplicáveis, diretrizes éticas e requisitos legais;</li>
          <li>Fornecer informações precisas sobre suas qualificações, experiência e serviços;</li>
          <li>Manter seguro de responsabilidade profissional adequado;</li>
          <li>Utilizar o Serviço apenas para conectar-se com Pacientes que você está qualificado para atender;</li>
          <li>Manter limites apropriados e profissionalismo em todas as interações com Pacientes;</li>
          <li>Documentar adequadamente os serviços terapêuticos de acordo com os padrões profissionais e requisitos legais;</li>
          <li>Responder prontamente às comunicações e solicitações de serviços dos Pacientes.</li>
        </ul>
      </section>

      <section id="term-termination" className="mb-8">
        <h2>9. Prazo e Rescisão</h2>
        <h3>9.1. Prazo</h3>
        <p>
          {`Estes Termos permanecerão em vigor até serem rescindidos por você ou pelo ${env.applicationName}.`}
        </p>
        
        <h3>9.2. Rescisão pelo Usuário</h3>
        <p>
          {`Você pode encerrar sua conta a qualquer momento seguindo as instruções no Serviço ou entrando em contato com o ${env.applicationName}.`}
        </p>
        
        <h3>{`9.3. Rescisão pelo ${env.applicationName}`}</h3>
        <p>
          {`O ${env.applicationName} pode suspender ou encerrar seu acesso ao Serviço a qualquer momento, sem aviso prévio ou responsabilidade,
          por qualquer motivo, incluindo, mas não limitado a uma violação destes Termos.`}
        </p>
        
        <h3>9.4. Efeito da Rescisão</h3>
        <p>
          Após a rescisão, seu direito de usar o Serviço cessará imediatamente. As disposições destes Termos que por sua natureza
          devem sobreviver à rescisão sobreviverão, incluindo, mas não limitado a disposições de propriedade, isenções de garantia,
          indenização e limitações de responsabilidade.
        </p>
      </section>

      <section id="liability" className="mb-8">
        <h2>10. Responsabilidade</h2>
        <h3>10.1. Isenção de Garantias</h3>
        <p>
          O SERVIÇO É FORNECIDO "COMO ESTÁ" E "CONFORME DISPONÍVEL" SEM GARANTIAS DE QUALQUER TIPO, EXPRESSAS OU IMPLÍCITAS,
          INCLUINDO, MAS NÃO SE LIMITANDO A GARANTIAS IMPLÍCITAS DE COMERCIALIZAÇÃO, ADEQUAÇÃO A UMA FINALIDADE ESPECÍFICA,
          TÍTULO E NÃO VIOLAÇÃO.
        </p>
        
        <h3>10.2. Limitação de Responsabilidade</h3>
        <p>
          {`NA MÁXIMA EXTENSÃO PERMITIDA PELA LEI APLICÁVEL, O ${env.applicationName} NÃO SERÁ RESPONSÁVEL POR QUAISQUER DANOS INDIRETOS,
          INCIDENTAIS, ESPECIAIS, CONSEQUENCIAIS OU PUNITIVOS, OU QUALQUER PERDA DE LUCROS OU RECEITAS, SEJA INCORRIDA DIRETA
          OU INDIRETAMENTE, OU QUALQUER PERDA DE DADOS, USO, BOA VONTADE OU OUTRAS PERDAS INTANGÍVEIS, RESULTANTES DO SEU USO
          OU INCAPACIDADE DE USAR O SERVIÇO.`}
        </p>
        
        <h3>10.3. Indenização</h3>
        <p>
          {`Você concorda em indenizar, defender e isentar o ${env.applicationName}, seus afiliados, dirigentes, diretores, funcionários,
          agentes, licenciadores e fornecedores de e contra todas as reclamações, perdas, despesas, danos e custos, incluindo
          honorários advocatícios razoáveis, decorrentes de ou relacionados ao seu uso do Serviço ou qualquer violação destes Termos.`}
        </p>
      </section>

      <section id="intellectual-property" className="mb-8">
        <h2>11. Propriedade Intelectual</h2>
        <p>
          {`O Serviço e seu conteúdo original, recursos e funcionalidade são de propriedade do ${env.applicationName} e são protegidos por leis
          internacionais de direitos autorais, marcas registradas, patentes, segredos comerciais e outras leis de propriedade
          intelectual ou direitos de propriedade.`}
        </p>
        <p>
          {`Você mantém todos os direitos sobre o Conteúdo que você cria, carrega ou compartilha através do Serviço. Ao utilizar o
          Serviço, você concede ao ${env.applicationName} uma licença não exclusiva, isenta de royalties, mundial para usar, armazenar,
          exibir, reproduzir e distribuir seu Conteúdo exclusivamente para o propósito de fornecer e melhorar o Serviço.`}
        </p>
      </section>

      <section id="governing-law" className="mb-8">
        <h2>12. Lei Aplicável</h2>
        <p>
          Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem consideração às suas disposições
          sobre conflitos de leis.
        </p>
        <p>
          Qualquer disputa decorrente ou relacionada a estes Termos ou ao seu uso do Serviço será submetida à jurisdição
          exclusiva dos tribunais da cidade de São Paulo, Brasil.
        </p>
      </section>

      <section id="changes" className="mb-8">
        <h2>13. Alterações nos Termos</h2>
        <p>
          {`O ${env.applicationName} se reserva o direito de modificar ou substituir estes Termos a qualquer momento. Se uma revisão for
          material, o ${env.applicationName} fornecerá um aviso de pelo menos 30 dias antes de quaisquer novos termos entrarem em vigor.
          O que constitui uma mudança material será determinado a critério exclusivo do ${env.applicationName}.`}
        </p>
        <p>
          Ao continuar a acessar ou usar o Serviço após quaisquer revisões se tornarem efetivas, você concorda em estar
          vinculado aos termos revisados. Se você não concordar com os novos termos, você não está mais autorizado a usar o Serviço.
        </p>
      </section>

      <section id="contact" className="mb-8">
        <h2>14. Informações de Contato</h2>
        <p>
          Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco em:
        </p>
        <p>
          {`${env.applicationName}, Inc.`}<br />
          Avenida Paulista, 1234<br />
          Conjunto 500<br />
          São Paulo, SP 01310-100<br />
          Brasil<br />
          E-mail: legal@serenecare.com.br<br />
          Telefone: +55 (11) 3456-7890
        </p>
      </section>
    </div>
  );
};