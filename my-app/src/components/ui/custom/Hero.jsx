import React from 'react'
import { Button } from '../button'
import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <div> 
    <div className='flex flex-col items-center mx-56 gap-9'>
            <h1 className='font-extrabold text-[60px] text-center'>
              <span className='text-shadow-cyan-700'>Travel made easy—let </span>
               <br /> <span className='bg-linear-to-r from-cyan-400 via-sky-500 to-violet-500 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(59,130,246,0.45)] [text-shadow:0_0_30px_rgba(56,189,248,0.35)]'>AI:</span> 
                plan your perfect, personalized trip.

                </h1>
            <p className='text-xl text-gray-500 text-center'>Sit back and relax while we handle everything, from destinations to itineraries, tailored to your preferences for a seamless and unforgettable experience.
             </p>
             <Link to={'/create-trip'}>
             <Button className='py-6 px-3 text-white bg-gray-950 hover:bg-gray-800'>Get Started, it's free</Button>
             </Link>
    </div>
    </div>
  )
}

export default Hero
