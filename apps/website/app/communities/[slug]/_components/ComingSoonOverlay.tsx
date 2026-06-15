interface ComingSoonOverlayProps {
  title?: string;
  message: string;
}

export function ComingSoonOverlay({ title, message }: ComingSoonOverlayProps) {
  return (
    <div className="absolute inset-0 backdrop-blur-sm bg-white/5 flex items-center justify-center z-10">
      <div className="text-center">
        {title && <h3 className="text-2xl font-bold mb-2">{title}</h3>}
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  );
}
