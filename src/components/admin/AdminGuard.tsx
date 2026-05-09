"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Loader2 } from "lucide-react";

// ONLY THIS EMAIL CAN ACCESS THE ADMIN PANEL
const ADMIN_EMAILS = ["jalalhossainjoy818@gmail.com"]; 

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Check if user is logged in AND their email is in the Admin list
      if (user && user.email && ADMIN_EMAILS.includes(user.email)) {
        setIsAuthorized(true);
        if (pathname === "/admin/login") {
          router.push("/admin");
        }
      } else {
        setIsAuthorized(false);
        if (pathname !== "/admin/login") {
          router.push("/admin/login");
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070B14]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Prevent rendering admin layout if not authorized
  if (!isAuthorized && pathname !== "/admin/login") {
     return null; 
  }

  return <>{children}</>;
}
