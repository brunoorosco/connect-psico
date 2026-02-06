"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useEffect, useState } from "react"
import { usePatientRecords, MongoSessionData } from "@hooks/useConsultation"
import { NotePatient } from "@/domain/model/notePatient"
import { useCurrentUser } from "@hooks/use-current-user"
import { startAsyncTranscription } from "@/services/consultationService"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Calendar,
  User,
  Pill,
  ChevronDown,
  ChevronUp,
  Clock,
  Mic,
  Sparkles,
  FileTextIcon,
  Activity,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Target,
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────────────
type PatientRecordsTabProps = {
  patientId: string
}

type RecordItem = NotePatient & {
  professional: { name: string }
  summaryIdMongo?: string
}

// ─── Componente ──────────────────────────────────────────────────
export const PatientRecordsTab: React.FC<PatientRecordsTabProps> = ({ patientId }) => {
  const { records, fetchPatientRecords, loading, sessionCache, fetchSessionById, loadingSessionIds } =
    usePatientRecords()
  const user = useCurrentUser()
  const [expandedRecords, setExpandedRecords] = useState<Set<number>>(new Set())
  const [generatingId, setGeneratingId] = useState<number | null>(null)

  useEffect(() => {
    fetchPatientRecords(patientId)
  }, [patientId])

  const toggleRecord = (recordId: number, summaryIdMongo?: string) => {
    const willExpand = !expandedRecords.has(recordId)

    setExpandedRecords((prev) => {
      const next = new Set(prev)
      willExpand ? next.add(recordId) : next.delete(recordId)
      return next
    })

    if (willExpand && summaryIdMongo) {
      fetchSessionById(summaryIdMongo)
    }
  }

  const handleGenerateSummary = async (rec: RecordItem, text?: string) => {
    if (!rec.summaryIdMongo || !user?.id) return
    // Se não tiver texto (transcrição) nem do Mongo nem nas notas, não dá pra gerar
    const textToSummarize = text || rec.notes
    if (!textToSummarize) {
      toast.error("Sem texto para resumir.")
      return
    }

    setGeneratingId(rec.id)
    try {
      toast.info("Solicitando resumo...")
      await startAsyncTranscription(
        rec.summaryIdMongo,
        undefined,
        "pt-BR",
        user.id,
        patientId,
        textToSummarize
      )
      toast.success("Resumo solicitado! Aguarde a notificação.")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao solicitar resumo.")
    } finally {
      setGeneratingId(null)
    }
  }

  // ─── Loading global ──────────────────────────────────────────
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Prontuário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  // ─── Render ──────────────────────────────────────────────────
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-primary" />
            Prontuário
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {records.length} {records.length === 1 ? "sessão" : "sessões"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          {/* Empty state */}
          {records.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Nenhum registro no prontuário ainda.</p>
              <p className="mt-1 text-xs text-muted-foreground">As sessões realizadas aparecerão aqui.</p>
            </div>
          )}

          <div className="space-y-3">
            {records.map((rec: RecordItem) => {
              const expanded = expandedRecords.has(rec.id)
              const mongoId = rec.summaryIdMongo
              const isLoadingMongo = mongoId ? loadingSessionIds.has(mongoId) : false
              const mongoData: MongoSessionData | undefined = mongoId ? sessionCache.get(mongoId) : undefined
              const hasPrescription = !!rec.prescription
              const hasMongoData = !!mongoId

              // Verifica se deve mostrar o botão de gerar resumo:
              // Tem ID do Mongo (sessão), tem texto (do mongo ou nas notas), mas NÃO tem resumo no Mongo
              const canGenerateSummary = mongoId && !mongoData?.summary && (mongoData?.text || rec.notes)

              return (
                <div
                  key={rec.id}
                  className="overflow-hidden rounded-lg border bg-card transition-all hover:border-primary/50"
                >
                  {/* ── Header (sempre visível) ── */}
                  <button
                    onClick={() => toggleRecord(rec.id, mongoId)}
                    className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>

                    <div className="flex-1 space-y-1.5">
                      {/* Data + Horário */}
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {format(new Date(rec.createdAt as Date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {format(new Date(rec.createdAt as Date), "HH:mm", { locale: ptBR })}
                        </div>
                      </div>

                      {/* Profissional */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{rec.professional.name}</span>
                      </div>

                      {/* Preview notas quando fechado */}
                      {!expanded && rec.notes && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">{rec.notes}</p>
                      )}

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {hasMongoData && (
                          <>
                            <Badge variant="outline" className="gap-1 text-xs">
                              <Mic className="h-3 w-3" />
                              Transcrição
                            </Badge>
                            <Badge variant="outline" className="gap-1 text-xs">
                              <Sparkles className="h-3 w-3" />
                              Resumo IA
                            </Badge>
                          </>
                        )}
                        {hasPrescription && (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Pill className="h-3 w-3" />
                            Prescrição
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {expanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* ── Conteúdo expandido ── */}
                  {expanded && (
                    <div className="border-t bg-muted/30 p-4 space-y-4">
                      {/* Spinner lazy */}
                      {isLoadingMongo && (
                        <div className="flex items-center justify-center gap-2 py-6">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">Carregando detalhes da sessão...</span>
                        </div>
                      )}

                      {!isLoadingMongo && (
                        <>
                          {/* Botão de Gerar Resumo (se aplicável) */}
                          {canGenerateSummary && (
                            <div className="flex justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleGenerateSummary(rec, mongoData?.text)}
                                disabled={generatingId === rec.id}
                                className="gap-2 border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-400"
                              >
                                {generatingId === rec.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Sparkles className="h-3.5 w-3.5" />
                                )}
                                Gerar Resumo com IA
                              </Button>
                            </div>
                          )}

                          {/* Anotações (Prisma) */}
                          {rec.notes && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm font-semibold">
                                <FileTextIcon className="h-4 w-4 text-primary" />
                                <span>Anotações da Sessão</span>
                              </div>
                              <div className="rounded-lg bg-background p-3 text-sm leading-relaxed">{rec.notes}</div>
                            </div>
                          )}

                          {/* ── Dados do Mongo ── */}
                          {mongoData && (
                            <>
                              {/* Transcrição */}
                              {mongoData.text && (
                                <>
                                  <Separator />
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                      <Mic className="h-4 w-4 text-primary" />
                                      <span>Transcrição da Sessão</span>
                                    </div>
                                    <ScrollArea className="h-40">
                                      <div className="rounded-lg bg-background p-3 pr-4 text-xs leading-relaxed">
                                        {mongoData.text}
                                      </div>
                                    </ScrollArea>
                                  </div>
                                </>
                              )}

                              {/* Resumo IA */}
                              {mongoData.summary && (
                                <>
                                  <Separator />
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                      <Sparkles className="h-4 w-4 text-primary" />
                                      <span>Resumo com IA</span>
                                    </div>
                                    <div className="space-y-3 rounded-lg bg-primary/5 p-3">
                                      <p className="text-sm leading-relaxed">{mongoData.summary.summary}</p>

                                      {/* Pontos Positivos */}
                                      {mongoData?.summary?.key_points?.positives &&
                                        mongoData?.summary?.key_points?.positives?.length > 0 && (
                                          <div className="space-y-2 rounded-lg bg-green-50 p-3 dark:bg-green-950/30">
                                            <div className="flex items-center gap-1.5">
                                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                                              <h4 className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400">
                                                Pontos Positivos
                                              </h4>
                                            </div>
                                            <ul className="space-y-1.5 pl-4">
                                              {mongoData.summary.key_points.positives.map((point, i) => (
                                                <li
                                                  key={i}
                                                  className="list-disc text-sm text-green-800 dark:text-green-300"
                                                >
                                                  {point}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}

                                      {/* Pontos de Atenção */}
                                      {mongoData.summary.key_points?.negatives &&
                                        mongoData.summary.key_points?.negatives?.length > 0 && (
                                          <div className="space-y-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-950/30">
                                            <div className="flex items-center gap-1.5">
                                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                                              <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                                                Pontos de Atenção
                                              </h4>
                                            </div>
                                            <ul className="space-y-1.5 pl-4">
                                              {mongoData.summary.key_points.negatives.map((point, i) => (
                                                <li
                                                  key={i}
                                                  className="list-disc text-sm text-amber-800 dark:text-amber-300"
                                                >
                                                  {point}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}

                                      {/* Itens de Ação */}
                                      {mongoData.summary.action_items && mongoData.summary.action_items?.length > 0 && (
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-1.5">
                                            <Target className="h-4 w-4 text-primary" />
                                            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                              Itens de Ação
                                            </h4>
                                          </div>
                                          <ul className="space-y-1.5 pl-4">
                                            {mongoData.summary.action_items.map((item, i) => (
                                              <li key={i} className="list-disc text-sm">
                                                {item}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}

                                      {/* Alertas */}
                                      {mongoData.summary.warnings && mongoData.summary.warnings?.length > 0 && (
                                        <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30">
                                          <div className="flex items-center gap-1.5">
                                            <AlertTriangle className="h-4 w-4 text-red-600" />
                                            <h4 className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">
                                              Alertas
                                            </h4>
                                          </div>
                                          <ul className="space-y-1.5 pl-4">
                                            {mongoData.summary.warnings.map((warn, i) => (
                                              <li key={i} className="list-disc text-sm text-red-800 dark:text-red-300">
                                                {warn}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* Session ID */}
                              {mongoData.sessionId && (
                                <div className="pt-1 text-xs text-muted-foreground">
                                  <span className="font-mono">Session ID: {mongoData.sessionId}</span>
                                </div>
                              )}
                            </>
                          )}

                          {/* Prescrição (Prisma) */}
                          {hasPrescription && (
                            <>
                              <Separator />
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                  <Pill className="h-4 w-4 text-primary" />
                                  <span>Prescrição</span>
                                </div>
                                <div className="rounded-lg border-l-4 border-primary bg-primary/5 p-3 text-sm leading-relaxed">
                                  {rec.prescription}
                                </div>
                              </div>
                            </>
                          )}

                          {/* Estado vazio dentro do card */}
                          {!rec.notes && !mongoData && !hasPrescription && (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                              <FileText className="mb-2 h-6 w-6 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                Sem informações adicionais para esta sessão.
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
