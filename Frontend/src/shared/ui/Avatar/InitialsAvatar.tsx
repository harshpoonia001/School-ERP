import React from 'react';

interface InitialsAvatarProps {
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  title?: string;
}

// Warm, muted tactile palette variants
const AVATAR_PALETTES = [
  { bg: '#E1ECE5', text: '#2F593E', border: '#C4DCC8' }, // Laurel green tint
  { bg: '#EAF2EC', text: '#3E6B4C', border: '#D0E3D3' }, // Sage tint
  { bg: '#EDEBE4', text: '#47544B', border: '#D9D3C7' }, // Alabaster stone
  { bg: '#E8EDF5', text: '#2F4F6F', border: '#C8D7EA' }, // Slate sky tint
  { bg: '#FDF3E3', text: '#855815', border: '#F7DCAD' }, // Sand amber tint
];

function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return '??';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getPalette(name?: string | null) {
  if (!name) return AVATAR_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
}

export const InitialsAvatar: React.FC<InitialsAvatarProps> = ({
  name,
  size = 'md',
  className = '',
  title,
}) => {
  const initials = getInitials(name);
  const palette = getPalette(name);

  return (
    <div
      className={`initials-avatar ${size} ${className}`}
      style={{
        backgroundColor: palette.bg,
        color: palette.text,
        borderColor: palette.border,
      }}
      title={title || name || undefined}
      aria-label={name || 'User avatar'}
    >
      <span>{initials}</span>
    </div>
  );
};
