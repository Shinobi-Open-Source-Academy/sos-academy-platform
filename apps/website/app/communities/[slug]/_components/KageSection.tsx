import type { Community } from '../../../../lib/api-client';
import { ComingSoonOverlay } from './ComingSoonOverlay';

interface KageSectionProps {
  kage: Community['kage'];
  communityColor: string;
}

export function KageSection({ kage, communityColor }: KageSectionProps) {
  if (!kage) {
    return (
      <div className="relative border border-white/10 p-6">
        <ComingSoonOverlay message="Kage to be assigned" />
        <div className="opacity-20 pointer-events-none">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full bg-zinc-800" />
            <div className="flex-1">
              <div className="h-6 bg-zinc-800 w-32 mb-2" />
              <div className="h-4 bg-zinc-800 w-24 mb-2" />
              <div className="h-4 bg-zinc-800 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-white/10 p-6 bg-gradient-to-br from-white/5 to-white/[0.02]">
      <div className="flex items-start gap-6">
        <div className="relative flex-shrink-0">
          <div
            className="absolute inset-0 border-2 rounded-full"
            style={{ borderColor: `${communityColor}60`, transform: 'scale(1.15)' }}
          />
          <div
            className="absolute inset-0 border rounded-full"
            style={{ borderColor: `${communityColor}40`, transform: 'scale(1.08)' }}
          />
          {kage.githubProfile?.avatarUrl ? (
            <img
              src={kage.githubProfile.avatarUrl}
              alt={kage.name}
              className="relative w-24 h-24 object-cover border-2 rounded-full"
              style={{ borderColor: communityColor }}
            />
          ) : (
            <div
              className="relative w-24 h-24 bg-zinc-800 flex items-center justify-center text-zinc-500 text-3xl font-medium border-2 rounded-full"
              style={{ borderColor: communityColor }}
            >
              {kage.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div
            className="absolute -bottom-1 -right-1 w-8 h-8 flex items-center justify-center text-xs font-bold border-2 bg-black rounded-full"
            style={{ borderColor: communityColor, color: communityColor }}
            title="Community Kage"
          >
            K
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold">{kage.name}</h3>
            <span
              className="text-xs font-bold px-2 py-0.5 border"
              style={{
                borderColor: `${communityColor}40`,
                color: communityColor,
                backgroundColor: `${communityColor}10`,
              }}
            >
              KAGE
            </span>
          </div>
          {kage.title && <p className="text-sm text-gray-500 mb-2">{kage.title}</p>}
          {kage.description && <p className="text-sm text-gray-400 mb-3">{kage.description}</p>}
          {kage.githubProfile?.htmlUrl && (
            <a
              href={kage.githubProfile.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 transition-colors"
            >
              View GitHub Profile
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-label="External link"
              >
                <title>External link</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
