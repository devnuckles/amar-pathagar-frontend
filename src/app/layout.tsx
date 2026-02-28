import type { Metadata } from 'next'
import './globals.css'
import { ThemeWrapper } from '@/components/theme/theme-wrapper'

export const metadata: Metadata = {
  title: 'Amar Pathagar - Community Library',
  description: 'A trust-based book sharing platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        {/* SVG Filter for hand-drawn/pencil effect */}
        <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
          <defs>
            <filter id="pencil-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence 
                type="fractalNoise" 
                baseFrequency="0.03" 
                numOctaves="3" 
                result="noise"
              />
              <feDisplacementMap 
                in="SourceGraphic" 
                in2="noise" 
                scale="2" 
                xChannelSelector="R" 
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
        
        <ThemeWrapper>
          {children}
        </ThemeWrapper>
      </body>
    </html>
  )
}
