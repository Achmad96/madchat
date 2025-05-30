import Providers from "@/components/Providers";
import { Outlet } from "react-router";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout() {
  return (
    <Providers>
      <Toaster richColors position="top-center" />
      <Outlet />
    </Providers>
  );
}
