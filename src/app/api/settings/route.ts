import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/client'
import { getOwnerSession } from '@/lib/session'
import { getStoreSettings } from '@/lib/settings'

const SETTINGS_ID = 'storeSettings_singleton'

export async function GET() {
  try {
    const settings = await getStoreSettings()
    return NextResponse.json({ success: true, settings })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getOwnerSession()
    
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      shippingAdoEkiti, 
      shippingEkitiState, 
      shippingOutsideEkiti,
      bankName,
      accountName,
      accountNumber
    } = await request.json()

    // Validate inputs
    if (typeof shippingAdoEkiti !== 'number' || typeof shippingEkitiState !== 'number' || typeof shippingOutsideEkiti !== 'number') {
      return NextResponse.json({ success: false, error: 'Invalid payload, expected numbers for shipping' }, { status: 400 })
    }

    // Use createOrReplace to ensure we always write to the exact same singleton document
    const result = await writeClient.createOrReplace({
      _id: SETTINGS_ID,
      _type: 'storeSettings',
      shippingAdoEkiti,
      shippingEkitiState,
      shippingOutsideEkiti,
      bankName: bankName || '',
      accountName: accountName || '',
      accountNumber: accountNumber || '',
    })

    return NextResponse.json({ success: true, settings: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
