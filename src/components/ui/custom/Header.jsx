import React, { useEffect, useState } from 'react'
import { Button } from '../button'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getStoredUser } from '@/components/login/login'
import LogoutButton from '@/components/login/logout'

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(getStoredUser)

  const handleSignInClick = () => {
    if (location.pathname === '/create-trip') {
      window.dispatchEvent(new Event('open-signin-dialog'))
      return
    }

    navigate('/create-trip?signin=1')
  }

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser())

    window.addEventListener('storage', syncUser)
    window.addEventListener('focus', syncUser)
    syncUser()

    return () => {
      window.removeEventListener('storage', syncUser)
      window.removeEventListener('focus', syncUser)
    }
  }, [])

  return (
    <header className='sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur'>
      <div className='mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8'>
        <Link to='/' className='relative flex items-center'>
          <div className='absolute inset-0 -z-10 rounded-full bg-linear-to-r from-cyan-400 via-sky-500 to-violet-500 opacity-60 blur-xl' />
          <img
            src='/logo.svg'
            className='h-9 w-auto drop-shadow-[0_0_18px_rgba(59,130,246,0.55)] sm:h-10'
            alt='Logo'
          />
        </Link>

        {user?.email ? (
          <div className='flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto'>
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name || 'User avatar'}
                className='h-10 w-10 rounded-full border border-slate-200 object-cover'
                referrerPolicy='no-referrer'
              />
            ) : (
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-700'>
                {(user.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}

            <div className='min-w-0 text-right'>
              <p className='truncate text-sm font-semibold text-slate-900'>
                {user.name}
              </p>
              <p className='truncate text-xs text-slate-500'>{user.email}</p>
            </div>

            <LogoutButton
              className='border-slate-300 text-slate-700 hover:bg-slate-100'
              onLogout={() => setUser(null)}
            />
          </div>
        ) : (
          <Button
            className='w-full bg-black px-4 py-2 text-sm text-white hover:bg-neutral-800 sm:w-auto sm:px-5'
            size='lg'
            onClick={handleSignInClick}
          >
            Sign In
          </Button>
        )}
      </div>
    </header>
  )
}

export default Header
