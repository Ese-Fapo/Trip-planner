import React from 'react'
import { Button } from '../button'
import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <section className='py-6 sm:py-10 lg:py-14'>
      <div className='mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center'>
        <div className='rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-[0_25px_80px_-40px_rgba(37,99,235,0.45)] backdrop-blur sm:p-8 lg:p-10'>
          <span className='inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-sky-700 uppercase sm:text-sm'>
            AI travel planner
          </span>

          <h1 className='mt-4 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl'>
            Travel made easy—let{' '}
            <span className='bg-linear-to-r from-cyan-400 via-sky-500 to-violet-500 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(59,130,246,0.45)]'>
              AI
            </span>{' '}
            plan your perfect, personalized trip.
          </h1>

          <p className='mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg'>
            Sit back and relax while we handle everything, from destinations to itineraries, tailored to your preferences for a seamless and unforgettable experience.
          </p>

          <div className='mt-5 flex flex-wrap gap-2'>
            {['Smart itineraries', 'Budget-friendly ideas', 'Instant planning'].map((item) => (
              <span
                key={item}
                className='rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 sm:text-sm'
              >
                {item}
              </span>
            ))}
          </div>

          <div className='mt-7 flex flex-col gap-3 sm:flex-row sm:items-center'>
            <Link to='/create-trip' className='w-full sm:w-auto'>
              <Button className='w-full bg-slate-950 px-5 py-6 text-sm text-white hover:bg-slate-800 sm:text-base'>
                Get Started, it&apos;s free
              </Button>
            </Link>
            <p className='text-sm text-slate-500'>No setup headaches — just choose a destination and go.</p>
          </div>
        </div>

        <div className='rounded-[28px] border border-slate-800/10 bg-slate-950 p-5 text-white shadow-[0_25px_70px_-35px_rgba(15,23,42,0.6)] sm:p-6'>
          <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
            <p className='text-sm font-medium text-sky-200'>Weekend escape preview</p>
            <h2 className='mt-2 text-2xl font-semibold'>3 days in Bali</h2>
            <p className='mt-2 text-sm leading-6 text-slate-300'>Flights, stays, food spots, and scenic plans arranged in seconds.</p>
          </div>

          <div className='mt-4 space-y-3'>
            {[
              'Day 1 · Beach clubs and sunset dinner',
              'Day 2 · Waterfall tour and local cafés',
              'Day 3 · Temple visit and shopping walk',
            ].map((plan) => (
              <div key={plan} className='rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200'>
                {plan}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
