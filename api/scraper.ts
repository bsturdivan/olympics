const API_BASE = 'https://olympic-sports-api.p.rapidapi.com'
const MEDALS_ENDPOINT = '/medals/countries'
const OLYMPIC_YEAR = '2024'

export interface MedalEntry {
  rank: number
  country: string
  flagUrl: string
  gold: number
  silver: number
  bronze: number
  total: number
  calculatedTotal: number
}

export interface MedalData {
  fetchedAt: string
  medals: MedalEntry[]
}

/**
 * Fallback data used when the API is unreachable or returns an error.
 * This ensures the build always succeeds; live data replaces it on revalidation.
 */
const FALLBACK_DATA: MedalData = {
  fetchedAt: 'fallback',
  medals: [
    {
      rank: 1,
      country: 'No data available',
      flagUrl: '',
      gold: 0,
      silver: 0,
      bronze: 0,
      total: 0,
      calculatedTotal: 0,
    },
  ],
}

function multiplyMedals({
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

interface ApiCountryMedal {
  country_name?: string
  country?: string
  name?: string
  flag_url?: string
  flag?: string
  gold?: number
  gold_medals?: number
  silver?: number
  silver_medals?: number
  bronze?: number
  bronze_medals?: number
  total?: number
  total_medals?: number
  [key: string]: unknown
}

export async function scrapeMedals(): Promise<MedalData> {
  const apiKey = process.env.RAPIDAPI_KEY

  if (!apiKey) {
    console.error('RAPIDAPI_KEY environment variable is not set')
    return FALLBACK_DATA
  }

  try {
    const url = `${API_BASE}${MEDALS_ENDPOINT}?year=${OLYMPIC_YEAR}`

    const response = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'olympic-sports-api.p.rapidapi.com',
      },
    })

    if (!response.ok) {
      const body = await response.text()
      console.error(`Failed to fetch medals from API: ${response.status} ${response.statusText}`)
      console.error('Response body:', body)
      return FALLBACK_DATA
    }

    const data = await response.json()
    console.log('API response:', JSON.stringify(data).slice(0, 500))

    // The API may return the array directly or nested under a key
    const entries: ApiCountryMedal[] = Array.isArray(data)
      ? data
      : (data.results ?? data.medals ?? data.data ?? data.countries ?? [])

    if (!Array.isArray(entries) || entries.length === 0) {
      console.error('API returned no medal entries — response shape may have changed')
      return FALLBACK_DATA
    }

    const medals: MedalEntry[] = entries.map((entry) => {
      const country = entry.country_name ?? entry.country ?? entry.name ?? 'Unknown'
      const flagUrl = entry.flag_url ?? entry.flag ?? ''
      const gold = entry.gold ?? entry.gold_medals ?? 0
      const silver = entry.silver ?? entry.silver_medals ?? 0
      const bronze = entry.bronze ?? entry.bronze_medals ?? 0
      const total = entry.total ?? entry.total_medals ?? gold + silver + bronze
      const calculatedTotal = multiplyMedals({ gold, silver, bronze })

      return { rank: 0, country, flagUrl, gold, silver, bronze, total, calculatedTotal }
    })

    medals.sort((a, b) => b.calculatedTotal - a.calculatedTotal)

    // Assign ranks, giving tied calculatedTotal values the same rank
    medals.forEach((entry, index) => {
      if (index === 0) {
        entry.rank = 1
      } else {
        const prev = medals[index - 1]
        entry.rank = entry.calculatedTotal === prev.calculatedTotal ? prev.rank : index + 1
      }
    })

    return {
      fetchedAt: new Date().toISOString(),
      medals,
    }
  } catch (error) {
    console.error('Failed to fetch medals from API:', error)
    return FALLBACK_DATA
  }
}
