import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    ArrowLeft,
    Download,
    FileText,
    MessageSquare,
    Paperclip,
    Search,
    Send,
    Users,
    X,
} from 'lucide-react';
import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type KeyboardEvent,
} from 'react';
import {
    index as chatIndex,
    store as chatStore,
    typing as chatTyping,
} from '@/actions/App/Http/Controllers/Admin/ChatController';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';

interface ChatUser {
    id: number;
    name: string;
    email: string;
}

interface ChatMessage {
    id: number;
    sender_id: number;
    receiver_id: number;
    message: string | null;
    attachment_path?: string | null;
    attachment_name?: string | null;
    attachment_url?: string | null;
    created_at: string | null;
}

interface MessageSentBroadcast extends ChatMessage {
    sender?: {
        id: number | null;
        name: string | null;
    } | null;
}

interface ChatIndexProps {
    users: ChatUser[];
    activeUserId: number | null;
    messages: ChatMessage[];
}

function formatTime(value: string | null): string {
    if (!value) {
        return '';
    }

    return new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
}

function isImageAttachment(filenameOrPath: string | null | undefined): boolean {
    if (!filenameOrPath) {
        return false;
    }

    const ext = filenameOrPath.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(
        ext ?? '',
    );
}

function getAttachmentUrl(item: ChatMessage): string {
    if (item.attachment_url) {
        return item.attachment_url;
    }

    if (!item.attachment_path) {
        return '#';
    }

    if (
        item.attachment_path.startsWith('http') ||
        item.attachment_path.startsWith('/')
    ) {
        return item.attachment_path;
    }

    return `/storage/${item.attachment_path}`;
}

