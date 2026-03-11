import { memo, useState } from "react";
import { MessageContextMenu } from "./MessageContextMenu";

interface Message {
  id: string;
  sender: string;
  text: string;
  createdAt: string;
}

interface MessageRowProps {
  message: Message;
  isOwn: boolean;
  onEdit?: (messageId: string, newText: string) => void;
  onDelete?: (messageId: string) => void;
}

export const MessageRow = memo(function MessageRow({
  message,
  isOwn,
  onEdit,
  onDelete,
}: MessageRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && onEdit) {
      onEdit(message.id, editText);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditText(message.text);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(message.id);
    }
  };

  if (isEditing) {
    return (
      <div className={isOwn ? "text-right" : "text-left"}>
        <div className="inline-block max-w-[85%] rounded-lg bg-white/10 px-3 py-2 text-sm">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full bg-white/10 text-white rounded px-2 py-1 text-sm resize-none"
            rows={3}
          />
          <div className="flex gap-2 mt-2 justify-end">
            <button
              onClick={handleCancelEdit}
              className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MessageContextMenu
      messageId={message.id}
      isOwn={isOwn}
      onEdit={handleEditClick}
      onDelete={handleDeleteClick}
    >
      <div className={isOwn ? "text-right" : "text-left"}>
        <div className="inline-block max-w-[85%] rounded-lg bg-white/10 px-3 py-1 text-sm hover:bg-white/20 transition-colors cursor-context-menu">
          <div className="opacity-70 text-[10px]">
            {isOwn ? "You" : message.sender.slice(0, 6) + "…"}
          </div>
          <div className="whitespace-pre-wrap">{message.text}</div>
        </div>
      </div>
    </MessageContextMenu>
  );
});
