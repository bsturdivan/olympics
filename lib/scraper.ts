import * as cheerio from 'cheerio'

const MEDALS_URL = 'https://sports.yahoo.com/olympics/medals/'

export interface MedalEntry {
  rank: number
  country: string
  flagUrl: string
  gold: number
  silver: number
  bronze: number
  total: number
  calculatedTotal: number
  medalsBack: number
}

export interface MedalData {
  fetchedAt: string
  medals: MedalEntry[]
}

function mutiplyMedals({
  gold,
  silver,
  bronze,
}: {
  gold: number
  silver: number
  bronze: number
}): number {
  const g = gold * 4
  const s = silver * 2

  return g + s + bronze
}

export async function scrapeMedals(): Promise<MedalData> {
  const response = await fetch(MEDALS_URL, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    next: {
      revalidate: 3600,
      tags: ['medals-data'],
    },
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unable to read error response')
    console.error('Failed to fetch medals:', {
      status: response.status,
      statusText: response.statusText,
      url: MEDALS_URL,
      errorPreview: errorText.slice(0, 200),
    })
    throw new Error(`Failed to fetch medals page: ${response.status} ${response.statusText}`)
  }

  const html = await response.text()
  const $ = cheerio.load(html)

  const medals: MedalEntry[] = []

  const $section = $('section#medals, [id="medals"]')
  const $rows = $section.length > 0 ? $section.find('table tbody tr') : $('table tbody tr')

  $rows.each((_index, row) => {
    const $cells = $(row).find('td')
    if ($cells.length < 5) return

    const $countryCell = $cells.eq(1)
    const country = $countryCell.text().trim()
    const flagUrl = $countryCell.find('img').attr('src') ?? ''

    const gold = parseInt($cells.eq(2).text().trim(), 10) || 0
    const silver = parseInt($cells.eq(3).text().trim(), 10) || 0
    const bronze = parseInt($cells.eq(4).text().trim(), 10) || 0
    const total = bronze + silver + gold
    const calculatedTotal = mutiplyMedals({ gold, silver, bronze })

    medals.push({
      rank: 0,
      country,
      flagUrl,
      gold,
      silver,
      bronze,
      total,
      calculatedTotal,
      medalsBack: 0,
    })
  })

  medals.sort((a, b) => b.calculatedTotal - a.calculatedTotal)

  medals.forEach((entry, index) => {
    if (index === 0) {
      entry.rank = 1
    } else {
      const prev = medals[index - 1]
      const first = medals[0]
      entry.rank = entry.calculatedTotal === prev.calculatedTotal ? prev.rank : index + 1
      const medalsBack = first.calculatedTotal - entry.calculatedTotal
      entry.medalsBack = Math.ceil(medalsBack / 4)
    }
  })

  return {
    fetchedAt: new Date().toISOString(),
    medals,
  }
}
