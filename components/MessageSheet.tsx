import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";
import { Send } from "lucide-react";

interface MessageSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  psychologistName: string;
}

export function MessageSheet({
  open,
  onOpenChange,
  psychologistName,
}: MessageSheetProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      console.log("Mensagem enviada:", {
        to: psychologistName,
        message: message,
        timestamp: new Date(),
      });
      setMessage("");
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='bottom' className='h-[400px]'>
        <SheetHeader>
          <SheetTitle>Enviar mensagem para {psychologistName}</SheetTitle>
        </SheetHeader>
        <div className='flex flex-col h-full'>
          <div className='flex-1 overflow-y-auto p-4'>
            {/* Aqui você pode adicionar o histórico de mensagens */}
          </div>
          <div className='flex gap-2 p-4 border-t'>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Digite sua mensagem...'
              className='flex-1 min-h-[80px] p-2 rounded-md border resize-none focus:outline-none focus:ring-2 focus:ring-primary'
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim()}
              className='self-end'
            >
              <Send className='w-4 h-4' />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
