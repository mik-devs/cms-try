import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight, CheckCheck, CircleAlert, Clock3, RefreshCw, Send, X } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';
import type { Language } from '@/lib/translations';

interface ChatMessage {
    id: number;
    role: 'user' | 'bot';
    text: string;
    time: string;
    status?: 'sending' | 'sent' | 'failed';
    actions?: { label: string; url: string }[];
}

const FALLBACK_REPLIES: Record<Language, string> = {
    en: 'Sorry, I am having a technical issue right now. Please try again or call the municipal hall.',
    fil: 'Paumanhin, may technical issue ako ngayon. Subukan muli o tumawag sa municipal hall.',
    ceb: 'Pasensya na, naa koy technical nga problema karon. Palihug sulayi pag-usab o tawag sa municipal hall.',
};

function formatTime(): string {
    return new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date());
}

function BotAvatar({ className }: { className?: string }) {
    return (
        <span
            className={cn(
                'flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-white shadow-sm',
                className,
            )}
        >
            <img
                src="/images/image.webp"
                alt=""
                width={20}
                height={20}
                className="size-5 object-contain"
            />
        </span>
    );
}

function DeliveryStatus({ status }: { status: ChatMessage['status'] }) {
    if (status === 'sending') {
        return <Clock3 className="size-3" aria-hidden="true" />;
    }

    if (status === 'failed') {
        return (
            <CircleAlert className="size-3 text-gold-soft" aria-hidden="true" />
        );
    }

    return <CheckCheck className="size-3" aria-hidden="true" />;
}

