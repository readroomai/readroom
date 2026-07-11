export const APP_NAV = [
  { href: '/home', label: 'Home', icon: 'Home' },
  { href: '/new', label: 'New Read', icon: 'PenLine' },
  { href: '/rooms', label: 'Rooms', icon: 'Users' },
  { href: '/voiceprints', label: 'Voiceprints', icon: 'Fingerprint' },
  { href: '/audit', label: 'Profile Audit', icon: 'UserSearch' },
  { href: '/compare', label: 'Compare', icon: 'GitCompareArrows' },
  { href: '/history', label: 'History', icon: 'Clock' },
  { href: '/settings', label: 'Settings', icon: 'Settings' },
] as const;

export type NavItem = (typeof APP_NAV)[number];
