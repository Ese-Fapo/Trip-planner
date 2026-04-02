import React from 'react'
import { Button } from '../button'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    
    <div className='flex items-center justify-between p-3 shadow-sm'>
      <Link to='/' className='relative'>
        <div className='absolute inset-0 -z-10 rounded-full bg-linear-to-r from-cyan-400 via-sky-500 to-violet-500 opacity-60 blur-xl' />
        <img
          src='/logo.svg'
          className='h-10 w-auto drop-shadow-[0_0_18px_rgba(59,130,246,0.55)]'
          alt='Logo'
        />
      </Link>
       
      <div>
        <Button
          className='bg-black px-5 py-2 text-white hover:bg-neutral-800'
          size='lg'
        >
          Sign In
        </Button>
      </div>
    </div>
  )
}

export default Header
