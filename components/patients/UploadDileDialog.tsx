// components/UploadFileDialog.tsx
"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, Image, File, X } from "lucide-react"
import { Patient } from "@/types/appointment"

interface UploadFileDialogProps {
  patient: Patient | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadComplete?: (file: UploadedFile) => void
}

export interface UploadedFile {
  id: string
  patientId: number
  patientName: string
  fileName: string
  fileType: string
  fileSize: string
  uploadedAt: string
  category: "exam" | "report" | "prescription" | "other"
  file: File
}

export function UploadFileDialog({ patient, open, onOpenChange, onUploadComplete }: UploadFileDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("other")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamanho do arquivo (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("O arquivo deve ter no máximo 10MB")
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !patient) {
      alert("Selecione um arquivo para anexar")
      return
    }

    setIsUploading(true)

    try {
      // Simular upload (aqui você implementaria a chamada real à API)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const uploadedFile: UploadedFile = {
        id: `file_${Date.now()}`,
        patientId: patient.id,
        patientName: patient.name,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: `${(selectedFile.size / 1024).toFixed(0)} KB`,
        uploadedAt: new Date().toISOString(),
        category: selectedCategory as UploadedFile["category"],
        file: selectedFile,
      }

      // Callback para o componente pai
      onUploadComplete?.(uploadedFile)

      // Resetar formulário
      setSelectedFile(null)
      setSelectedCategory("other")
      onOpenChange(false)

      alert(`Arquivo "${selectedFile.name}" anexado com sucesso!`)
    } catch (error) {
      console.error("Erro ao fazer upload:", error)
      alert("Erro ao fazer upload do arquivo")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image")) return <Image className="h-4 w-4" />
    if (fileType.includes("pdf")) return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Anexar Arquivo</DialogTitle>
          <DialogDescription>
            {patient ? (
              <>
                Anexar arquivo ao prontuário de <strong>{patient.name}</strong>
              </>
            ) : (
              "Selecione um paciente primeiro"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria do Arquivo</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-1">Clique para selecionar um arquivo</p>
                <p className="text-xs text-gray-400">PDF, DOC, DOCX, JPG, PNG (máx. 10MB)</p>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(selectedFile.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
            Cancelar
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
            {isUploading ? "Enviando..." : "Anexar Arquivo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
