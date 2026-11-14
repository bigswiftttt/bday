export default function Balloon({ color }: { color: string }) {
    return (
        <svg
            viewBox="0 0 100 200"
            className="block h-auto w-full overflow-visible"
            aria-hidden="true"
        >
            <path
                d="M50 126 C 38 142, 62 158, 50 174 S 44 192, 50 198"
                fill="none"
                stroke="#f3ede2"
                strokeOpacity="0.35"
                strokeWidth="1.2"
            />
            <path
                d="M50 4 C 80 4 96 30 96 56 C 96 90 70 112 50 116 C 30 112 4 90 4 56 C 4 30 20 4 50 4 Z"
                fill={color}
            />
            <path d="M50 114 L43 127 L57 127 Z" fill={color} />
        </svg>
    );
}