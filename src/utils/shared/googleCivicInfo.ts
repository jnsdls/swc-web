import { fetchReq } from '@/utils/shared/fetchReq'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import * as Sentry from '@sentry/nextjs'

/*
Sample response
{
  "normalizedInput": {
    "line1": "2031 North 25th Street",
    "city": "Philadelphia",
    "state": "PA",
    "zip": "19121"
  },
  "kind": "civicinfo#representativeInfoResponse",
  "divisions": {
    "ocd-division/country:us/state:pa": {
      "name": "Pennsylvania",
      "officeIndices": [
        2
      ]
    },
    "ocd-division/country:us": {
      "name": "United States",
      "officeIndices": [
        0,
        1
      ]
    },
    "ocd-division/country:us/state:pa/cd:3": {
      "name": "Pennsylvania's 3rd congressional district",
      "officeIndices": [
        3
      ]
    }
  },
  "offices": [
    {
      "name": "President of the United States",
      "divisionId": "ocd-division/country:us",
      "levels": [
        "country"
      ],
      "roles": [
        "headOfGovernment",
        "headOfState"
      ],
      "officialIndices": [
        0
      ]
    },
  ],
  "officials": [
    {
      "name": "Joseph R. Biden",
      "address": [
        {
          "line1": "1600 Pennsylvania Avenue Northwest",
          "city": "Washington",
          "state": "DC",
          "zip": "20500"
        }
      ],
      "party": "Democratic Party",
      "phones": [
        "(202) 456-1111"
      ],
      "urls": [
        "https://www.whitehouse.gov/",
        "https://en.wikipedia.org/wiki/Joe_Biden"
      ],
      "channels": [
        {
          "type": "Twitter",
          "id": "potus"
        }
      ]
    }
  ]
}
*/
interface GoogleCivicInfoAddress {
  line1: string
  city: string
  state: string
  zip: string
}

export interface GoogleCivicInfoOfficial {
  name: string
  address: GoogleCivicInfoAddress[]
  party: string
  phones: string[]
  urls: string[]
  photoUrl: string
  channels: {
    type: string
    id: string
  }[]
}

export interface GoogleCivicInfoResponse {
  normalizedInput: GoogleCivicInfoAddress
  kind: 'civicinfo#representativeInfoResponse'
  divisions: Record<string, { name: string }>
  officials: GoogleCivicInfoOfficial[]
}

const civicDataByAddressCache = new Map<string, GoogleCivicInfoResponse>()

const NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY = requiredEnv(
  process.env.NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY,
  'NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY',
)
const CIVIC_BY_ADDRESS_ENDPOINT = 'https://www.googleapis.com/civicinfo/v2/representatives'
export function getGoogleCivicDataFromAddress(address: string) {
  const apiUrl = new URL(CIVIC_BY_ADDRESS_ENDPOINT)
  apiUrl.searchParams.set('key', NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY)
  apiUrl.searchParams.set('address', address.trim())
  apiUrl.searchParams.set('levels', 'country')
  apiUrl.searchParams.set('includeOffices', 'true')

  const cached = civicDataByAddressCache.get(apiUrl.toString())
  if (cached) {
    return Promise.resolve(cached)
  }

  return fetchReq(apiUrl.toString())
    .then(res => res.json())
    .then(res => {
      civicDataByAddressCache.set(apiUrl.toString(), res as GoogleCivicInfoResponse)
      return res as GoogleCivicInfoResponse
    })
}

export function getGoogleCivicOfficialByDTSIName(
  dtsiPersonName: { firstName: string; lastName: string },
  googleCivicInfoResponse: GoogleCivicInfoResponse,
) {
  const normalizeName = (name: string) => name.toLowerCase().trim()
  const normalizedDTSIFirstName = normalizeName(dtsiPersonName.firstName)
  const normalizedDTSILastName = normalizeName(dtsiPersonName.lastName)

  // This is necessary since the Google Civic API return the middle initial (e.g. "John F. Kennedy")
  // While the DTSI data does not (e.g. "John Kennedy")
  const matchOfficial = googleCivicInfoResponse.officials.find(official => {
    const normalizedOfficialName = normalizeName(official.name)
    return (
      normalizedOfficialName.startsWith(normalizedDTSIFirstName) &&
      normalizedOfficialName.includes(normalizedDTSILastName)
    )
  })

  if (!matchOfficial) {
    Sentry.captureMessage('getGoogleCivicOfficialByDTSIName - Official not found', {
      extra: {
        dtsiPersonName,
        googleCivicInfoOfficials: googleCivicInfoResponse.officials,
      },
    })
    return null
  }

  return matchOfficial
}
