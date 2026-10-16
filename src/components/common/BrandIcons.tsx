import React from 'react';

/**
 * Official messaging platform brand marks.
 * Reference sources:
 * - Telegram: Telegram Core Brand Guidelines (https://telegram.org)
 * - WhatsApp: Meta Brand Resources - WhatsApp (https://about.meta.com/brand/resources/whatsapp)
 * - Discord: Discord Brand & Clyde Guidelines (https://discord.com/branding)
 *
 * All icons rendered as scalable, crisp SVGs with standard 24x24 / 16x16 viewbox proportions.
 */

interface IconProps {
  size?: number;
  className?: string;
  badge?: boolean;
}

// 1. Official Telegram Brand Mark
export const TelegramIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-label="Telegram"
  >
    <circle cx="12" cy="12" r="12" fill="#229ED9" />
    <path
      d="M5.4 12.05L16.8 7.25C17.6 6.95 18.3 7.45 18 8.65L16 18.05C15.85 18.75 15.35 18.95 14.75 18.55L11.45 16.15L9.85 17.65C9.65 17.85 9.45 18.05 9.15 18.05L9.35 14.75L15.35 9.35C15.65 9.15 15.35 8.95 14.95 9.25L7.55 13.95L4.35 12.95C3.65 12.75 3.65 12.25 4.55 11.95L5.4 12.05Z"
      fill="white"
    />
  </svg>
);

// 2. Official WhatsApp Brand Mark
export const WhatsAppIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-label="WhatsApp"
  >
    <circle cx="12" cy="12" r="12" fill="#25D366" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M17.48 14.54C17.18 14.39 15.71 13.66 15.43 13.56C15.16 13.46 14.96 13.41 14.76 13.71C14.56 14.01 13.99 14.68 13.81 14.88C13.64 15.08 13.46 15.11 13.16 14.96C12.86 14.81 11.91 14.49 10.78 13.49C9.89 12.7 9.3 11.73 9.12 11.43C8.95 11.13 9.1 10.97 9.25 10.82C9.39 10.69 9.55 10.47 9.7 10.29C9.85 10.12 9.9 9.99 10 9.79C10.1 9.59 10.05 9.42 9.97 9.27C9.9 9.12 9.3 7.64 9.05 7.04C8.81 6.46 8.56 6.54 8.38 6.53C8.21 6.52 8.01 6.52 7.81 6.52C7.61 6.52 7.28 6.6 7.01 6.89C6.73 7.19 5.96 7.91 5.96 9.39C5.96 10.87 7.03 12.3 7.18 12.5C7.33 12.7 9.29 15.72 12.29 17.02C13.01 17.33 13.57 17.51 14 17.65C14.71 17.88 15.37 17.85 15.88 17.77C16.45 17.69 17.64 17.05 17.89 16.35C18.14 15.65 18.14 15.05 18.06 14.93C17.99 14.8 17.78 14.69 17.48 14.54Z"
      fill="white"
    />
  </svg>
);

// 3. Official Discord "Clyde" Brand Mark
export const DiscordIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-label="Discord"
  >
    <circle cx="12" cy="12" r="12" fill="#5865F2" />
    <path
      d="M16.92 7.78C15.86 7.29 14.72 6.94 13.52 6.75C13.5 6.75 13.48 6.76 13.47 6.78C13.32 7.04 13.16 7.38 13.04 7.65C11.77 7.46 10.51 7.46 9.26 7.65C9.14 7.37 8.97 7.04 8.82 6.78C8.81 6.76 8.79 6.75 8.77 6.75C7.57 6.94 6.43 7.29 5.37 7.78C5.36 7.78 5.35 7.79 5.34 7.8C3.17 11.04 2.58 14.2 2.87 17.32C2.87 17.34 2.89 17.36 2.9 17.37C4.33 18.42 5.72 19.06 7.08 19.49C7.11 19.5 7.13 19.49 7.15 19.47C7.47 19.03 7.76 18.57 8.01 18.08C8.02 18.05 8.01 18.02 7.98 18.01C7.52 17.84 7.08 17.62 6.67 17.36C6.64 17.34 6.63 17.3 6.64 17.27C6.73 17.2 6.81 17.13 6.9 17.07C6.92 17.05 6.94 17.05 6.96 17.06C9.72 18.32 12.72 18.32 15.45 17.06C15.47 17.05 15.49 17.05 15.51 17.07C15.6 17.14 15.68 17.2 15.77 17.27C15.78 17.3 15.77 17.34 15.74 17.36C15.33 17.63 14.89 17.84 14.43 18.01C14.4 18.02 14.39 18.05 14.4 18.08C14.65 18.57 14.94 19.03 15.26 19.47C15.28 19.49 15.3 19.5 15.33 19.49C16.7 19.06 18.09 18.42 19.52 17.37C19.53 17.36 19.54 17.34 19.54 17.32C19.9 13.71 18.96 10.58 16.95 7.8C16.94 7.79 16.93 7.78 16.92 7.78ZM8.42 15.33C7.6 15.33 6.93 14.58 6.93 13.66C6.93 12.74 7.59 11.99 8.42 11.99C9.26 11.99 9.93 12.74 9.91 13.66C9.91 14.58 9.25 15.33 8.42 15.33ZM13.88 15.33C13.06 15.33 12.39 14.58 12.39 13.66C12.39 12.74 13.04 11.99 13.88 11.99C14.72 11.99 15.39 12.74 15.37 13.66C15.37 14.58 14.72 15.33 13.88 15.33Z"
      fill="white"
    />
  </svg>
);

// 4. PROJEX In-App Chat Mark
export const ProjexChatIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-label="PROJEX In-app Chat"
  >
    <circle cx="12" cy="12" r="12" fill="#1E60FF" />
    <path
      d="M7 11.5C7 8.46 9.24 6 12 6C14.76 6 17 8.46 17 11.5C17 14.54 14.76 17 12 17C11.19 17 10.43 16.78 9.77 16.39L7.5 17.5L8.03 15.27C7.39 14.23 7 12.92 7 11.5Z"
      fill="white"
    />
    <circle cx="10" cy="11.5" r="1" fill="#1E60FF" />
    <circle cx="12" cy="11.5" r="1" fill="#1E60FF" />
    <circle cx="14" cy="11.5" r="1" fill="#1E60FF" />
  </svg>
);

// 5. Email Communication Mark
export const EmailChannelIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-label="Email"
  >
    <circle cx="12" cy="12" r="12" fill="#475569" />
    <path
      d="M6.5 8C6.22 8 6 8.22 6 8.5V15.5C6 15.78 6.22 16 6.5 16H17.5C17.78 16 18 15.78 18 15.5V8.5C18 8.22 17.78 8 17.5 8H6.5ZM7.2 9H16.8L12 12.2L7.2 9ZM7 9.87L11.52 12.88C11.81 13.07 12.19 13.07 12.48 12.88L17 9.87V15H7V9.87Z"
      fill="white"
    />
  </svg>
);

// Channel Icon Dispatcher
export const ChannelBrandIcon: React.FC<{ channel: string; size?: number; className?: string }> = ({
  channel,
  size = 20,
  className = '',
}) => {
  const norm = channel.toLowerCase();
  if (norm.includes('telegram')) return <TelegramIcon size={size} className={className} />;
  if (norm.includes('whatsapp')) return <WhatsAppIcon size={size} className={className} />;
  if (norm.includes('discord')) return <DiscordIcon size={size} className={className} />;
  if (norm.includes('email')) return <EmailChannelIcon size={size} className={className} />;
  return <ProjexChatIcon size={size} className={className} />;
};
