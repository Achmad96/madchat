import { Outlet } from "react-router";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { NotificationBadge } from "@/components/NotificationBadge";
import MenuHamburger from "@/components/MenuHamburger";

export default function PrimaryLayout() {
  return (
    <NotificationProvider>
      <nav className="w-full max-w-full h-[10dvh] px-5 flex justify-center items-center">
        <div className="flex justify-between items-center w-[50%] max-md:w-full">
          <h2 className="text-2xl font-bold">MadChat</h2>
          <div className="flex items-center gap-10">
            <NotificationBadge />
            <MenuHamburger />
          </div>
        </div>
      </nav>
      <Outlet />
    </NotificationProvider>
  );
}
