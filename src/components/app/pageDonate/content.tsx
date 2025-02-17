import { CTAs } from './ctas'
import { FAQ } from './faq'
import { Heading } from './heading'
import { PageDonateProps } from './pageDonate.types'

export function PageDonate(props: PageDonateProps) {
  return (
    <div className="container space-y-24">
      <Heading {...props} />
      <FAQ />
      <CTAs />
    </div>
  )
}
