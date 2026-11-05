import { ImageResponse } from 'next/og';
import { BRAND } from '@backendmasters/shared';

export const alt = `${BRAND.name}: ${BRAND.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** The default image when a page is shared. Article cover images replace it. */
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 96,
        background: '#10131C',
        color: '#FFFFFF',
      }}
    >
      <svg width="96" height="96" viewBox="0 0 28 28" fill="none">
        <path
          d="M6 14C13 14 12 6 21 6M6 14C13 14 12 22 21 22"
          stroke="#A1A1AA"
          strokeWidth="1.75"
        />
        <circle cx="6" cy="14" r="4" fill="#54D045" />
        <circle cx="22" cy="6" r="2.75" fill="#FFFFFF" />
        <circle cx="22" cy="22" r="2.75" fill="#FFFFFF" />
      </svg>
      <div style={{ marginTop: 40, fontSize: 88, fontWeight: 700 }}>{BRAND.name}</div>
      <div style={{ marginTop: 16, fontSize: 40, color: '#54D045' }}>{BRAND.tagline}</div>
    </div>,
    size,
  );
}
