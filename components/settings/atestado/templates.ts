// templates.ts
export const titles: Record<keyof typeof templates, string> = {
  atestado: "ATESTADO PSICOLÓGICO",
  comparecimento: "DECLARAÇÃO DE COMPARECIMENTO",
  acompanhamento: "DECLARAÇÃO DE ACOMPANHAMENTO",
  encaminhamento: "ENCAMINHAMENTO",
  relatorio: "RELATÓRIO PSICOLÓGICO",
}

export const templates = {
  atestado: `Atesto, para fins de afastamento das atividades laborais, que o(a) Sr(a) {{paciente}}, RG: {{rg}}, realizou consulta com o(a) Psicólogo(a) {{nome}} - CRP {{crp}}.
Apresenta {{sintomas}}, sendo necessário acompanhamento psicológico.

CID: {{cid}}.

Deverá permanecer afastado(a) das atividades laborais por {{dias}} dias a partir desta data.

                                          São Paulo, {{dataExtenso}}
`,

  comparecimento: `Declaro, para os devidos fins, que {{paciente}}, RG: {{rg}}, esteve presente em atendimento psicológico devido {{tratamento}}.

CID {{cid}}

Dia {{data}} às {{horario}}

                                          São Paulo, {{dataExtenso}}
`,

  acompanhamento: `Declaro para os devidos fins que {{paciente}}, CPF: {{cpf}}, encontra-se em acompanhamento psicológico, sob responsabilidade do(a) Psicólogo(a) {{nome}}, CRP {{crp}}.

O acompanhamento teve início em {{inicio}} e tem como objetivo obter como hipótese diagnóstica CID {{cid}}. 
As sessões ocorrem semanalmente e seguem as diretrizes éticas e profissionais da Psicologia.

                                          São Paulo, {{dataExtenso}}
`,

  encaminhamento: `Prezado(a) Dr(a),

Encaminho o(a) paciente {{paciente}}, atualmente em acompanhamento psicológico comigo desde {{inicio}}, com queixa principal de {{queixa}}.

Durante o processo terapêutico, observei {{observacoes}}.
Considerando o quadro apresentado, compreendo que uma avaliação psiquiátrica contribuirá significativamente para seu tratamento.

Atenciosamente,

                                          São Paulo, {{dataExtenso}}
`,

  relatorio: `Paciente: {{paciente}}, {{idade}} anos
Data da sessão: {{data}}
Modalidade: {{modalidade}}

Na sessão realizada foi avaliada a queixa principal: {{queixa}}.

Observações clínicas: {{observacoes}}.

De acordo com critérios diagnósticos, apresenta quadro compatível com CID {{cid}}.
Certifico que este relatório foi elaborado com base nas observações realizadas durante o processo terapêutico, atendendo aos requisitos exigidos para reembolso junto ao convênio.

                                          São Paulo, {{dataExtenso}}
`,
}
