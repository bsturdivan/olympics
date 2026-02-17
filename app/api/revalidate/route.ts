import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(_: NextRequest) {
  try {
    // Revalidate both the page and the OG image
    revalidatePath('/')
    revalidatePath('/opengraph-image')

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
    })
  } catch (err) {
    return NextResponse.json(
      {
        revalidated: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
