"use client";
import dynamic from 'next/dynamic';
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

// Create the actual UserButton component
const UserButtonComponent = () => {
  const { useCurrentUser } = require("../hooks/use-current-user");
  const user = useCurrentUser();

  const {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } = require("@/components/ui/dropdown-menu");
  
  const { AvatarImage } = require("@/components/ui/avatar");
  const { LogOut } = require("lucide-react");
  const LogoutButton = require("./logout-button").default;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className={cn("relative rounded-full")}>
          <Avatar>
            <AvatarFallback className="bg-red-500">
              <User className="text-white" />
            </AvatarFallback>
            {user?.image && (
              <AvatarImage src={user.image} alt={user?.name || "User"} />
            )}
          </Avatar>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="mr-4">
        <DropdownMenuItem>
          <span>
            {user?.email || "Loading..."}
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator/>
        <LogoutButton>
          <DropdownMenuItem>
            <LogOut className="h-4 w-4 mr-2"/>
            LogOut
          </DropdownMenuItem>
        </LogoutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Export the dynamic component with no SSR
const UserButton = dynamic(() => Promise.resolve(UserButtonComponent), {
  ssr: false,
  loading: () => (
    <div className={cn("relative rounded-full")}>
      <Avatar>
        <AvatarFallback className="bg-red-500">
          <User className="text-white" />
        </AvatarFallback>
      </Avatar>
    </div>
  )
});

export default UserButton;