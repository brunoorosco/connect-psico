import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  replyContent: string;
  onChange: (value: string) => void;
  onSend: () => void;
};

export const ReplyBox = ({ replyContent, onChange, onSend }: Props) => (
  <div className="mt-4 border-t">
    <Textarea
      value={replyContent}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Digite sua mensagem..."
      className="w-full text-sm"
      rows={3}
    />
    <div className="flex justify-end mt-2">
      <Button
        variant="default"
        size="sm"
        onClick={onSend}
        disabled={!replyContent.trim()}
        className="text-xs"
      >
        Enviar
      </Button>
    </div>
  </div>
);