export default function ChatIndex({
    users,
    activeUserId,
    messages: initialMessages,
}: ChatIndexProps) {
    const { auth } = usePage().props;
    const currentUser = auth?.user ?? null;
    const getInitials = useInitials();

    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [message, setMessage] = useState('');
    const [search, setSearch] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showChatMobile, setShowChatMobile] = useState(false);
    const [unreadByUser, setUnreadByUser] = useState<Record<number, number>>(
        {},
    );

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageInputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [attachment, setAttachment] = useState<File | null>(null);
    const [attachmentPreview, setAttachmentPreview] = useState<string | null>(
        null,
    );

    function sendTypingStatus(receiverId: number, isTypingNow: boolean): void {
        axios.post(chatTyping.url(), {
            receiver_id: receiverId,
            is_typing: isTypingNow,
        }, {
            headers: {
                'X-Inertia': false,
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .catch(() => {
                // Silently ignore typing status errors so it doesn't break the UI
            });
    }

    function clearAttachment(): void {
        setAttachment(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    useEffect(() => {
        if (!attachment) {
            setAttachmentPreview(null);
            return;
        }

        if (attachment.type.startsWith('image/')) {
            const url = URL.createObjectURL(attachment);
            setAttachmentPreview(url);
            return () => URL.revokeObjectURL(url);
        }

        setAttachmentPreview(null);
    }, [attachment]);

    const activeUser = useMemo(
        () => users.find((user) => user.id === activeUserId) ?? null,
        [activeUserId, users],
    );

    const filteredUsers = useMemo(() => {
        const searchTerm = search.trim().toLowerCase();

        if (!searchTerm) {
            return users;
        }

        return users.filter(
            (user) =>
                user.name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm),
        );
    }, [search, users]);

    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

    useEffect(() => {
        if (activeUserId === null) {
            return;
        }

        setUnreadByUser((current) => {
            if (!current[activeUserId]) {
                return current;
            }

            const next = { ...current };
            delete next[activeUserId];

            return next;
        });
    }, [activeUserId]);

    useEffect(() => {
        const echo = window.Echo;
        const currentUserId = currentUser?.id;

        if (!echo || !currentUserId) {
            return;
        }

        const channel = echo.private(`chat.${currentUserId}`);

        channel.listen('MessageSent', (event: MessageSentBroadcast) => {
            if (activeUserId === event.sender_id) {
                setMessages((current) => {
                    if (current.some((item) =>
                        item.id === event.id ||
                        (item.sender_id === event.sender_id &&
                            item.receiver_id === event.receiver_id &&
                            item.message === event.message),
                    )) {
                        return current;
                    }

                    return [...current, event];
                });

                return;
            }

            setUnreadByUser((current) => ({
                ...current,
                [event.sender_id]: (current[event.sender_id] ?? 0) + 1,
            }));
        });

        channel.listen('UserTyping', (e: { sender_id: number; is_typing: boolean }) => {
            if (e.sender_id !== activeUserId) {
                return;
            }

            setIsTyping(e.is_typing);

            if (e.is_typing) {
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }

                typingTimeoutRef.current = setTimeout(() => {
                    setIsTyping(false);
                }, 3000);
            }else {
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = null;
                }
            }
        });

        return () => {
            echo.leave(`chat.${currentUserId}`);
        };
    }, [activeUserId, currentUser?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
                .matches
                ? 'auto'
                : 'smooth',
        });
    }, [messages]);

    useEffect(() => {
        messageInputRef.current?.focus();
        clearAttachment();
    }, [activeUserId]);

    function selectUser(userId: number): void {
        setShowChatMobile(true);
        router.get(
            chatIndex.url({ query: { user_id: userId } }),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                forceFormData: Boolean(attachment),
                replace: true,
            },
        );
    }

    function sendMessage(): void {
        const body = message.trim();

        if ((!body && !attachment) || activeUserId === null || isSending) {
            return;
        }

        setIsSending(true);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
        sendTypingStatus(activeUserId, false);

        const tempId = Date.now();
        const attachmentObj = attachment ?? null;

        const newMessage: ChatMessage = {
            id: tempId,
            sender_id: currentUser?.id ?? 0,
            receiver_id: activeUserId,
            message: body || null,
            attachment_path: null,
            attachment_name: attachmentObj?.name ?? null,
            attachment_url: null,
            created_at: new Date().toISOString(),
        };

        setMessages((current) => {
            if (current.some((item) => item.id === tempId)) {
                return current;
            }

            return [...current, newMessage];
        });

        setMessage('');
        clearAttachment();

        const formData = new FormData();
        formData.append('receiver_id', String(activeUserId));
        formData.append('message', body);
        if (attachmentObj) {
            formData.append('attachment', attachmentObj);
        }

        axios.post(chatStore.url(), formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-Inertia': false,
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then(() => {
                // Request succeeded - WebSocket event will handle adding the real message
                // Optimistic message will be deduped by the WebSocket listener
            })
            .catch((error) => {
                setMessages((current) => current.filter((item) => item.id !== tempId));
            })
            .finally(() => setIsSending(false));
    }

    function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
        if (
            event.key === 'Enter' &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
        ) {
            event.preventDefault();
            sendMessage();
        }
    }

    return (
        <>
            <Head title="Internal Chat" />
            <div className="flex h-[calc(100dvh-4rem)] overflow-hidden bg-(--color-bg-light)">
                <aside
                    className={cn(
                        'w-full flex-col border-r border-line bg-white md:flex md:w-64 md:shrink-0 lg:w-72',
                        showChatMobile ? 'hidden md:flex' : 'flex',
                    )}
                >
                    <div className="border-b border-line px-4 py-4">
                        <div className="flex items-center gap-2">
                            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <MessageSquare className="size-4" />
                            </span>
                            <div className="min-w-0">
                                <h1 className="font-display text-lg font-bold text-primary">
                                    Internal Chat
                                </h1>
                                <p className="text-[11px] text-ink-muted">
                                    LGU staff messages
                                </p>
                            </div>
                        </div>

                        <div className="relative mt-3">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-ink-muted" />
                            <Input
                                id="staff-search" // ✅ Idinagdag
                                name="search"      // ✅ Idinagdag
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search staff..."
                                className="h-9 pl-8 text-sm"
                                aria-label="Search staff"
                            />
                        </div>
                    </div>

                    <div className="k-scrollbar min-h-0 flex-1 overflow-y-auto p-2">
                        {filteredUsers.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                                <Users className="size-6 text-ink-muted/60" />
                                <p className="text-xs text-ink-muted">
                                    No staff found.
                                </p>
                            </div>
                        ) : (
                            <ul className="space-y-1">
                                {filteredUsers.map((user) => {
                                    const isActive = user.id === activeUserId;
                                    const unread = unreadByUser[user.id] ?? 0;

                                    return (
                                        <li key={user.id}>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    selectUser(user.id)
                                                }
                                                className={cn(
                                                    'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors',
                                                    isActive
                                                        ? 'bg-primary text-white shadow-sm'
                                                        : 'text-ink hover:bg-(--color-bg-light)',
                                                )}
                                            >
                                                <Avatar className="size-9 shrink-0 border border-line/60">
                                                    <AvatarFallback
                                                        className={cn(
                                                            'text-[11px] font-semibold',
                                                            isActive
                                                                ? 'bg-white/15 text-white'
                                                                : 'bg-primary text-white',
                                                        )}
                                                    >
                                                        {getInitials(user.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-sm font-semibold">
                                                        {user.name}
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            'block truncate text-[11px]',
                                                            isActive
                                                                ? 'text-white/70'
                                                                : 'text-ink-muted',
                                                        )}
                                                    >
                                                        {user.email}
                                                    </span>
                                                </span>
                                                {unread > 0 && (
                                                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-ink">
                                                        {unread > 9
                                                            ? '9+'
                                                            : unread}
                                                    </span>
                                                )}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </aside>

                <section
                    className={cn(
                        'min-w-0 flex-1 flex-col',
                        showChatMobile ? 'flex' : 'hidden md:flex',
                    )}
                >
                    {activeUser ? (
                        <>
                            <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line bg-white px-4 shadow-sm sm:px-5">
                                <button
                                    type="button"
                                    onClick={() => setShowChatMobile(false)}
                                    className="flex size-9 shrink-0 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-(--color-bg-light) hover:text-primary md:hidden"
                                    aria-label="Back to Staff List"
                                    title="Back to Staff List"
                                >
                                    <ArrowLeft className="size-5" />
                                </button>
                                <Avatar className="size-10 border border-line">
                                    <AvatarFallback className="bg-primary text-xs font-semibold text-white">
                                        {getInitials(activeUser.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold text-primary">
                                        {activeUser.name}
                                    </p>
                                    <p className="flex items-center gap-1.5 truncate text-[11px] text-ink-muted">
                                        <span className="size-1.5 rounded-full bg-green" />
                                        Active now
                                    </p>
                                </div>
                            </header>

                            <div className="k-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-6">
                                <div className="flex justify-center">
                                    <span className="rounded-full border border-line bg-white px-3 py-1 text-[10px] font-semibold text-ink-muted">
                                        Conversation with {activeUser.name}
                                    </span>
                                </div>

                                {messages.length === 0 ? (
                                    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                                        <MessageSquare className="size-8 text-primary/20" />
                                        <p className="text-sm font-semibold text-primary">
                                            Start the conversation
                                        </p>
                                        <p className="max-w-xs text-xs text-ink-muted">
                                            Send a message to {activeUser.name}.
                                        </p>
                                    </div>
                                ) : (
                                    messages.map((item) => {
                                        const isOwn =
                                            item.sender_id === currentUser?.id;

                                        return (
                                            <div
                                                key={item.id}
                                                className={cn(
                                                    'flex',
                                                    isOwn
                                                        ? 'justify-end'
                                                        : 'justify-start',
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        'flex max-w-[85%] flex-col sm:max-w-[70%]',
                                                        isOwn
                                                            ? 'items-end'
                                                            : 'items-start',
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words shadow-sm',
                                                            isOwn
                                                                ? 'rounded-br-md bg-primary text-white'
                                                                : 'rounded-bl-md border border-line bg-white text-ink',
                                                        )}
                                                    >
                                                        <p className="whitespace-pre-line">
                                                            {item.attachment_path && (
                                                                <span className="mb-2 block">
                                                                    {isImageAttachment(
                                                                        item.attachment_name ||
                                                                            item.attachment_path,
                                                                    ) ? (
                                                                        <a
                                                                            href={getAttachmentUrl(
                                                                                item,
                                                                            )}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="block overflow-hidden rounded-xl"
                                                                        >
                                                                            <img
                                                                                src={getAttachmentUrl(
                                                                                    item,
                                                                                )}
                                                                                alt={
                                                                                    item.attachment_name ??
                                                                                    'Attachment'
                                                                                }
                                                                                className="max-h-60 max-w-full rounded-xl object-cover transition-opacity hover:opacity-95"
                                                                                loading="lazy"
                                                                            />
                                                                        </a>
                                                                    ) : (
                                                                        <a
                                                                            href={getAttachmentUrl(
                                                                                item,
                                                                            )}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            download={
                                                                                item.attachment_name ??
                                                                                undefined
                                                                            }
                                                                            className={cn(
                                                                                'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors',
                                                                                isOwn
                                                                                    ? 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                                                                                    : 'border-line bg-(--color-bg-light) text-primary hover:bg-cream',
                                                                            )}
                                                                        >
                                                                            <FileText className="size-4 shrink-0" />
                                                                            <span className="max-w-[180px] truncate">
                                                                                {item.attachment_name ??
                                                                                    'Download document'}
                                                                            </span>
                                                                            <Download className="ml-1 size-3.5 shrink-0 opacity-70" />
                                                                        </a>
                                                                    )}
                                                                </span>
                                                            )}
                                                            {item.message}
                                                        </p>
                                                        <span
                                                            className={cn(
                                                                'mt-1 flex items-center justify-end text-[10px] leading-none',
                                                                isOwn
                                                                    ? 'text-white/70'
                                                                    : 'text-ink-muted',
                                                            )}
                                                        >
                                                            {formatTime(
                                                                item.created_at,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}

                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-line bg-white px-4 py-3 shadow-sm">
                                            <span
                                                className="size-2 rounded-full bg-ink-muted animate-bounce"
                                                style={{ animationDelay: '0ms' }}
                                            />
                                            <span
                                                className="size-2 rounded-full bg-ink-muted animate-bounce"
                                                style={{ animationDelay: '150ms' }}
                                            />
                                            <span
                                                className="size-2 rounded-full bg-ink-muted animate-bounce"
                                                style={{ animationDelay: '300ms' }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    sendMessage();
                                }}
                                className="shrink-0 border-t border-line bg-white px-4 py-3 sm:px-5"
                            >
                                {attachment && (
                                    <div className="mb-2 flex items-center gap-2.5 rounded-xl border border-line bg-(--color-bg-light) p-2 shadow-xs">
                                        {attachmentPreview ? (
                                            <img
                                                src={attachmentPreview}
                                                alt="Attachment preview"
                                                className="size-12 rounded-lg border border-line object-cover"
                                            />
                                        ) : (
                                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <FileText className="size-5" />
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-semibold text-ink">
                                                {attachment.name}
                                            </p>
                                            <p className="text-[10px] text-ink-muted">
                                                {(
                                                    attachment.size / 1024
                                                ).toFixed(1)}{' '}
                                                KB
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={clearAttachment}
                                            className="flex size-7 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-cream hover:text-red-600"
                                            aria-label="Remove attachment"
                                            title="Remove attachment"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                )}
                                <div className="flex items-end gap-2 rounded-2xl border border-line bg-(--color-bg-light) p-1.5 pr-2 transition-colors focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10">
                                    <input
                                        id="chat-attachment-input" // ✅ Idinagdag
                                        name="attachment"           // ✅ Idinagdag
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={(event) => {
                                            const file =
                                                event.target.files?.[0] ?? null;
                                            if (file) {
                                                setAttachment(file);
                                            }
                                        }}
                                        className="hidden"
                                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        aria-label="Attach file"
                                        title="Attach image or document"
                                        className="flex size-9 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-white hover:text-primary"
                                    >
                                        <Paperclip className="size-4" />
                                    </button>
                                    <textarea
                                        id="chat-message-input" // ✅ Idinagdag
                                        name="message"          // ✅ Idinagdag
                                        ref={messageInputRef}
                                        value={message}
                                        onChange={(event) => {
                                            setMessage(event.target.value);

                                            if (activeUserId === null) {
                                                return;
                                            }

                                            sendTypingStatus(activeUserId, true);

                                            if (typingTimeoutRef.current) {
                                                clearTimeout(typingTimeoutRef.current);
                                            }

                                            typingTimeoutRef.current = setTimeout(() => {
                                                sendTypingStatus(activeUserId, false);
                                            }, 2000);
                                        }}
                                        onKeyDown={handleKeyDown}
                                        placeholder={`Message ${activeUser.name}...`}
                                        rows={1}
                                        maxLength={2000}
                                        autoComplete="off"
                                        aria-label="Chat message"
                                        className="max-h-32 w-full min-w-0 flex-1 resize-none overflow-y-auto bg-transparent px-2.5 py-2 text-sm leading-6 text-ink outline-none placeholder:text-ink-muted"
                                    />
                                    <button
                                        type="submit"
                                        disabled={
                                            (!message.trim() && !attachment) ||
                                            isSending
                                        }
                                        aria-label="Send message"
                                        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <Send className="size-4" />
                                    </button>
                                </div>
                                <p className="mt-1.5 px-2 text-[10px] text-ink-muted">
                                    Press Enter to send, Shift + Enter for a new
                                    line.
                                </p>
                            </form>
                        </>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                            <button
                                type="button"
                                onClick={() => setShowChatMobile(false)}
                                className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-semibold text-primary shadow-xs transition-colors hover:bg-(--color-bg-light) md:hidden"
                            >
                                <ArrowLeft className="size-4" />
                                Back to Staff List
                            </button>
                            <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <MessageSquare className="size-7" />
                            </span>
                            <div>
                                <h2 className="font-display text-xl font-bold text-primary">
                                    Your messages
                                </h2>
                                <p className="mt-1 max-w-sm text-sm text-ink-muted">
                                    Select a staff member from the left to start
                                    a private conversation.
                                </p>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}