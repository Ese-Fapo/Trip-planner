import React, { useEffect, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { Input } from "@/components/ui/input";
import {
  AI_PROMPT,
  SelectBudgetOptions,
  SelectTravelList,
} from "../constants/options";
import { Button } from "@/components/ui/button";
import { toast, ToastContainer } from "react-toastify";
import { generateTripPlan } from "../service/AIModal";
import "react-toastify/dist/ReactToastify.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLocation } from "react-router-dom";

const GoogleSignInButton = ({ onClick, disabled, isSigningIn }) => {
  return (
    <Button
      variant="outline"
      className="group flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-6 text-sm font-semibold text-slate-700 shadow-sm hover:border-sky-300 hover:bg-sky-50 hover:text-slate-900"
      onClick={onClick}
      disabled={disabled}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path fill="#4285F4" d="M21.6 12.23c0-.68-.06-1.33-.17-1.95H12v3.69h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.97-4.34 2.97-7.26Z" />
          <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.24-2.5c-.9.6-2.05.96-3.37.96-2.59 0-4.78-1.75-5.56-4.1H3.1v2.58A10 10 0 0 0 12 22Z" />
          <path fill="#FBBC05" d="M6.44 13.92A6 6 0 0 1 6.13 12c0-.67.11-1.32.31-1.92V7.5H3.1A10 10 0 0 0 2 12c0 1.61.39 3.13 1.1 4.5l3.34-2.58Z" />
          <path fill="#EA4335" d="M12 5.98c1.47 0 2.79.5 3.83 1.48l2.87-2.87C16.95 2.96 14.7 2 12 2A10 10 0 0 0 3.1 7.5l3.34 2.58c.78-2.35 2.97-4.1 5.56-4.1Z" />
        </svg>
      </span>
      <span>{isSigningIn ? "Opening Google..." : "Sign in with Google"}</span>
    </Button>
  );
};

const getStoredUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return JSON.parse(localStorage.getItem("User") || "null");
  } catch {
    return null;
  }
};

