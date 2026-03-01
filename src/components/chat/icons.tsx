// Chat-specific SVG icons
// Adapted from the chatbot project's icons.tsx (only the icons we need)

export function SparklesIcon({ size = 16 }: { size?: number }) {
    return (
        <svg
            fill="currentColor"
            height={size}
            viewBox="0 0 16 16"
            width={size}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M8 0L9.65 5.35L15 7L9.65 8.65L8 14L6.35 8.65L1 7L6.35 5.35L8 0Z" />
        </svg>
    );
}

export function ArrowUpIcon({ size = 16 }: { size?: number }) {
    return (
        <svg
            fill="none"
            height={size}
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            viewBox="0 0 24 24"
            width={size}
            xmlns="http://www.w3.org/2000/svg"
        >
            <line x1="12" x2="12" y1="19" y2="5" />
            <polyline points="5 12 12 5 19 12" />
        </svg>
    );
}

export function StopIcon({ size = 16 }: { size?: number }) {
    return (
        <svg
            fill="currentColor"
            height={size}
            viewBox="0 0 16 16"
            width={size}
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect height="10" rx="1" ry="1" width="10" x="3" y="3" />
        </svg>
    );
}

export function PaperclipIcon({
    size = 16,
    style,
}: {
    size?: number;
    style?: React.CSSProperties;
}) {
    return (
        <svg
            fill="none"
            height={size}
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            style={style}
            viewBox="0 0 24 24"
            width={size}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
    );
}

export function CopyIcon() {
    return (
        <svg
            fill="none"
            height="14"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            viewBox="0 0 24 24"
            width="14"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect height="13" rx="2" ry="2" width="13" x="9" y="9" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
    );
}

export function CrossSmallIcon({ size = 16 }: { size?: number }) {
    return (
        <svg
            fill="none"
            height={size}
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            viewBox="0 0 24 24"
            width={size}
            xmlns="http://www.w3.org/2000/svg"
        >
            <line x1="18" x2="6" y1="6" y2="18" />
            <line x1="6" x2="18" y1="6" y2="18" />
        </svg>
    );
}
