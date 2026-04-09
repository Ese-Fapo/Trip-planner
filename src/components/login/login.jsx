/* eslint-disable react-refresh/only-export-components */
import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";

export const getStoredUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return JSON.parse(localStorage.getItem("User") || "null");
  } catch {
    return null;
  }
};

export const saveStoredUser = (user) => {
  if (typeof window === "undefined") {
    return user;
  }

  localStorage.setItem("User", JSON.stringify(user));
  window.dispatchEvent(new Event("storage"));
  return user;
};

export const clearStoredUser = () => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("User");
  window.dispatchEvent(new Event("storage"));
};

const fetchGoogleUserProfile = async (accessToken) => {
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`,
  );

  if (!response.ok) {
    throw new Error("Unable to fetch Google profile.");
  }

  const userProfile = await response.json();

  return {
    name: userProfile?.name || "Google User",
    email: userProfile?.email || "",
    picture: userProfile?.picture || "",
  };
};

export const useAppGoogleLogin = ({ onSuccess, onError, setIsSigningIn } = {}) =>
  useGoogleLogin({
    flow: "implicit",
    scope: "openid profile email",
    prompt: "select_account",
    onSuccess: async (tokenResponse) => {
      try {
        const normalizedUser = await fetchGoogleUserProfile(
          tokenResponse.access_token,
        );
        setIsSigningIn?.(false);
        await onSuccess?.(normalizedUser);
      } catch (error) {
        setIsSigningIn?.(false);
        onError?.(error?.message || "Google sign-in failed. Please try again.");
      }
    },
    onError: () => {
      setIsSigningIn?.(false);
      onError?.("Google sign-in failed. Please try again.");
    },
    onNonOAuthError: (nonOAuthError) => {
      const popupMessage =
        nonOAuthError?.type === "popup_failed_to_open"
          ? "Google sign-in popup was blocked. Please allow popups and try again."
          : nonOAuthError?.type === "popup_closed"
            ? "Google sign-in was cancelled before completion."
            : "Google sign-in failed. Please try again.";

      setIsSigningIn?.(false);
      onError?.(popupMessage);
    },
  });

const LoginButton = ({ onClick, disabled, isSigningIn }) => {
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

export default LoginButton;
