"use client"
import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, FileText, Play } from "lucide-react"
import { TutorialSidebar } from "@components/help/TutorialSidebar"
import { mockCategories, mockTutorials } from "@components/help/mockTutorial"
import { Tutorial } from "@/domain/model/tutorial"
import { VideoStreamer } from "@components/help/VideoStreamer"

// ... imports e topo iguais

export default function HelpCenter() {
    const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(mockTutorials[0]);
  
    const formatDate = (d: Date | string) => {
      const date = d instanceof Date ? d : new Date(d);
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
    };
  
    const isCloudinaryEmbed = (url: string) =>
      /player\.cloudinary\.com\/embed/i.test(url);
  
    const isHls = (url: string) => /\.m3u8($|\?)/i.test(url);
  
    // (Opcional) se você tiver o public_id e quiser normalizar para MP4 direto:
    // const toCloudinaryMp4 = (urlOuId: string) =>
    //   `https://res.cloudinary.com/<cloud_name>/video/upload/f_mp4,vc_h264,q_auto/${urlOuId}.mp4`;
  
    return (
      <div className="flex h-screen bg-background">
        <TutorialSidebar
          categories={mockCategories}
          selectedTutorial={selectedTutorial}
          onSelectTutorial={setSelectedTutorial}
        />
  
        <div className="flex-1 flex flex-col">
          {selectedTutorial ? (
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center space-x-3 mb-3">
                  <Badge variant="secondary">{selectedTutorial.category}</Badge>
                  {!!selectedTutorial.videoUrl && (
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Play className="h-3 w-3" />
                      <span>Vídeo Tutorial</span>
                    </Badge>
                  )}
                </div>
  
                <h1 className="text-2xl font-bold mb-2">{selectedTutorial.title}</h1>
                <p className="text-muted-foreground mb-4">{selectedTutorial.description}</p>
  
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Criado em {formatDate(selectedTutorial.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Atualizado em {formatDate(selectedTutorial.updatedAt)}</span>
                  </div>
                </div>
              </div>
  
              {/* Content */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full flex">
                  {/* Texto */}
                  <div className="flex-1 p-6">
                    <ScrollArea className="h-full">
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap">{selectedTutorial.content}</div>
                      </div>
                    </ScrollArea>
                  </div>
  
                  {/* Vídeo: escolha UMA abordagem */}
                  {!!selectedTutorial.videoUrl && (
                    <div className="w-full max-w-[720px] p-6 border-l border-border">
                      {isCloudinaryEmbed(selectedTutorial.videoUrl) ? (
                        // 1) Usar o EMBED do Cloudinary (iframe) — simples e robusto
                        <iframe
                          key={selectedTutorial.videoUrl}
                          className="rounded w-full aspect-video"
                          src={selectedTutorial.videoUrl}
                          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                          loading="lazy"
                        />
                      ) : (
                        // 2) Usar o player próprio
                        //    - Se .m3u8: certifique-se de que o VideoStreamer usa hls.js
                        //    - Se .mp4: o nativo funciona
                        <VideoStreamer
                          key={selectedTutorial.videoUrl}
                          videoUrl={selectedTutorial.videoUrl}
                          title={selectedTutorial.title}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-lg font-semibold mb-2">Selecione um tutorial</h2>
                <p className="text-muted-foreground">Escolha um tutorial no menu lateral para começar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
