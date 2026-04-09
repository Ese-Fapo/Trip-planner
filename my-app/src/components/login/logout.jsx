/* eslint-disable react-refresh/only-export-components */
import React from "react";
import { googleLogout } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { clearStoredUser } from "@/components/login/login";

export const logoutUser = () => {
  googleLogout();
  clearStoredUser();
};

const LogoutButton = ({
  onLogout,
  className = "",
  variant = "outline",
  children = "Logout",
  ...props
}) => {
  const handleClick = () => {
    logoutUser();
    onLogout?.();
  };

  return (
    <Button variant={variant} className={className} onClick={handleClick} {...props}>
      {children}
    </Button>
  );
};

export default LogoutButton;
