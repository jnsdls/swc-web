import { PageUserProfile } from '@/components/app/pageUserProfile'
import { getAuthenticatedData } from '@/components/app/pageUserProfile/getAuthenticatedData'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

type Props = PageProps

const title = 'Your Stand With Crypto profile'
const description = `See what actions you can take to help promote innovation.`
export async function generateMetadata(_props: Props): Promise<Metadata> {
  return generateMetadataDetails({
    title,
    description,
  })
}

export default async function Profile({ params }: Props) {
  const user = await getAuthenticatedData()
  return <PageUserProfile user={user} params={params} />
}
