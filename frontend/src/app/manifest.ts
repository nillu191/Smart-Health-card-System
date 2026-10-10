import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TRINAYORA — 3D Digital Health ID & Connected Hospital Network',
    short_name: 'TRINAYORA',
    description: 'Next-generation RFID + dynamic single-use QR medical identity and clinical records platform.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0f19',
    theme_color: '#0284c7',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
