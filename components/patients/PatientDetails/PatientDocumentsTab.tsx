"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Upload, Download, Trash2, FileText, Image, File, X, CheckCircle2, Loader2, Eye } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { useToast } from "@/hooks/useToast"

import { format } from "date-fns"
import { PatientFileData, patientFilesService, UploadProgress } from "@services/patientFileService"
import { isPreviewable } from "@/utils/formatFileSize"

type PatientDocumentsTabProps = {
  patientId: string
}

export const PatientDocumentsTab: React.FC<PatientDocumentsTabProps> = ({ patientId }) => {
  const { toast } = useToast()
  const [files, setFiles] = useState<PatientFileData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("other")
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [uploadComplete, setUploadComplete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const handleView = (file: any) => {
    setSelectedFile(file)
    setIsPreviewOpen(true)
  }

  // Carregar arquivos do paciente
  useEffect(() => {
    if (patientId) {
      loadFiles()
    }
  }, [patientId])

  const loadFiles = async () => {
    try {
      setLoading(true)
      const data = await patientFilesService.getPatientFiles(patientId)
      setFiles(data)
    } catch (error) {
      console.error("Erro ao carregar arquivos:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os arquivos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filtrar arquivos
  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || file.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamanho do arquivo (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "O arquivo deve ter no máximo 10MB",
          variant: "destructive",
        })
        return
      }
      setSelectedFile(file)
      setUploadComplete(false)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo para anexar",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(null)
    setUploadComplete(false)

    try {
      await patientFilesService.uploadFile(patientId, selectedFile, selectedCategory, (progress) => {
        setUploadProgress(progress)
      })

      setUploadComplete(true)

      toast({
        title: "Sucesso",
        description: `Arquivo "${selectedFile.name}" anexado com sucesso!`,
      })

      // Recarregar lista de arquivos
      await loadFiles()

      // Aguardar 1 segundo e fechar
      setTimeout(() => {
        resetForm()
        setIsUploadDialogOpen(false)
      }, 1000)
    } catch (error) {
      console.error("Erro ao fazer upload:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao fazer upload do arquivo",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownload = async (file: PatientFileData) => {
    try {
      toast({
        title: "Iniciando download",
        description: `Baixando ${file.fileName}...`,
      })
      await patientFilesService.downloadFile(patientId, file.id, file.fileName)
      toast({
        title: "Download concluído",
        description: `${file.fileName} baixado com sucesso!`,
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível baixar o arquivo",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm("Tem certeza que deseja excluir este arquivo?")) {
      return
    }

    try {
      await patientFilesService.deleteFile(patientId, fileId)
      setFiles(files.filter((f) => f.id !== fileId))
      toast({
        title: "Arquivo removido",
        description: "O arquivo foi removido com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o arquivo",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setSelectedCategory("other")
    setUploadProgress(null)
    setUploadComplete(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setUploadComplete(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Helpers
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      exam: "Exame",
      report: "Laudo",
      prescription: "Receita",
      other: "Outro",
    }
    return labels[category] || category
  }

  const getCategoryVariant = (category: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      exam: "default",
      report: "secondary",
      prescription: "outline",
      other: "secondary",
    }
    return variants[category] || "secondary"
  }

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes("image")) return <Image className="h-4 w-4" />
    if (fileType?.includes("pdf")) return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number | string) => {
    if (typeof bytes === "string") return bytes
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm")
    } catch {
      return dateString
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Arquivos do Paciente</CardTitle>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Anexar Arquivo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Anexar novo arquivo</DialogTitle>
              <DialogDescription>Selecione a categoria e o arquivo a ser anexado ao prontuário.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoria do Arquivo</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isUploading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exam">Exame</SelectItem>
                    <SelectItem value="report">Laudo</SelectItem>
                    <SelectItem value="prescription">Receita</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Seleção de Arquivo */}
              <div className="space-y-2">
                <Label htmlFor="file">Arquivo</Label>

                {!selectedFile ? (
                  <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isUploading ? "opacity-50 cursor-not-allowed" : "hover:border-primary hover:bg-gray-50"
                    }`}
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-1">Clique para selecionar um arquivo</p>
                    <p className="text-xs text-gray-400">PDF, DOC, DOCX, JPG, PNG (máx. 10MB)</p>
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {uploadComplete ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        ) : (
                          getFileIcon(selectedFile.type)
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(selectedFile.size)} • {getCategoryLabel(selectedCategory)}
                          </p>
                        </div>
                      </div>
                      {!isUploading && !uploadComplete && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveFile}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {uploadProgress && (
                      <div className="space-y-1">
                        <Progress value={uploadProgress.percentage} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{uploadProgress.percentage}% completo</span>
                          <span>
                            {formatFileSize(uploadProgress.loaded)} / {formatFileSize(uploadProgress.total)}
                          </span>
                        </div>
                      </div>
                    )}

                    {uploadComplete && (
                      <div className="text-center text-sm text-green-600 font-medium">
                        Upload concluído com sucesso!
                      </div>
                    )}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  disabled={isUploading}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm()
                  setIsUploadDialogOpen(false)
                }}
                disabled={isUploading}
              >
                {uploadComplete ? "Fechar" : "Cancelar"}
              </Button>
              {!uploadComplete && (
                <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Anexar Arquivo"
                  )}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome do arquivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              <SelectItem value="exam">Exames</SelectItem>
              <SelectItem value="report">Laudos</SelectItem>
              <SelectItem value="prescription">Receitas</SelectItem>
              <SelectItem value="other">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabela de Arquivos */}
        <ScrollArea className="h-[400px] border rounded-md">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Carregando arquivos...</span>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || categoryFilter !== "all"
                  ? "Nenhum arquivo encontrado com os filtros aplicados"
                  : "Nenhum arquivo anexado ainda"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Data Upload</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFileIcon(file.fileType)}
                        <span className="font-medium text-sm">{file.fileName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getCategoryVariant(file.category)}>{getCategoryLabel(file.category)}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{formatFileSize(file.fileSize)}</TableCell>
                    <TableCell className="text-sm">{formatDate(file.uploadedAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(file)}
                          disabled={!isPreviewable(file.fileType)}
                          className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(file)}
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Baixar arquivo"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(file.id)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Excluir arquivo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>{selectedFile?.fileName}</DialogTitle>
                  </DialogHeader>

                  <div className="flex-1 w-full overflow-hidden rounded-md border bg-muted">
                    {selectedFile?.fileType === "application/pdf" ? (
                      <iframe
                        src={`${selectedFile?.url}#toolbar=0`} // #toolbar=0 esconde a barra do PDF se quiser
                        className="w-full h-full"
                        title="PDF Preview"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center p-4">
                        <img
                          src={selectedFile?.url}
                          alt={selectedFile?.fileName}
                          className="max-h-full max-w-full object-contain shadow-lg"
                        />
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </Table>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
