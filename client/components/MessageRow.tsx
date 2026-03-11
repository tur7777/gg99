import { memo } from "react";

interface Message {
  id: string;
  sender: string;
  text: string;
  createdAt: string;
}

interface MessageRowProps {
  message: Message;
  isOwn: boolean;
}

export const MessageRow = memo(function MessageRow({
  message,
  isOwn,
}: MessageRowProps) {
  return (
    <div className={isOwn ? "text-right" : "text-left"}>
      <div className="inline-block max-w-[85%] rounded-lg bg-white/10 px-3 py-1 text-sm">
        <div className="opacity-70 text-[10px]">
          {isOwn ? "You" : message.sender.slice(0, 6) + "…"}
        </div>
        <div className="whitespace-pre-wrap">{message.text}</div>
      </div>
    </div>
  );
});
