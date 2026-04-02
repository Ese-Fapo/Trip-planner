import React, { useEffect, useState } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { Input } from "@/components/ui/input";
import { AI_PROMPT, SelectBudgetOptions, SelectTravelList } from "../constants/options";
import { Button } from "@/components/ui/button";
import { toast, ToastContainer } from "react-toastify";
import { generateTripPlan } from "../service/AIModal";
import "react-toastify/dist/ReactToastify.css";

const CreateTrip = () => {
  const [place, setPlace] = useState();
  const [formData, setformData] = useState({});
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [selectedTravelers, setSelectedTravelers] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tripResult, setTripResult] = useState(null);

  const handleInputChange = (name, value) => {
    setformData({
      ...formData,
      [name]: value,
    });
  };

  useEffect(() => {
    console.log("Form Data Updated:", formData);
  }, [formData])

  const OnGenerateTrip = async () => {
    // Check if location is selected
    if (!place) {
      toast.error("📍 Please select a destination!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    const noOfDays = parseInt(formData?.noOfDays);
    
    // Check if days are entered
    if (!noOfDays) {
      toast.error("🗓️ Please enter the duration of your stay!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    // Check if days are within valid range
    if (noOfDays < 2) {
      toast.warning("⏰ Please add more days for a great trip!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    
    if (noOfDays > 60) {
      toast.error("💼 Reduce the trip days... everyday is not vacation! Go back to work!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    // Check if budget is selected
    if (!selectedBudget) {
      toast.error("💰 Please select your budget!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    // Check if travelers count is selected
    if (!selectedTravelers) {
      toast.error("👥 Please select who you're traveling with!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    
    // All validations passed - Proceed with trip generation
    try {
      setIsGenerating(true);

      const prompt = AI_PROMPT.replace("{location}", place?.label || "")
        .replace("{days}", String(noOfDays))
        .replace("{travelers}", formData?.travelers || "")
        .replace("{budget}", formData?.budget || "");

      const result = await generateTripPlan(prompt);
      setTripResult(result);

      toast.success("🎉 Your AI trip is ready!", {
        position: "top-center",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error(`❌ ${error?.message || "Failed to generate trip. Please try again."}`, {
        position: "top-center",
        autoClose: 3500,
      });
    } finally {
      setIsGenerating(false);
    }
  }
  return (
    <>
      <ToastContainer />
      <div className="sm:px-10 md:px-32 lg:px-56 xl:px-10 px-5 mt-10">
      <h2 className="text-4xl text-blue-500 text-center">
        TELL US YOUR TRAVEL PREFERENCE
      </h2>

      <p className="mt-3 text-gray-600 text-xl text-center">
        Just provide a few details, and our AI trip planner will create a
        personalized itinerary tailored to your style, budget, and interests.
      </p>

      <div className="mt-10 flex flex-col gap-9">
        <p className="text-xl my-3 font-medium">
          What is destination of choice?
        </p>
        <div>
          <GooglePlacesAutocomplete
            apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
            selectProps={{
              place,
              onChange: (v) => {
                setPlace(v); 
                handleInputChange('location',v)
              },
            }}
          />
        </div>
        <div>
          <div>
            <p className="text-xl my-3 font-medium">
              What is the duration of your stay{" "}
            </p>

          </div>
           <Input placeholder={"Ex.3"} type="number" 
           onChange={(e)=>handleInputChange('noOfDays',e.target.value)}
           />
          
        </div>
      </div>
      <div className="mt-10">
              {/**budget section */}
        <h3 className="text-2xl text-blue-500 text-center">
          WHAT IS YOUR BUDGET?
        </h3>
        <p className="mt-3 text-gray-600 text-xl text-center">
          The budget is exclusivelly allocated for activites and dinnig purposes
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
          {SelectBudgetOptions.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setSelectedBudget(item.id);
                handleInputChange('budget', item.title);
              }}
              className={`rounded-xl p-5 transition-all cursor-pointer ${
                selectedBudget === item.id
                  ? 'border-2 border-blue-500 bg-blue-50 shadow-md'
                  : 'border border-gray-200 hover:shadow-md hover:border-blue-300'
              }`}
            >
              <h3 className="text-3xl">{item.icon}</h3>
              <h4 className="font-semibold text-lg mt-2">{item.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      {/**Travel section */}
      <div className="mt-12">
        <h3 className="text-2xl md:text-3xl text-blue-500 text-center font-semibold tracking-wide">
           Who do you plan to travel with?
        </h3>
        <p className="mt-3 text-gray-600 text-base md:text-lg text-center max-w-3xl mx-auto">
        
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          {SelectTravelList.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setSelectedTravelers(item.id);
                handleInputChange('travelers', item.people);
              }}
              className={`rounded-2xl p-5 transition-all duration-300 cursor-pointer ${
                selectedTravelers === item.id
                  ? 'bg-blue-50 border-2 border-blue-500 shadow-lg -translate-y-1'
                  : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-4xl leading-none">{item.icon}</h3>
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {item.people}
                </span>
              </div>

              <h4 className="font-semibold text-lg mt-4 text-gray-900">{item.title}</h4>
              <p className="text-sm text-gray-600 mt-2 leading-6">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
              <div >
                <Button
                  className="text-2xl bg-blue-600 my-4 px-4 py-8 text-amber-100 text-center cursor-pointer hover:bg-blue-400"
                  onClick={OnGenerateTrip}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate Trip"}
                </Button>
              </div>

              {tripResult && (
                <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50/30 p-5">
                  <h3 className="text-xl font-semibold text-blue-700 mb-3">Generated AI Trip</h3>
                  <pre className="whitespace-pre-wrap wrap-break-word text-sm text-gray-800">
                    {JSON.stringify(tripResult, null, 2)}
                  </pre>
                </div>
              )}
              
    </div>
    </>
  );
};

export default CreateTrip;
