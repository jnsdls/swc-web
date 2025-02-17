import { NextRequest, NextResponse } from 'next/server'

import {
  verifiedSWCPartnersUserActionOptIn,
  zodVerifiedSWCPartnersUserActionOptIn,
} from '@/data/verifiedSWCPartners/userActionOptIn'
import { authenticateAndGetVerifiedSWCPartnerFromHeader } from '@/utils/server/verifiedSWCPartner/getVerifiedSWCPartnerFromHeader'

export async function POST(request: NextRequest) {
  const partner = authenticateAndGetVerifiedSWCPartnerFromHeader()
  const validatedFields = zodVerifiedSWCPartnersUserActionOptIn.parse(await request.json())
  const result = await verifiedSWCPartnersUserActionOptIn({
    ...validatedFields,
    partner,
  })
  return NextResponse.json(result)
}
