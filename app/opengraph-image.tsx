import { ImageResponse } from 'next/og'
import { scrapeMedals } from '@/lib/scraper'

export const runtime = 'nodejs'
export const revalidate = 900

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

async function loadFont(): Promise<ArrayBuffer> {
  const fontUrl = process.env.NEXT_PUBLIC_URL
    ? `https://${process.env.NEXT_PUBLIC_URL}/fonts/PrimitivText-Semibold.woff`
    : 'http://localhost:3000/fonts/PrimitivText-Semibold.woff'

  try {
    const response = await fetch(fontUrl)
    if (response.ok) {
      return await response.arrayBuffer()
    }
  } catch (error) {
    console.log('Failed to fetch font from URL, trying filesystem:', error)
  }

  try {
    const { readFile } = await import('fs/promises')
    const { join } = await import('path')
    const fontPath = join(process.cwd(), 'public', 'fonts', 'PrimitivText-Semibold.woff')
    const buffer = await readFile(fontPath)
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
  } catch (error) {
    console.error('Failed to load font:', error)
    return new ArrayBuffer(0)
  }
}

export default async function Image() {
  const data = await scrapeMedals()
  const medals = data.medals.slice(0, 10)

  const primitivRegular = await loadFont()

  return new ImageResponse(
    <div style={{ display: 'flex', fontFamily: 'var(--font-sans)' }}>
      <div style={{ width: '33.33%', display: 'flex', flexDirection: 'column' }}>
        {medals.map((medal, index) => (
          <div
            key={`${medal.country}-left`}
            style={{
              textAlign: 'center',
              padding: '0 1rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              height: '10vh',
              backgroundColor: index % 2 === 0 ? '#FFB114' : '#ffffff',
              color: '#0078D0',
              fontFamily: 'Primitiv, sans-serif',
              fontSize: '1.4rem',
            }}
          >
            <span style={{ fontSize: '1rem' }}>{medal.rank}.</span>
            <img
              src={medal.flagUrl}
              alt={medal.country}
              width={24}
              height={24}
              style={{ width: '24px', height: '24px' }}
            />
            <strong style={{ whiteSpace: 'nowrap' }}>{medal.country}</strong>
          </div>
        ))}
      </div>
      <div style={{ width: '66.66%', display: 'flex', flexDirection: 'column' }}>
        {medals.map((medal, index) => (
          <div
            key={`${medal.country}-right`}
            style={{
              textAlign: 'center',
              padding: '0 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              height: '10vh',
              backgroundColor: index % 2 === 0 ? '#ffffff' : '#FFB114',
              color: '#0078D0',
              fontFamily: 'Primitiv, sans-serif',
              fontSize: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', gap: '1rem', fontWeight: 'bold' }}>
              <span
                style={{
                  display: 'block',
                  margin: 'auto',
                  fontSize: '1.5rem',
                }}
              >
                🥇
              </span>
              {medal.gold}
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontWeight: 'bold' }}>
              <span
                style={{
                  display: 'block',
                  margin: 'auto',
                  fontSize: '1.5rem',
                }}
              >
                🥈
              </span>
              {medal.silver}
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontWeight: 'bold' }}>
              <span
                style={{
                  display: 'block',
                  margin: 'auto',
                  fontSize: '1.5rem',
                }}
              >
                🥉
              </span>
              {medal.bronze}
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontWeight: 'bold' }}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  width: '30px',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    backgroundColor: '#9F8F5E',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    display: 'block',
                    margin: 'auto',
                  }}
                />
                <span
                  style={{
                    backgroundColor: '#969696',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    display: 'block',
                    margin: 'auto',
                  }}
                />
                <span
                  style={{
                    backgroundColor: '#996B4F',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    display: 'block',
                    margin: 'auto',
                  }}
                />
              </div>
              {medal.calculatedTotal}
            </div>
          </div>
        ))}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts:
        primitivRegular.byteLength > 0
          ? [
              {
                name: 'Primitiv',
                data: primitivRegular,
                style: 'normal',
                weight: 700,
              },
            ]
          : [],
    },
  )
}
