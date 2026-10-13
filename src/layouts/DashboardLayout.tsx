import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { api, clearToken } from '../lib/api'
import type { LegalPage } from '../lib/types'

const adminLinks = [
  { to: '/', label: 'Overview', end: true },
  { to: '/categories', label: 'Categories' },
  { to: '/products', label: 'Products' },
  { to: '/deals', label: 'Deals' },
  { to: '/orders', label: 'Orders' },
  { to: '/drivers', label: 'Drivers' },
  { to: '/whats-new', label: "What's New" },
  { to: '/settings', label: 'Settings' },
  { to: '/users', label: 'Customers' },
]

const driverLinks = [{ to: '/', label: 'My deliveries', end: true }]

const navItem = (isActive: boolean) =>
  [
    'rounded-[10px] px-[0.85rem] py-[0.7rem] no-underline',
    isActive
      ? 'bg-white font-bold text-blue-dark'
      : 'text-white/80 hover:bg-white/10 hover:text-white',
  ].join(' ')

function pageTitle(pathname: string) {
  if (pathname.startsWith('/categories/new')) return 'Create category'
  if (pathname.match(/^\/categories\/\d+\/edit/)) return 'Edit category'
  if (pathname.startsWith('/products/new')) return 'Create product'
  if (pathname.match(/^\/products\/\d+\/edit/)) return 'Edit product'
  if (pathname.startsWith('/deals/new')) return 'Create deal'
  if (pathname.match(/^\/deals\/\d+\/edit/)) return 'Edit deal'
  if (pathname.startsWith('/legal-pages/new')) return 'Create legal page'
  if (pathname.match(/^\/orders\/\d+$/)) return 'Order details'
  if (pathname.match(/^\/legal-pages\/\d+\/edit/)) return 'Edit legal page'
  if (pathname.startsWith('/management/new')) return 'Create legal page'
  if (pathname.match(/^\/management\/.+\/edit/)) return 'Edit legal page'

  const map: Record<string, string> = {
    '/': 'Overview',
    '/categories': 'Categories',
    '/products': 'Products',
    '/deals': 'Deals',
    '/orders': 'Orders',
    '/drivers': 'Drivers',
    '/whats-new': "What's New",
    '/whats-new/banner': "What's New banner",
    '/settings': 'Store Settings',
    '/users': 'Customers',
    '/legal-pages': 'Legal Pages',
    '/management': 'Legal Pages',
  }
  return map[pathname] ?? 'Dashboard'
}

// Collapsible group listing the live legal pages, so the admin can jump straight
// into editing one instead of going through the list page first.
function LegalPagesNav() {
  const { pathname } = useLocation()
  const inSection = pathname.startsWith('/legal-pages')
  const [open, setOpen] = useState(inSection)
  const [pages, setPages] = useState<LegalPage[]>([])

  useEffect(() => {
    if (inSection) setOpen(true)
  }, [inSection])

  useEffect(() => {
    if (!open || pages.length > 0) return
    api<LegalPage[]>('/legal-pages?all=true')
      .then(setPages)
      .catch(() => setPages([]))
  }, [open, pages.length])

  return (
    <div className="flex flex-col">
      <button
        aria-expanded={open}
        className={`${navItem(inSection)} flex cursor-pointer items-center justify-between gap-2 border-none bg-transparent text-left ${
          inSection ? 'bg-white font-bold text-blue-dark' : ''
        }`}
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        Legal Pages
        <span aria-hidden className={`text-[0.7rem] ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {open ? (
        <div className="mt-1 flex flex-col gap-1 lg:ml-[0.6rem] lg:border-l lg:border-white/20 lg:pl-[0.5rem]">
          <NavLink
            className={({ isActive }) =>
              `${navItem(isActive)} text-[0.85rem]`
            }
            end
            to="/legal-pages"
          >
            All pages
          </NavLink>
          {pages.map((page) => (
            <NavLink
              className={({ isActive }) =>
                `${navItem(isActive)} text-[0.85rem]`
              }
              key={page.id}
              to={`/legal-pages/${page.id}/edit`}
            >
              {page.title}
            </NavLink>
          ))}
        </div>
      ) : null}
    </div>
  )
}

type Props = {
  onLogout: () => void
  role: 'admin' | 'driver'
}

export function DashboardLayout({ onLogout, role }: Props) {
  const { pathname } = useLocation()
  const title =
    role === 'driver' && pathname === '/'
      ? 'My deliveries'
      : pageTitle(pathname)
  const navLinks = role === 'driver' ? driverLinks : adminLinks

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[250px_1fr]">
      {/* On wide screens the sidebar stays put and only its link list scrolls,
          so Log out never drifts below a long page. */}
      <aside className="flex flex-col gap-6 bg-blue px-[0.85rem] py-[1.25rem] text-white lg:sticky lg:top-0 lg:h-screen">
        {/* Same rule weight as the content header's bottom border. */}
        <Link
          to="/"
          className="-mx-[0.85rem] flex items-center gap-[0.65rem] border-b border-white/20 px-[1.1rem] pb-[1.1rem] text-inherit no-underline"
        >
          <img
            alt="Crumblez"
            className="size-11 shrink-0 rounded-[10px] object-cover ring-1 ring-white/25"
            src="/brand-logo.png"
          />
          <div className="flex flex-col leading-tight">
            <strong>Crumblez</strong>
            <span className="text-[0.72rem] italic opacity-90">
              {role === 'driver' ? 'Driver' : 'Crave Different'}
            </span>
          </div>
        </Link>

        <nav className="flex flex-1 flex-row flex-wrap gap-1 lg:min-h-0 lg:flex-col lg:flex-nowrap lg:overflow-y-auto [scrollbar-color:rgba(255,255,255,0.35)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/35 [&::-webkit-scrollbar-track]:bg-transparent">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => navItem(isActive)}
            >
              {link.label}
            </NavLink>
          ))}
          {role === 'admin' ? <LegalPagesNav /> : null}
        </nav>

        <button
          className="shrink-0 cursor-pointer rounded-full border-none bg-red px-[1.15rem] py-[0.7rem] font-bold text-white hover:bg-red-hover"
          type="button"
          onClick={() => {
            clearToken()
            onLogout()
          }}
        >
          Log out
        </button>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-10 flex h-[68px] items-center justify-between border-b border-border-soft bg-white/90 px-6 backdrop-blur-[8px]">
          <h1 className="m-0 text-[1.1rem] text-blue-dark">{title}</h1>
          <span className="text-[0.85rem] text-muted">
            {role === 'driver' ? 'Driver workspace' : 'Same brand as storefront'}
          </span>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