const CreateTrip = () => {
  const location = useLocation();
  const [place, setPlace] = useState();
  const [formData, setFormData] = useState({});
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [selectedTravelers, setSelectedTravelers] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tripResult, setTripResult] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const placesApiKey = import.meta.env.VITE_GOOGLE_PLACE_API_KEY;
  const googleAuthClientId = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID;

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGoogleLoginError = (message) => {
    setIsSigningIn(false);
    toast.error(message || "Google sign-in failed. Please try again.", {
      position: "top-center",
      autoClose: 3000,
    });
  };

  const startGoogleLogin = useGoogleLogin({
    flow: "implicit",
    scope: "openid profile email",
    prompt: "select_account",
    onSuccess: async (tokenResponse) => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokenResponse.access_token}`,
        );

        if (!response.ok) {
          throw new Error("Unable to fetch Google profile.");
        }

        const userProfile = await response.json();
        setIsSigningIn(false);
        await handleGoogleAuthSuccess(userProfile);
      } catch (error) {
        handleGoogleLoginError(error?.message);
      }
    },
    onError: () => {
      handleGoogleLoginError();
    },
    onNonOAuthError: (nonOAuthError) => {
      const popupMessage =
        nonOAuthError?.type === "popup_failed_to_open"
          ? "Google sign-in popup was blocked. Please allow popups and try again."
          : nonOAuthError?.type === "popup_closed"
            ? "Google sign-in was cancelled before completion."
            : "Google sign-in failed. Please try again.";

      handleGoogleLoginError(popupMessage);
    },
  });

  const openSignInDialog = (startPopup = false) => {
    setOpenDialog(true);

    if (startPopup && googleAuthClientId) {
      setIsSigningIn(true);
      startGoogleLogin({ prompt: "select_account" });
    }
  };

  const handleManualGoogleSignIn = () => {
    if (!googleAuthClientId) {
      toast.error("Google sign-in is not configured yet.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    setIsSigningIn(true);
    startGoogleLogin({ prompt: "select_account" });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("signin") === "1") {
      setOpenDialog(true);
    }
  }, [location.search]);

  const handleGoogleAuthSuccess = async (userProfile) => {
    const normalizedUser = {
      name: userProfile?.name || "Google User",
      email: userProfile?.email || "",
      picture: userProfile?.picture || "",
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("User", JSON.stringify(normalizedUser));
    }

    setCurrentUser(normalizedUser);

    setOpenDialog(false);
    toast.success(`Welcome ${userProfile?.given_name || userProfile?.name || "traveler"}!`, {
      position: "top-center",
      autoClose: 2000,
    });

    await OnGenerateTrip(true);
  };

  const OnGenerateTrip = async (skipUserCheck = false) => {
    const user = typeof window !== "undefined" ? localStorage.getItem("User") : null;

    if (!skipUserCheck && !user) {
      if (!googleAuthClientId) {
        toast.error("Google sign-in is required before generating a trip.", {
          position: "top-center",
          autoClose: 3000,
        });
        return;
      }

      openSignInDialog(true);
      return;
    }

    if (!place) {
      toast.error("📍 Please select a destination!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    const noOfDays = Number.parseInt(formData?.noOfDays, 10);

    if (!noOfDays) {
      toast.error("🗓️ Please enter the duration of your stay!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    if (noOfDays < 2) {
      toast.warning("⏰ Please add more days for a great trip!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    if (noOfDays > 60) {
      toast.error(
        "💼 Reduce the trip days... everyday is not vacation! Go back to work!",
        {
          position: "top-center",
          autoClose: 3000,
        },
      );
      return;
    }

    if (!selectedBudget) {
      toast.error("💰 Please select your budget!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    if (!selectedTravelers) {
      toast.error("👥 Please select who you're traveling with!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    try {
      setIsGenerating(true);

      const prompt = AI_PROMPT.replace("{location}", place?.label || "")
        .replace("{days}", String(noOfDays))
        .replace("{travelers}", formData?.travelers || "")
        .replace("{budget}", formData?.budget || "");

      const result = await generateTripPlan(prompt);
      setTripResult(result);

      toast.success("🎉 Your trip is ready!", {
        position: "top-center",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error(
        `❌ ${error?.message || "Failed to generate trip. Please try again."}`,
        {
          position: "top-center",
          autoClose: 3500,
        },
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <main className="mx-auto mt-6 min-h-screen max-w-6xl px-4 pb-16 sm:mt-10 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-white/80 bg-linear-to-br from-sky-50 via-white to-violet-50 p-5 shadow-[0_25px_80px_-45px_rgba(37,99,235,0.45)] ring-1 ring-slate-100 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-blue-600 sm:text-4xl lg:text-5xl">
              Tell us your travel preference
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base lg:text-lg">
              Just provide a few details, and our AI trip planner will create a
              personalized itinerary tailored to your style, budget, and
              interests.
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <p className="text-base font-semibold text-slate-900 sm:text-lg">
                What is your destination of choice?
              </p>

              <div className="mt-3">
                {placesApiKey ? (
                  <GooglePlacesAutocomplete
                    apiKey={placesApiKey}
                    selectProps={{
                      value: place,
                      placeholder: "Search for a city or country",
                      onChange: (v) => {
                        setPlace(v);
                        handleInputChange("location", v?.label || "");
                      },
                    }}
                  />
                ) : (
                  <div className="space-y-2">
                    <Input
                      className="h-11 text-base"
                      placeholder="Enter a city or country manually"
                      type="text"
                      value={place?.label || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setPlace({ label: value, value });
                        handleInputChange("location", value);
                      }}
                    />
                    <p className="text-xs text-amber-600 sm:text-sm">
                      Google Places API is not configured yet, so manual destination entry is enabled.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <p className="text-base font-semibold text-slate-900 sm:text-lg">
                What is the duration of your stay?
              </p>

              <Input
                className="mt-3 h-11 text-base"
                placeholder={"Ex. 3"}
                type="number"
                onChange={(e) => handleInputChange("noOfDays", e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <h3 className="text-2xl font-semibold text-blue-600 text-center sm:text-3xl">
            What is your budget?
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-gray-600 sm:text-base lg:text-lg">
            Your budget helps us suggest activities, dining, and stays that fit
            your comfort level.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {SelectBudgetOptions.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedBudget(item.id);
                  handleInputChange("budget", item.title);
                }}
                className={`rounded-2xl p-5 transition-all cursor-pointer ${
                  selectedBudget === item.id
                    ? "border-2 border-blue-500 bg-blue-50 shadow-md"
                    : "border border-gray-200 hover:border-blue-300 hover:shadow-md"
                }`}
              >
                <h3 className="text-3xl">{item.icon}</h3>
                <h4 className="mt-2 text-lg font-semibold">{item.title}</h4>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <h3 className="text-2xl font-semibold tracking-wide text-blue-600 text-center sm:text-3xl">
            Who do you plan to travel with?
          </h3>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {SelectTravelList.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedTravelers(item.id);
                  handleInputChange("travelers", item.people);
                }}
                className={`rounded-2xl p-5 transition-all duration-300 cursor-pointer ${
                  selectedTravelers === item.id
                    ? "bg-blue-50 border-2 border-blue-500 shadow-lg -translate-y-1"
                    : "bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-4xl leading-none">{item.icon}</h3>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 sm:text-sm">
                    {item.people}
                  </span>
                </div>

                <h4 className="mt-4 text-lg font-semibold text-gray-900">
                  {item.title}
                </h4>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-sky-100 bg-white/90 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                {currentUser?.email
                  ? `Signed in as ${currentUser.name}`
                  : "Authentication is required before generating a trip"}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {currentUser?.email
                  ? currentUser.email
                  : "Click Generate Trip and you'll be asked to sign in with Google first."}
              </p>
            </div>

            <Button
              variant="outline"
              className="border-slate-300"
              onClick={() => openSignInDialog(false)}
            >
              {currentUser?.email ? "Switch account" : "Sign in with Google"}
            </Button>
          </div>
        </section>

        <div className="mt-8 flex justify-center sm:justify-end">
          <Button
            className="w-full bg-blue-600 px-6 py-6 text-base text-amber-50 hover:bg-blue-500 sm:w-auto sm:text-lg"
            onClick={OnGenerateTrip}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Trip"}
          </Button>
        </div>

        {tripResult && (
          <section className="mt-8 rounded-3xl border border-blue-100 bg-blue-50/40 p-4 sm:p-6">
            <h3 className="mb-3 text-lg font-semibold text-blue-700 sm:text-xl">
             Trip Generated 
            </h3>
            <div className="overflow-x-auto rounded-xl bg-white/80 p-3 sm:p-4">
              <pre className="whitespace-pre-wrap wrap-break-word text-xs text-gray-800 sm:text-sm">
                {JSON.stringify(tripResult, null, 2)}
              </pre>
            </div>
          </section>
        )}

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="overflow-hidden border border-slate-200 bg-white p-0 shadow-[0_25px_80px_-40px_rgba(15,23,42,0.35)] sm:max-w-md">
            <DialogHeader className="items-center text-center bg-linear-to-br from-sky-50 via-white to-violet-50 px-6 pt-6">
              <DialogTitle className="flex flex-col items-center gap-3 text-center">
                <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
                  <img src="/logo.svg" alt="AI Trip logo" className="h-12 w-auto" />
                </div>
                <span className="text-xl font-bold text-slate-900">
                  Sign in with Google
                </span>
              </DialogTitle>

              <DialogDescription asChild>
                <div className="space-y-4 px-1 pb-2 pt-2">
                  <p className="text-sm leading-6 text-slate-600">
                    Please sign in with Google before we generate your personalized
                    trip itinerary.
                  </p>

                  {googleAuthClientId ? (
                    <GoogleSignInButton
                      onClick={handleManualGoogleSignIn}
                      disabled={isGenerating || isSigningIn}
                      isSigningIn={isSigningIn}
                    />
                  ) : (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                      Google sign-in is not configured yet, so trip generation is
                      currently unavailable.
                    </div>
                  )}
                </div>
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="border-t border-slate-100 bg-slate-50/80 px-6 py-4">
              <Button
                variant="outline"
                className="rounded-xl border-slate-200 bg-white px-5 text-slate-700 hover:bg-slate-100"
                onClick={() => setOpenDialog(false)}
              >
                Not now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
};

export default CreateTrip;
