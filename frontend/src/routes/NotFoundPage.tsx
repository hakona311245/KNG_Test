import { PrimaryLink } from '../components/links'
import { PageFrame } from '../components/PageFrame'

export function NotFoundPage() {
  return (
    <PageFrame
      title="Page not found"
      description="The requested frontend route does not exist."
    >
      <PrimaryLink to="/">Go home</PrimaryLink>
    </PageFrame>
  )
}