export function ChatbotWidget() {
    const { lang, t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>(() => [
        { id: 1, role: 'bot', text: t.chat_greeting, time: formatTime() },
    ]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const nextId = useRef(2);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
                .matches
                ? 'auto'
                : 'smooth',
        });
    }, [messages, isLoading]);

    useEffect(() => {
        setMessages((current) =>
            current.map((message) =>
                message.id === 1 && message.role === 'bot'
                    ? { ...message, text: t.chat_greeting }
                    : message,
            ),
        );
    }, [t.chat_greeting]);

    useEffect(() => {
        if (isOpen) {
            textareaRef.current?.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        const textarea = textareaRef.current;

        if (!textarea) {
            return;
        }

        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
    }, [input]);

    async function requestChat(
        message: string,
        requestLanguage: Language,
        attempt = 0,
    ): Promise<Response> {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN':
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') ?? '',
            },
            body: JSON.stringify({ message, language: requestLanguage }),
        });

        if (
            (response.status === 500 ||
                response.status === 503 ||
                response.status === 429) &&
            attempt < 2
        ) {
            await new Promise((resolve) => setTimeout(resolve, 2000));

            return requestChat(message, requestLanguage, attempt + 1);
        }

        return response;
    }

    async function submitMessage(rawMessage: string) {
        const message = rawMessage.trim();
        const requestLanguage = lang;

        if (!message || isLoading) {
            return;
        }

        const userMessage: ChatMessage = {
            id: nextId.current++,
            role: 'user',
            text: message,
            time: formatTime(),
            status: 'sending',
        };

        setMessages((current) => [...current, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await requestChat(message, requestLanguage);

            const data = (await response.json().catch(() => null)) as {
                reply?:
                    | string
                    | {
                          message?: string;
                          actions?: { label?: string; url?: string }[];
                      };
            } | null;

            if (!response.ok) {
                throw new Error('Request failed');
            }

            const replyData = data?.reply;
            const replyMessage =
                typeof replyData === 'string'
                    ? replyData
                    : replyData?.message ?? FALLBACK_REPLIES[requestLanguage];
            const replyActions =
                typeof replyData === 'string'
                    ? []
                    : (replyData?.actions ?? [])
                          .filter(
                              (action) =>
                                  typeof action?.label === 'string' &&
                                  typeof action?.url === 'string' &&
                                  action.url.startsWith('/') &&
                                  !action.url.includes('//'),
                          )
                          .map((action) => ({
                              label: action.label as string,
                              url: action.url as string,
                          }));

            const botMessage: ChatMessage = {
                id: nextId.current++,
                role: 'bot',
                text: replyMessage,
                time: formatTime(),
                actions: replyActions,
            };

            setMessages((current) => [
                ...current.map((item) =>
                    item.id === userMessage.id
                        ? { ...item, status: 'sent' as const }
                        : item,
                ),
                botMessage,
            ]);
        } catch {
            const botMessage: ChatMessage = {
                id: nextId.current++,
                role: 'bot',
                text: FALLBACK_REPLIES[requestLanguage],
                time: formatTime(),
            };

            setMessages((current) => [
                ...current.map((item) =>
                    item.id === userMessage.id
                        ? { ...item, status: 'failed' as const }
                        : item,
                ),
                botMessage,
            ]);
        } finally {
            setIsLoading(false);
        }
    }

    function sendMessage() {
        void submitMessage(input);
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        sendMessage();
    }

    function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (
            event.key === 'Enter' &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
        ) {
            event.preventDefault();
            sendMessage();
        }
    }

    const showSuggestions = messages.length === 1 && !isLoading;
    const suggestions = [
        t.chat_suggest_hours,
        t.chat_suggest_permit,
        t.chat_suggest_emergency,
    ];

    return (
        <>
            <div
                className={cn(
                    'fixed right-4 bottom-20 z-50 w-[min(calc(100vw-2rem),400px)] origin-bottom-right transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none sm:right-6 sm:bottom-24',
                    isOpen
                        ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
                        : 'pointer-events-none translate-y-4 scale-95 opacity-0',
                )}
                aria-hidden={!isOpen}
                inert={!isOpen}
            >
                <div className="flex h-[450px] max-h-[80vh] flex-col overflow-hidden rounded-[24px] border border-line bg-white shadow-k-deep md:h-[500px]">
                    <header className="flex shrink-0 items-center gap-3 bg-primary px-4 py-3 text-white">
                        <div className="relative">
                            <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-2 ring-gold/70">
                                <img
                                    src="/images/image.webp"
                                    alt="Kiblawan Logo"
                                    width={32}
                                    height={32}
                                    className="size-8 object-contain"
                                />
                            </span>
                            <span
                                className={cn(
                                    'absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-primary bg-green',
                                    isLoading && 'animate-pulse',
                                )}
                                aria-hidden="true"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-display text-sm font-bold">
                                #BastaTagaKiblawanNo.1
                            </p>
                            <p className="flex items-center gap-1.5 text-[0.7rem] text-white/70">
                                <span
                                    className={cn(
                                        'size-1.5 rounded-full bg-green-soft',
                                        isLoading && 'animate-pulse',
                                    )}
                                />
                                {isLoading ? t.chat_typing : t.chat_online}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex size-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                            aria-label="Close chat"
                        >
                            <X className="size-4" />
                        </button>
                    </header>

                    <div
                        role="log"
                        aria-live="polite"
                        aria-relevant="additions text"
                        aria-label="Chat messages"
                        className="k-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto bg-(--color-bg-light) px-3 py-4 sm:px-4"
                    >
                        <div className="flex justify-center">
                            <span className="rounded-full bg-white px-3 py-1 text-[0.65rem] font-semibold text-ink-muted shadow-sm">
                                {t.chat_today}
                            </span>
                        </div>

                        {messages.map((message) => {
                            const isUser = message.role === 'user';

                            return (
                                <div
                                    key={message.id}
                                    className={cn(
                                        'flex items-end gap-2',
                                        isUser
                                            ? 'justify-end'
                                            : 'justify-start',
                                    )}
                                >
                                    {!isUser && <BotAvatar className="mb-4" />}
                                    <div
                                        className={cn(
                                            'flex max-w-[82%] flex-col',
                                            isUser
                                                ? 'items-end'
                                                : 'items-start',
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words shadow-sm',
                                                isUser
                                                    ? 'rounded-br-md bg-primary text-white'
                                                    : 'rounded-bl-md border border-line bg-white text-ink',
                                            )}
                                        >
                                            <p className="whitespace-pre-line">
                                                {message.text}
                                            </p>
                                            {!isUser &&
                                                (message.actions?.length ?? 0) >
                                                    0 && (
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {message.actions?.map(
                                                            (action, index) => (
                                                                <Link
                                                                    key={`${action.url}-${index}`}
                                                                    href={action.url}
                                                                    className="inline-flex items-center rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-dark"
                                                                >
                                                                    {action.label}
                                                                    <ArrowRight className="ml-1 size-3" />
                                                                </Link>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            <span
                                                className={cn(
                                                    'mt-1.5 flex items-center justify-end gap-1 text-[0.65rem] leading-none',
                                                    isUser
                                                        ? 'text-white/75'
                                                        : 'text-ink-muted',
                                                )}
                                            >
                                                {message.time}
                                                {isUser && (
                                                    <DeliveryStatus
                                                        status={message.status}
                                                    />
                                                )}
                                            </span>
                                        </div>
                                        {isUser && message.status === 'failed' && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    void submitMessage(message.text)
                                                }
                                                disabled={isLoading}
                                                className="mt-1 inline-flex items-center gap-1 rounded-full border border-red-200 bg-white px-2.5 py-1 text-[0.7rem] font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <RefreshCw className="size-3" />
                                                Retry
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {isLoading && (
                            <div className="flex items-end gap-2">
                                <BotAvatar className="mb-1" />
                                <div
                                    role="status"
                                    aria-label={t.chat_typing}
                                    className="rounded-2xl rounded-bl-md border border-line bg-white px-4 py-3 shadow-sm"
                                >
                                    <span className="sr-only">
                                        {t.chat_typing}
                                    </span>
                                    <span
                                        className="flex items-center gap-1"
                                        aria-hidden="true"
                                    >
                                        {[0, 160, 320].map((delay) => (
                                            <span
                                                key={delay}
                                                className="size-1.5 k-typing-dot rounded-full bg-ink-muted"
                                                style={{
                                                    animationDelay: `${delay}ms`,
                                                }}
                                            />
                                        ))}
                                    </span>
                                </div>
                            </div>
                        )}

                        {showSuggestions && (
                            <div className="flex flex-wrap gap-2 pl-9">
                                {suggestions.map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        type="button"
                                        onClick={() =>
                                            void submitMessage(suggestion)
                                        }
                                        className="rounded-full border border-line bg-white px-3 py-1.5 text-left text-[0.72rem] font-semibold text-primary shadow-sm transition-colors hover:border-primary/25 hover:bg-cream"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="shrink-0 border-t border-line bg-white px-3 py-3"
                    >
                        <div className="flex items-end gap-2 rounded-[24px] border border-line bg-(--color-bg-light) p-1.5 pr-2 transition-colors focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(event) =>
                                    setInput(event.target.value)
                                }
                                onKeyDown={handleInputKeyDown}
                                placeholder={t.chat_placeholder}
                                rows={1}
                                maxLength={500}
                                autoComplete="off"
                                enterKeyHint="send"
                                className="max-h-[100px] w-full min-w-0 flex-1 resize-none overflow-y-auto bg-transparent px-2 py-1.5 text-sm leading-6 text-ink outline-none placeholder:text-ink-muted"
                                aria-label="Chat message"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Send message"
                            >
                                <Send className="size-4" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className="group fixed right-4 bottom-4 z-50 flex size-16 items-center justify-center rounded-full bg-white shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-transform duration-300 sm:right-6 sm:bottom-6"
                aria-label={
                    isOpen ? 'Close chat assistant' : 'Open chat assistant'
                }
                aria-expanded={isOpen}
            >
                {isOpen ? (
                    <X className="relative size-6 text-primary" />
                ) : (
                    <img
                        src="/images/AI/AI-chatbot.png"
                        alt="Kiblawan AI Assistant"
                        className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                )}
                {!isOpen && (
                    <>
                        <span
                            className="pointer-events-none absolute -inset-1 animate-pulse rounded-full ring-2 ring-gold/40 motion-reduce:animate-none"
                            aria-hidden="true"
                        />
                        <span
                            className="absolute top-0 right-0 size-3.5 rounded-full border-2 border-white bg-green"
                            aria-hidden="true"
                        />
                    </>
                )}
                <span className="pointer-events-none absolute right-full mr-3 hidden w-max rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-k-card transition-opacity duration-200 group-hover:opacity-100 sm:block">
                    Ask #BastaTagaKiblawanNo.1
                </span>
            </button>
        </>
    );
}
