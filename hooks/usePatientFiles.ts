// hooks/usePatientFiles.ts
import { useState, useCallback } from "react"

export interface PatientFile {
  id: string
  patientId: number
  patientName: string
  fileName: string
  fileType: string
  fileSize: string
  uploadedAt: string
  category: "exam" | "report" | "prescription" | "other"
  url?: string // URL para download
}

export function usePatientFiles() {
  const [files, setFiles] = useState<PatientFile[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Carregar arquivos de um paciente específico
  const loadPatientFiles = useCallback(async (patientId: number) => {
    setIsLoading(true)
    try {
      // Aqui você faria a chamada real à sua API
      // const response = await api.get(`/patients/${patientId}/files`)
      // setFiles(response.data)
      
      // Simulação
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Buscar do localStorage ou estado global
      const storedFiles = localStorage.getItem(`patient_files_${patientId}`)
      if (storedFiles) {
        setFiles(JSON.parse(storedFiles))
      } else {
        setFiles([])
      }
    } catch (error) {
      console.error("Erro ao carregar arquivos:", error)
      setFiles([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Adicionar novo arquivo
  const addFile = useCallback((file: PatientFile) => {
    setFiles(prevFiles => {
      const newFiles = [file, ...prevFiles]
      
      // Salvar no localStorage (em produção, enviar para API)
      localStorage.setItem(
        `patient_files_${file.patientId}`, 
        JSON.stringify(newFiles)
      )
      
      return newFiles
    })
  }, [])

  // Upload de arquivo (com FormData para API real)
  const uploadFile = useCallback(async (
    patientId: number,
    patientName: string,
    file: File,
    category: PatientFile["category"]
  ): Promise<PatientFile | null> => {
    try {
      // Criar FormData para envio
      const formData = new FormData()
      formData.append("file", file)
      formData.append("patientId", patientId.toString())
      formData.append("category", category)

      // Aqui você faria a chamada real à API
      // const response = await api.post(`/patients/${patientId}/files`, formData, {
      //   headers: { "Content-Type": "multipart/form-data" }
      // })
      // return response.data

      // Simulação de upload
      await new Promise(resolve => setTimeout(resolve, 1500))

      const newFile: PatientFile = {
        id: `file_${Date.now()}`,
        patientId,
        patientName,
        fileName: file.name,
        fileType: file.type,
        fileSize: `${(file.size / 1024).toFixed(0)} KB`,
        uploadedAt: new Date().toISOString(),
        category,
        url: URL.createObjectURL(file) // Em produção, viria da API
      }

      addFile(newFile)
      return newFile
    } catch (error) {
      console.error("Erro ao fazer upload:", error)
      return null
    }
  }, [addFile])

  // Deletar arquivo
  const deleteFile = useCallback(async (fileId: string, patientId: number) => {
    try {
      // Aqui você faria a chamada real à API
      // await api.delete(`/patients/${patientId}/files/${fileId}`)

      setFiles(prevFiles => {
        const newFiles = prevFiles.filter(f => f.id !== fileId)
        
        // Atualizar localStorage
        localStorage.setItem(
          `patient_files_${patientId}`, 
          JSON.stringify(newFiles)
        )
        
        return newFiles
      })

      return true
    } catch (error) {
      console.error("Erro ao deletar arquivo:", error)
      return false
    }
  }, [])

  // Baixar arquivo
  const downloadFile = useCallback(async (file: PatientFile) => {
    try {
      if (file.url) {
        // Se temos URL local (simulação)
        const link = document.createElement("a")
        link.href = file.url
        link.download = file.fileName
        link.click()
      } else {
        // Chamar API para obter URL ou blob
        // const response = await api.get(`/patients/${file.patientId}/files/${file.id}/download`, {
        //   responseType: 'blob'
        // })
        // const url = window.URL.createObjectURL(new Blob([response.data]))
        // const link = document.createElement("a")
        // link.href = url
        // link.download = file.fileName
        // link.click()
        // window.URL.revokeObjectURL(url)
        
        alert("Funcionalidade de download será implementada com a API")
      }
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error)
    }
  }, [])

  return {
    files,
    isLoading,
    loadPatientFiles,
    addFile,
    uploadFile,
    deleteFile,
    downloadFile
  }
}