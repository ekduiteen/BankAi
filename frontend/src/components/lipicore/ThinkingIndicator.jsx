export default function ThinkingIndicator({ modelLabel = 'LipiCore' }) {
  return (
    <div className="flex items-center gap-3 py-2 px-1">
      <div className="w-7 h-7 rounded bg-primary-container flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          bolt
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">{modelLabel} is thinking</span>
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
