import { PrimaryLink } from '../components/links'
import { PageFrame } from './ProductsPage'

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
