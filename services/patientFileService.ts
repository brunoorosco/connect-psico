// services/patientFilesService.ts
import axios, { AxiosProgressEvent } from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export interface PatientFileData {
  id: string
  patientId: number
  fileName: string
  fileType: string
  fileSize: string
  uploadedAt: string
  category: "exam" | "report" | "prescription" | "other"
  url: string
  fileKey: string
}

export interface UploadProgress {
  percentage: number
  loaded: number
  total: number
}

class PatientFilesService {
  private api = axios.create({
    baseURL: API_BASE_URL,
  })

  constructor() {
    // Interceptor para adicionar token de autenticação
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem("authToken")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
  }

  // Listar arquivos de um paciente
  async getPatientFiles(patientId: number): Promise<PatientFileData[]> {
    try {
      const response = await this.api.get(`/patients/${patientId}/files`)
      return response.data
    } catch (error) {
      console.error("Erro ao buscar arquivos:", error)
      throw this.handleError(error)
    }
  }

  // Upload de arquivo com progresso
  async uploadFile(
    patientId: number,
    file: File,
    category: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<PatientFileData> {
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("category", category)

      const response = await this.api.post(`/patients/${patientId}/files`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress({
              percentage,
              loaded: progressEvent.loaded,
              total: progressEvent.total,
            })
          }
        },
      })

      return response.data
    } catch (error) {
      console.error("Erro ao fazer upload:", error)
      throw this.handleError(error)
    }
  }

  // Obter URL de download
  async getDownloadUrl(patientId: number, fileId: string): Promise<string> {
    try {
      const response = await this.api.get(`/patients/${patientId}/files/${fileId}/download`)
      return response.data.url
    } catch (error) {
      console.error("Erro ao obter URL de download:", error)
      throw this.handleError(error)
    }
  }

  // Download de arquivo
  async downloadFile(patientId: number, fileId: string, fileName: string): Promise<void> {
    try {
      const url = await this.getDownloadUrl(patientId, fileId)

      // Criar link temporário e clicar
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      link.target = "_blank"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Erro ao fazer download:", error)
      throw this.handleError(error)
    }
  }

  // Deletar arquivo
  async deleteFile(patientId: number, fileId: string): Promise<void> {
    try {
      await this.api.delete(`/patients/${patientId}/files/${fileId}`)
    } catch (error) {
      console.error("Erro ao deletar arquivo:", error)
      throw this.handleError(error)
    }
  }

  // Atualizar categoria
  async updateFileCategory(patientId: number, fileId: string, category: string): Promise<PatientFileData> {
    try {
      const response = await this.api.patch(`/patients/${patientId}/files/${fileId}`, { category })
      return response.data
    } catch (error) {
      console.error("Erro ao atualizar arquivo:", error)
      throw this.handleError(error)
    }
  }

  // Tratamento de erros
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || "Erro ao processar requisição"
      return new Error(message)
    }
    return new Error(error.message || "Erro desconhecido")
  }
}

export const patientFilesService = new PatientFilesService()
