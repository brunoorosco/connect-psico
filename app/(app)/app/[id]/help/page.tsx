"use client"
import React, { useState, useEffect } from "react"
import {
  Search,
  Book,
  Users,
  Settings,
  CreditCard,
  BarChart3,
  MessageSquare,
  Shield,
  Zap,
  FileText,
  Layers,
  QrCode,
  FileSignature,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const HelpPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeSection, setActiveSection] = useState("getting-started")
  const [filteredTopics, setFilteredTopics] = useState<any[]>([])

  // -------------------------------
  // CONTEÚDO DA SUA PLATAFORMA
  // -------------------------------
  const helpTopics = [
    {
      id: "getting-started",
      title: "Primeiros Passos",
      icon: <Zap className="w-5 h-5" />,
      description: "Como começar a usar a plataforma e entender a estrutura dos documentos",
      articles: [
        {
          title: "Como os documentos funcionam",
          content:
            "Cada profissional possui seus próprios modelos (templates) salvos no banco. Você edita no preview e emite o PDF com os dados do paciente e do profissional.",
          steps: [
            "Acesse: Configurações > Modelos de Documentos",
            "Escolha um tipo (Atestado, Comparecimento, etc.)",
            "Ajuste cores, título e o texto do corpo",
            "Use camadas para inserir textos, imagens, QR e assinatura",
          ],
        },
        {
          title: "Entendendo o Preview x PDF",
          content: "O preview mostra o papel em tamanho real (A4/A5).",
          steps: [
            "Header/Footer em cm, padding em pt (igual ao PDF)",
            "Coordenadas Y no PDF são invertidas: já tratamos isso na geração",
            "Use a camada de Assinatura para um resultado fiel, em vez de digitar no corpo",
          ],
        },
      ],
    },
    {
      id: "editor-modelos",
      title: "Editor de Modelos",
      icon: <FileText className="w-5 h-5" />,
      description: "Configure título, corpo com Mustache, cabeçalho, rodapé e plano de fundo",
      articles: [
        {
          title: "Cabeçalho (Header) e Rodapé (Footer)",
          content:
            "Ative/desative, defina altura (cm) e cores. O conteúdo do corpo respeita esses espaços automaticamente.",
          steps: [
            "Defina a altura do Header e do Footer em centímetros",
            "Escolha as cores de fundo",
            "O conteúdo do corpo terá padding extra para não sobrepor",
            "Salve o modelo ao terminar",
          ],
        },
        {
          title: "Corpo do Documento (Mustache)",
          content:
            "O texto do corpo aceita variáveis Mustache que são preenchidas automaticamente ao emitir o documento.",
          steps: [
            "Escreva seu texto usando {{variaveis}} (ex.: {{paciente}}, {{cid}})",
            "Use linhas em branco para parágrafos",
            "No momento da emissão, informamos os dados (CID, dias, horário, etc.)",
            "Visualize no preview e salve",
          ],
        },
        {
          title: "Plano de Fundo (Background)",
          content:
            "Defina cor/imagem de fundo e opacidade. A imagem é automaticamente ajustada para cobrir a página inteira.",
          steps: [
            "Escolha uma cor de fundo",
            "Opcional: envie uma imagem (marca d’água ou papel timbrado)",
            "Ajuste a opacidade conforme necessidade",
            "Confira o resultado no preview",
          ],
        },
      ],
    },
    {
      id: "layers",
      title: "Camadas (Layers)",
      icon: <Layers className="w-5 h-5" />,
      description: "Adicione elementos arrastáveis: Texto, Imagem, QR Code e Assinatura",
      articles: [
        {
          title: "Texto",
          content:
            "Caixas de texto com fonte, tamanho, cor e alinhamento. Ideais para rótulos fixos (ex.: “Novo texto”, rodapé com site/telefone).",
          steps: [
            "Clique em “+ Texto”",
            "Arraste e redimensione a caixa",
            "Ajuste fonte, tamanho, cor e alinhamento",
            "Use “Frente/Fundo” para a ordem das camadas",
          ],
        },
        {
          title: "Imagem",
          content:
            "Envie imagens (Cloudinary) e escolha o modo contain/cover. Perfeito para logotipos ou marcas d’água.",
          steps: [
            "Clique em “+ Imagem” e envie o arquivo",
            "Defina contain (tudo visível) ou cover (preenchimento total)",
            "Ajuste opacidade se for marca d’água",
            "Posicione e redimensione no preview",
          ],
        },
        {
          title: "QR Code",
          icon: <QrCode className="w-4 h-4" />,
          content: "Gera um QR automaticamente (ex.: link de validação). As cores do QR podem ser personalizadas.",
          steps: [
            "Clique em “+ QR”",
            "Informe o link/valor",
            "Ajuste largura/altura da caixa",
            "Defina cores (frente/fundo) se quiser",
          ],
        },
        {
          title: "Assinatura",
          icon: <FileSignature className="w-4 h-4" />,
          content:
            "Camada especial com linha de assinatura + nome e CRP/CRM do profissional. O texto pode ser alinhado à esquerda, centro ou direita.",
          steps: [
            "Clique em “Assinatura”",
            "Ajuste posição e tamanho da caixa",
            "Escolha alinhamento, espessura e comprimento da linha",
            "Os dados (nome/CRP) vêm do perfil do profissional",
          ],
        },
      ],
    },
    {
      id: "emissao",
      title: "Emissão de Documentos na Consulta",
      icon: <Settings className="w-5 h-5" />,
      description: "Como emitir o PDF após finalizar a consulta",
      articles: [
        {
          title: "Fluxo de Emissão",
          content:
            "Depois de finalizar a consulta, o botão “Emitir documento” fica disponível. Preencha os dados e gere o PDF.",
          steps: [
            "Finalize a consulta",
            "Clique em “Emitir documento”",
            "Escolha o tipo (Atestado, Comparecimento, etc.)",
            "Preencha CID, dias, horário, RG/CPF (se já existirem, preenchemos automaticamente)",
          ],
        },
        {
          title: "Dados usados",
          content:
            "Suportamos variáveis como {{paciente}}, {{rg}}, {{cpf}}, {{idade}}, {{data}}, {{dataExtenso}}, {{horario}}, {{cid}}, {{dias}}, {{modalidade}}, {{queixa}}, {{tratamento}}, {{observacoes}}, {{medico}}, {{crp}}.",
          steps: [
            "Os dados do paciente vêm do cadastro (RG/CPF, nascimento, etc.)",
            "A idade é calculada automaticamente",
            "Os dados do profissional vêm do perfil (nome, CRP/CRM)",
            "Confira no preview e gere o PDF",
          ],
        },
      ],
    },
    {
      id: "mustache",
      title: "Guia de Template",
      icon: <Book className="w-5 h-5" />,
      description: "Como escrever o corpo do documento com variáveis",
      articles: [
        {
          title: "Variáveis disponíveis",
          content: "Use {{variavel}} para inserir informações no texto. Alguns exemplos mais comuns:",
          steps: [
            "{{paciente}}, {{rg}}, {{cpf}}, {{idade}}",
            "{{data}} (dd/mm/aaaa) e {{dataExtenso}} (por extenso)",
            "{{horario}}, {{cid}}, {{dias}}, {{modalidade}}",
            "{{queixa}}, {{tratamento}}, {{observacoes}}",
            "{{medico}}, {{crp}} / {{crm}}",
          ],
        },
        {
          title: "Boas práticas",
          content: "Mantenha o texto simples. Cada linha em branco cria um novo parágrafo no PDF.",
          steps: [
            "Evite condicionais/loops (usamos Mustache simples)",
            "Prefira variáveis ao invés de texto fixo com dados pessoais",
            "Quebras de linha viram parágrafos (espaçamento automático)",
            "Sempre teste no preview antes de salvar",
          ],
        },
      ],
    },
  ]

  const popularArticles = [
    { title: "Criar um Atestado em 1 minuto", section: "emissao", views: "2.9k" },
    { title: "Como usar variáveis {{...}} no corpo", section: "mustache", views: "2.2k" },
    { title: "Assinatura com linha e alinhamento", section: "layers", views: "1.7k" },
    { title: "Entendendo Preview x PDF", section: "getting-started", views: "1.3k" },
    { title: "Adicionar logo e marca d’água", section: "layers", views: "980" },
  ]

  const faqItems = [
    {
      question: "Por que o texto do rodapé parece “subir” no PDF?",
      answer:
        "O preview e o PDF já estão calibrados. Se notar diferença, ajuste a posição da camada no preview. O gerador converte px→pt e Y (de cima para baixo) automaticamente.",
    },
    {
      question: "Consigo validar o documento com QR Code?",
      answer:
        "Sim. Adicione uma camada de QR e coloque a URL de validação (ou outro conteúdo). O código é gerado automaticamente no PDF.",
    },
    {
      question: "Posso reaproveitar o mesmo modelo para todos os pacientes?",
      answer:
        "Sim. O corpo usa variáveis Mustache ({{paciente}}, {{rg}}, etc.), então o texto se adapta aos dados do paciente e do profissional.",
    },
    {
      question: "Como defino o local da assinatura?",
      answer:
        "Use a camada de Assinatura. Posicione a caixa no preview e ajuste comprimento/espessura da linha e alinhamento do texto (esquerda, centro, direita).",
    },
    {
      question: "Quais tamanhos de papel são suportados?",
      answer: "A4 e A5. O preview mostra o tamanho real em pontos (pt), e o PDF respeita o mesmo tamanho.",
    },
  ]

  useEffect(() => {
    const filtered = searchTerm
      ? helpTopics.filter(
          (t) =>
            t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.articles.some(
              (a) =>
                a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.content.toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
      : helpTopics
    setFilteredTopics(filtered)
  }, [searchTerm])

  const currentTopic = helpTopics.find((topic) => topic.id === activeSection)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Central de Ajuda</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Aprenda a configurar modelos, camadas e a emitir documentos em PDF de forma rápida
              </p>
            </div>
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Pesquise por recursos, tutoriais ou dúvidas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-3 text-lg border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-32">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="w-5 h-5" />
                  Tópicos de Ajuda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setActiveSection(topic.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                      activeSection === topic.id
                        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {topic.icon}
                    <div>
                      <div className="font-medium">{topic.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{topic.articles.length} artigos</div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Popular Articles */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Artigos Populares</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {popularArticles.map((article, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <button
                      onClick={() => setActiveSection(article.section)}
                      className="text-sm text-blue-600 hover:text-blue-800 text-left flex-1"
                    >
                      {article.title}
                    </button>
                    <Badge variant="secondary" className="text-xs">
                      {article.views}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {currentTopic && (
              <>
                {/* Topic Header */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      {currentTopic.icon}
                      {currentTopic.title}
                    </CardTitle>
                    <CardDescription className="text-lg">{currentTopic.description}</CardDescription>
                  </CardHeader>
                </Card>

                {/* Articles */}
                <div className="space-y-6">
                  {currentTopic.articles.map((article: any, index: number) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                      <CardHeader>
                        <CardTitle className="text-xl">{article.title}</CardTitle>
                        <CardDescription>{article.content}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {article.steps?.length ? (
                          <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">Passo a passo:</h4>
                            <div className="space-y-3">
                              {article.steps.map((step: string, stepIndex: number) => (
                                <div key={stepIndex} className="flex items-start gap-3">
                                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold">
                                    {stepIndex + 1}
                                  </div>
                                  <p className="text-gray-700">{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {/* FAQ Section apenas nos primeiros passos */}
            {activeSection === "getting-started" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Perguntas Frequentes</CardTitle>
                  <CardDescription>Respostas rápidas para as dúvidas mais comuns</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-4">
                    {faqItems.map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left hover:text-blue-600">{item.question}</AccordionTrigger>
                        <AccordionContent className="text-gray-600 leading-relaxed">{item.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}

            {/* Contact Support */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-xl">Ainda precisa de ajuda?</CardTitle>
                <CardDescription>Nossa equipe de suporte está sempre pronta para ajudar você</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4">
                <a
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-center"
                  href="https://wa.me/5511940714391?text=Ol%C3%A1%21%20Preciso%20de%20saber%20mais%20sobre%20os%20servi%C3%A7os%20da%20PsicoMais."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir Ticket de Suporte
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpPage
