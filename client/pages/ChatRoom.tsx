import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useWalletAddress } from "@/hooks/useTon";
import { apiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConversationMessages } from "@/hooks/api/useConversations";
import { MessageRow } from "@/components/MessageRow";

interface ConversationDetail {
  id: string;
  kind: string;
  orderId?: string | null;
  title?: string | null;
  deadlineISO?: string | null;
  orderTitle?: string | null;
}

interface Message {
  id: string;
  sender: string;
  text: string;
  createdAt: string;
}

// Debounce helper
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timeoutId: number | null = null;
  let lastCallTime = 0;

  return function (...args: any[]) {
    const now = Date.now();
    lastCallTime = now;

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => {
      if (Date.now() - lastCallTime >= delay) {
        fn(...args);
      }
    }, delay);
  };
}

export default function ChatRoom() {
  const { id } = useParams<{ id: string }>();
  const me = useWalletAddress();
  const queryClient = useQueryClient();
  const [conversation, setConversation] = useState<ConversationDetail | null>(
    null,
  );
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [someoneTyping, setSomeoneTyping] = useState(false);
  const typingTimers = useRef<Record<string, number>>({});
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const typingIndicatorRef = useRef<{ timeout: number | null; isTyping: boolean }>({
    timeout: null,
    isTyping: false,
  });

  const lang = (typeof navigator !== "undefined" && navigator.language) || "en";

  // Use React Query hook for messages
  const {
    data,
    isLoading,
    error: messagesError,
    fetchNextPage,
    hasNextPage,
  } = useConversationMessages(id, me);

  // Load conversation metadata once
  useEffect(() => {
    if (!id || !me) return;

    async function loadConversation() {
      try {
        const url = apiUrl(
          `/api/conversations/${id}?address=${encodeURIComponent(me)}`,
        );
        const res = await fetch(url);
        if (res.status === 404) {
          setError("Thread not found");
          setConversation(null);
          return;
        }
        if (res.status === 403) {
          setError("Access denied");
          setConversation(null);
          return;
        }
        if (!res.ok) {
          setError(`Failed to load conversation (${res.status})`);
          setConversation(null);
          return;
        }
        const data = await res.json();
        let orderTitle = null;
        if (data.conversation?.order?.title) {
          orderTitle = String(data.conversation.order.title);
        }

        setConversation({
          id: String(data.conversation?.id ?? id),
          kind: String(data.conversation?.kind ?? "unknown"),
          orderId: data.conversation?.orderId ?? null,
          title: data.conversation?.metadata?.title ?? null,
          deadlineISO: data.conversation?.metadata?.deadlineISO ?? null,
          orderTitle,
        });
        setError(null);

        // Mark as read when loaded
        try {
          await fetch(apiUrl(`/api/inbox/read`), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversationId: id, address: me }),
          });
        } catch {}
      } catch {}
    }

    loadConversation();
  }, [id, me]);

  // Setup SSE for real-time updates
  useEffect(() => {
    if (!id || !me) return;

    const src = new EventSource(
      apiUrl(`/api/stream?address=${encodeURIComponent(me)}`),
    );

    const onMessage = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data || "{}");
        if (String(data.conversationId || "") !== String(id)) return;
        const m = data.message || {};

        // Update React Query cache with new message
        queryClient.setQueryData(
          ["conversationMessages", id],
          (oldData: any) => {
            if (!oldData || !oldData.pages) return oldData;

            const newMessage = {
              id: String(m.id || Math.random()),
              address: String(m.address || ""),
              text: String(m.text || ""),
              createdAt: String(m.createdAt || new Date().toISOString()),
              type: String(m.type || "message"),
              importance: String(m.importance || "normal"),
              channel: String(m.channel || "chat"),
              meta: m.meta || {},
              unread: false,
            };

            // Append to the last page's messages
            const updatedPages = [...oldData.pages];
            if (updatedPages.length > 0) {
              const lastPageIdx = updatedPages.length - 1;
              const lastPage = { ...updatedPages[lastPageIdx] };
              lastPage.messages = [...(lastPage.messages || []), newMessage];
              updatedPages[lastPageIdx] = lastPage;
            }

            return {
              ...oldData,
              pages: updatedPages,
            };
          },
        );

        setTimeout(
          () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
          30,
        );
      } catch {}
    };

    const onTyping = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data || "{}");
        if (String(data.conversationId || "") !== String(id)) return;
        const from = String(data.from || "");
        if (from && from !== me) {
          setSomeoneTyping(Boolean(data.typing));
          const timers = typingTimers.current;
          if (timers[from]) window.clearTimeout(timers[from]);
          timers[from] = window.setTimeout(() => {
            setSomeoneTyping(false);
            delete typingTimers.current[from];
          }, 3000);
        }
      } catch {}
    };

    src.addEventListener("chat.message", onMessage as any);
    src.addEventListener("chat.typing", onTyping as any);

    return () => {
      try {
        src.close();
      } catch {}
      for (const k of Object.keys(typingTimers.current)) {
        window.clearTimeout(typingTimers.current[k]);
      }
      typingTimers.current = {};
    };
  }, [id, me, queryClient]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  }, [data]);

  // Debounced typing indicator
  const sendTypingIndicator = useCallback(
    debounce((isTyping: boolean) => {
      if (!me || !id) return;
      // Fire-and-forget, no await
      fetch(apiUrl(`/api/chat/typing`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: me,
          conversationId: id,
          typing: isTyping,
        }),
      }).catch(() => {});
    }, 300),
    [me, id],
  );

  const handleTyping = useCallback(
    (v: string) => {
      setText(v);
      const isTyping = v.length > 0;

      if (isTyping !== typingIndicatorRef.current.isTyping) {
        typingIndicatorRef.current.isTyping = isTyping;
        sendTypingIndicator(isTyping);
      }

      // Clear inactivity timeout
      if (typingIndicatorRef.current.timeout !== null) {
        clearTimeout(typingIndicatorRef.current.timeout);
      }

      // Set 1.5s inactivity timeout to send typing=false
      if (isTyping) {
        typingIndicatorRef.current.timeout = window.setTimeout(() => {
          typingIndicatorRef.current.isTyping = false;
          sendTypingIndicator(false);
          typingIndicatorRef.current.timeout = null;
        }, 1500);
      }
    },
    [sendTypingIndicator],
  );

  async function send() {
    if (!id || !me || !text.trim()) return;
    const messageText = text;
    const payload: Record<string, unknown> = {
      conversationId: id,
      address: me,
      channel: "chat",
      type: "message",
      importance: "normal",
      lang,
      content: { key: "chat.message", args: { text: messageText } },
      meta: { source: "chat_client" },
    };
    if (conversation?.orderId) {
      payload.orderId = conversation.orderId;
    }

    setText("");
    // Clear typing indicator when sending
    typingIndicatorRef.current.isTyping = false;

    const res = await fetch(apiUrl(`/api/inbox`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    let responseData;
    try {
      responseData = await res.json();
    } catch {}

    // Optimistically update cache with sent message
    if (responseData?.item?.id) {
      queryClient.setQueryData(
        ["conversationMessages", id],
        (oldData: any) => {
          if (!oldData || !oldData.pages) return oldData;

          const newMessage = {
            id: String(responseData.item.id),
            address: me,
            text: messageText,
            createdAt: new Date().toISOString(),
            type: "message",
            importance: "normal",
            channel: "chat",
            meta: {},
            unread: false,
          };

          const updatedPages = [...oldData.pages];
          if (updatedPages.length > 0) {
            const lastPageIdx = updatedPages.length - 1;
            const lastPage = { ...updatedPages[lastPageIdx] };
            lastPage.messages = [...(lastPage.messages || []), newMessage];
            updatedPages[lastPageIdx] = lastPage;
          }

          return {
            ...oldData,
            pages: updatedPages,
          };
        },
      );
    }

    // Mark read (self)
    try {
      await fetch(apiUrl(`/api/inbox/read`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: id, address: me }),
      });
    } catch {}
  }

  // Flatten messages from paginated data
  const allMessages: Message[] = [];
  if (data?.pages) {
    for (const page of data.pages) {
      const mapped = (page.messages || []).map((m: any) => ({
        id: String(m.id),
        sender: String(m.address || ""),
        text: String(m.text || ""),
        createdAt: String(m.createdAt || new Date().toISOString()),
      }));
      allMessages.push(...mapped);
    }
  }

  const displayError = error || messagesError;

  return (
    <div className="h-screen overflow-hidden bg-[hsl(217,33%,9%)] text-white flex flex-col">
      <div className="flex-1 min-h-0 w-full max-w-2xl mx-auto flex flex-col px-4 py-4 mb-[calc(160px+env(safe-area-inset-bottom))]">
        <div className="mb-1 text-lg font-semibold truncate flex-shrink-0">
          {conversation?.kind === "favorites"
            ? "Favorites"
            : conversation?.orderTitle
              ? `chat about ${conversation.orderTitle}`
              : conversation?.title || "Chat"}
        </div>
        {conversation?.deadlineISO && (
          <div className="mb-2 text-xs text-white/60">
            Deadline: {new Date(conversation.deadlineISO).toLocaleString()}
          </div>
        )}

        {!me && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-white/70">
            Connect wallet to access this chat.
          </div>
        )}

        {me && (
          <>
            <div className="flex-1 min-h-0 space-y-1 overflow-y-auto rounded-lg border border-white/10 bg-white/5 p-3">
              {isLoading && <div className="text-white/70">Loading…</div>}
              {!isLoading && !displayError && someoneTyping && (
                <div className="text-white/50 text-xs">
                  Companion is typing…
                </div>
              )}
              {displayError && !isLoading && (
                <div className="text-white/70">{String(displayError)}</div>
              )}
              {!isLoading && !displayError && allMessages.length === 0 && (
                <div className="text-white/70">No messages yet.</div>
              )}
              {hasNextPage && (
                <Button
                  onClick={() => fetchNextPage()}
                  variant="outline"
                  size="sm"
                  className="w-full mb-2"
                >
                  Load Earlier
                </Button>
              )}
              {!isLoading &&
                !displayError &&
                allMessages.map((m) => {
                  const mine = me && m.sender && me === m.sender;
                  return (
                    <MessageRow
                      key={m.id}
                      message={m}
                      isOwn={mine}
                    />
                  );
                })}
              <div ref={bottomRef} />
            </div>

            {someoneTyping && (
              <div className="mt-2 text-xs text-white/60">Typing…</div>
            )}

            {!displayError && (
              <div className="mt-2 flex gap-2 flex-shrink-0">
                <Input
                  value={text}
                  onChange={(e) => handleTyping(e.target.value)}
                  placeholder="Write a message…"
                  className="bg-white/5 text-white border-white/10 h-8 text-sm"
                />
                <Button
                  onClick={send}
                  className="bg-primary text-primary-foreground h-8 px-3 text-sm"
                >
                  Send
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
