import { useState, useRef, useEffect, ReactNode } from "react";
import { Button } from "./ui/button";
import { Trash2, Edit2 } from "lucide-react";

interface MessageContextMenuProps {
  messageId: string;
  isOwn: boolean;
  onEdit: () => void;
  onDelete: () => void;
  children: ReactNode;
}

export function MessageContextMenu({
  messageId,
  isOwn,
  onEdit,
  onDelete,
  children,
}: MessageContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isOwn) return; // Only show menu for own messages

    if (contentRef.current) {
      const rect = contentRef.current.getBoundingClientRect();
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    setIsOpen(true);
  };

  return (
    <div
      ref={menuRef}
      onContextMenu={handleContextMenu}
      className="relative"
    >
      <div ref={contentRef}>
        {children}
      </div>
      {isOpen && isOwn && (
        <div
          className="absolute z-50 bg-white/10 backdrop-blur border border-white/20 rounded-lg shadow-lg min-w-[120px]"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        >
          <Button
            onClick={() => {
              onEdit();
              setIsOpen(false);
            }}
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-white hover:bg-white/10 rounded-none first:rounded-t-lg"
          >
            <Edit2 size={16} />
            Edit
          </Button>
          <Button
            onClick={() => {
              onDelete();
              setIsOpen(false);
            }}
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-red-400 hover:bg-red-500/20 rounded-none last:rounded-b-lg"
          >
            <Trash2 size={16} />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
