import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

// Popular emoji categories - iOS style
const EMOJI_CATEGORIES = {
  recent: { label: "Recent", emojis: [] as string[] },
  smileys: {
    label: "Smileys",
    emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😚", "😙", "🥲", "😋", "😛", "😜", "🤪", "😌", "😔", "😑", "😐", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔"],
  },
  animals: {
    label: "Animals",
    emojis: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜", "🦟", "🦗", "🕷", "🦂"],
  },
  food: {
    label: "Food",
    emojis: ["🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥑", "🍆", "🍅", "🌽", "🌶", "🥒", "🥬", "🥦", "🧄", "🧅", "🍄", "🥜", "🌰", "🍞", "🥐", "🥖", "🥨", "🥯", "🥞", "🧇", "🥚", "🍳", "🧈", "🥞"],
  },
  travel: {
    label: "Travel",
    emojis: ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "🏍", "🏎", "🛵", "🦯", "🦽", "🦼", "🛺", "🚲", "🛴", "🚨", "🚔", "🚍", "🚘", "🚖", "🚡", "🚠", "🎢", "🎡", "🚟", "🚃", "🚋", "🚞", "🚝", "🚄", "🚅", "🚈", "🚂", "🚆", "🚇", "🚊", "🚉", "✈"],
  },
  activity: {
    label: "Activity",
    emojis: ["⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎳", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🥅", "⛳", "⛸", "🎣", "🎽", "🎿", "⛷", "🏂", "🪂", "🛷", "🥌", "🎯", "🪀", "🪃", "🎲", "♠", "♥", "♦", "♣", "♟"],
  },
  objects: {
    label: "Objects",
    emojis: ["⌚", "📱", "📲", "💻", "⌨", "🖥", "🖨", "🖱", "🖲", "🕹", "🗜", "💽", "💾", "💿", "📀", "📧", "📨", "📩", "📤", "📥", "📦", "🏷", "📪", "📫", "📬", "📭", "📮", "✉", "📯", "📜", "📃", "📄", "📑", "🧾", "📊", "📈", "📉", "📇", "🗃", "🗳", "🗄", "📋"],
  },
  symbols: {
    label: "Symbols",
    emojis: ["❤", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "👋", "🤚", "🖐", "✋", "🖖", "👌", "🤌", "🤏", "✌", "🤞", "🫰", "🤟", "🤘", "🤙", "👍", "👎", "☝", "👆", "👇", "☟"],
  },
};

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
  currentEmoji?: string;
}

export function EmojiPicker({
  onEmojiSelect,
  onClose,
  currentEmoji,
}: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>("smileys");
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);

  // Load recent emojis from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("recent-emojis");
    if (stored) {
      setRecentEmojis(JSON.parse(stored).slice(0, 12));
    }
  }, []);

  const handleEmojiSelect = (emoji: string) => {
    // Update recent emojis
    const updated = [emoji, ...recentEmojis.filter((e) => e !== emoji)].slice(0, 12);
    setRecentEmojis(updated);
    localStorage.setItem("recent-emojis", JSON.stringify(updated));

    onEmojiSelect(emoji);
    onClose();
  };

  const categories = {
    ...EMOJI_CATEGORIES,
    recent: {
      ...EMOJI_CATEGORIES.recent,
      emojis: recentEmojis,
    },
  };

  const currentCategory = categories[activeCategory];
  const emojisToShow = currentCategory.emojis.length > 0 ? currentCategory.emojis : categories.smileys.emojis;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={onClose}>
      <div
        className="bg-white/10 backdrop-blur-md rounded-t-3xl w-full max-w-lg mx-auto p-6 max-h-[70vh] flex flex-col animate-in slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Choose Avatar</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Emoji Grid */}
        <div className="flex-1 overflow-y-auto mb-4 pr-2">
          <div className="grid grid-cols-8 gap-2">
            {emojisToShow.map((emoji, idx) => (
              <button
                key={`${activeCategory}-${idx}`}
                onClick={() => handleEmojiSelect(emoji)}
                className={cn(
                  "aspect-square flex items-center justify-center text-2xl rounded-2xl transition-all hover:bg-white/20",
                  currentEmoji === emoji && "bg-primary/30 ring-2 ring-primary"
                )}
                style={{
                  fontFamily: "'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif",
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs - iOS style */}
        <div className="flex gap-3 overflow-x-auto -mx-6 px-6 pb-3 border-t border-white/10 pt-3">
          {Object.entries(categories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key as keyof typeof EMOJI_CATEGORIES)}
              className={cn(
                "px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all flex-shrink-0",
                activeCategory === key
                  ? "bg-primary text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              )}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
