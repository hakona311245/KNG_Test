import { Outlet } from 'react-router-dom'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'

export function AppShell() {
  return (
    <div className="min-h-screen bg-[#f4f4f1] bg-[url('/noisy_background.png')] bg-cover bg-fixed text-[#111111]">
      <SiteHeader />

      <main>
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  )
}
