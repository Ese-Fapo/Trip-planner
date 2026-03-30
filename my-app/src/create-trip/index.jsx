import React from 'react'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';

const CreateTrip = () => {
    return (
        <div className='sm:px-10 md:px-32 lg:px-56 xl:px-10 px-5 mt-10'>
            <h2 className='text-4xl text-blue-500 text-center'>TELL US YOUR TRAVEL PREFERENCE</h2>
            <p className='mt-3 text-gray-600 text-xl text-center'>Just provide a few details, and our AI trip planner will create a personalized itinerary tailored to your style, budget, and interests. </p>

            <div className='mt-10 '>
                <p className='text-xl my-3 font-medium'>What is destination of choice?</p>
                <div>
                    <GooglePlacesAutocomplete
                        apiKey=""
                    />
                </div>
            </div>
        </div>
    )
}

export default CreateTrip
