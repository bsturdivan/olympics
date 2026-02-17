import { cache } from 'react'
import { scrapeMedals } from '@/lib/scraper'
import Image from 'next/image'
import type { Metadata } from 'next'
import './page.css'
import Points from './Points'
import Tooltip from './Tooltip'

export const revalidate = 900

export const getMedals = cache(async () => {
  const data = await scrapeMedals()
  return data.medals
})

export async function generateMetadata(): Promise<Metadata> {
  const cacheBuster = Math.floor(Date.now() / (1000 * 60 * 15))

  const data = await getMedals()
  const leader = data[0]

  const metadataBase = new URL(`${process.env.NEXT_PUBLIC_URL}`)

  if (!leader || leader.country === 'No data available') {
    return {
      metadataBase,
      title: 'Olympic Medal Count — Winter 2026',
      description: 'Live medal standings for the 2026 Winter Olympics.',
    }
  }

  return {
    metadataBase,
    title: `🏅 ${leader.country} is the medal leader 🏅`,
    description: `🥇 ${leader.gold} | 🥈 ${leader.silver} | 🥉 ${leader.bronze}`,
    openGraph: {
      title: `🏅 ${leader.country} is the medal leader 🏅`,
      description: `🥇 ${leader.gold} | 🥈 ${leader.silver} | 🥉 ${leader.bronze}`,
      images: [
        {
          url: `/opengraph-image?v=${cacheBuster}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  }
}

export default async function Home() {
  const medals = await getMedals()

  return (
    <main className='flex font-sans w-full relative min-h-screen hero'>
      <div className='h-full min-h-screen sticky left-0 top-0 min-w-100'>
        <Image
          src='/images/bg.svg'
          alt='Olympic Background'
          width={680}
          height={1000}
          className='w-full h-screen aspect-ratio-[680/1000] object-cover hidden md:block'
        />
      </div>
      <section className='flex flex-col md:px-10 md:py-6 px-4 py-2 md:relative absolute'>
        <div className='flex justify-between w-full md:flex-nowrap flex-wrap-reverse gap-2'>
          <h1 className='text-6xl title md:leading-[1.3em] leading-[1.2em] mb-8 pb-5.5 md:border-b border-gray-200 w-full'>
            Olympic <br /> Medal <br /> Count
          </h1>
          <h3 className='text-xl title leading-[1.3em] align-right mt-4 whitespace-nowrap'>
            Winter 2026
          </h3>
        </div>

        <ul className='text-left list-none w-full table-view'>
          <li className='text-xs text-black mb-4 md:px-0 px-4'>
            <b>*</b>Ranking is based on{' '}
            <a
              target='_blank'
              rel='noindex nofollow'
              href='https://www.topendsports.com/events/summer/medal-tally/rankings-weighted.htm'
            >
              The New York Times weighted point system
            </a>
            : <b>4</b> points for gold, <b>2</b> points for silver, <b>1</b> point for bronze
          </li>
          <li className='font-bold bg-gray-100 sticky md:top-1 top-4 py-2 px-3 rounded-lg grid grid-cols-[auto_3fr_1fr_1fr_1fr_1fr_1fr] gap-2 items-center lg:text-[18px] md:text-[14px] text-[13px]'>
            <span className='py-1 lg:w-15 w-12 text-center lg:pr-2 pr-1 lg:mr-3 mr-2'>Rank</span>
            <span className='py-1 md:opacity-100 opacity-0'>Country</span>
            <span className='py-1 flex items-center justify-center'>
              <Tooltip text='Weighted point total'>
                <Points className='w-6 h-6 cursor-pointer' />
              </Tooltip>
            </span>
            <span className='py-1 text-center'>
              <Tooltip text='Gold medals'>
                <span className='medal medal-gold' />
              </Tooltip>
            </span>
            <span className='py-1 text-center'>
              <Tooltip text='Silver medals'>
                <span className='medal medal-silver' />
              </Tooltip>
            </span>
            <span className='py-1 text-center'>
              <Tooltip text='Bronze medals'>
                <span className='medal medal-bronze' />
              </Tooltip>
            </span>
            <span className='py-1 text-center'>
              <Tooltip text='Medals behind leader'>
                <span className='medal medal-back'>+</span>
              </Tooltip>
            </span>
          </li>
          {medals.map((medal) => (
            <li
              key={medal.country}
              className='lg:text-[18px] md:text-[14px] text-[13px] py-4 border-b md:border-gray-200 border-gray-100/50 last:border-b-0 gap-2 grid grid-cols-[auto_3fr_1fr_1fr_1fr_1fr_1fr] px-3'
            >
              <span className='font-bold text-center lg:w-15 w-12 lg:pr-2 pr-1 lg:mr-3 mr-2 md:border-r border-gray-200/60'>
                {medal.rank}
              </span>
              <div className='flex gap-2'>
                <Image
                  src={medal.flagUrl}
                  alt={medal.country}
                  width={24}
                  height={24}
                  className='inline aspect-square md:w-6 w-5 md:h-6 h-5'
                />
                <strong className='font-bold inline'>{medal.country}</strong>
              </div>
              <span className='text-center'>{medal.calculatedTotal}</span>
              <span className='text-center'>{medal.gold}</span>
              <span className='text-center'>{medal.silver}</span>
              <span className='text-center'>{medal.bronze}</span>
              <span className='text-center'>{medal.medalsBack}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
