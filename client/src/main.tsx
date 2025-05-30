import { createBrowserRouter, RouterProvider } from "react-router";

import "@/index.css";
import ReactDOM from "react-dom/client";

import RootLayout from "@/RootLayout";
import SignInPage from "@/components/SignInPage";
import SignupPage from "@/components/SignUpPage";
import PrimaryLayout from "@/PrimaryLayout";
import ChatsPage from "@/components/ChatsPage";
import ChatWrapper from "@/components/ChatWrapper";
import { ProfileSettingsPage } from "@/components/ProfileSettingsPage";

const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        path: "sign-in",
        Component: SignInPage
      },
      {
        path: "sign-up",
        Component: SignupPage
      },
      {
        Component: PrimaryLayout,
        children: [
          {
            index: true,
            Component: ChatsPage
          },
          {
            path: "chats",
            Component: ChatsPage
          },
          {
            path: "chats/:conversationId",
            Component: ChatWrapper
          },
          {
            path: "profile",
            Component: ProfileSettingsPage
          }
        ]
      }
    ]
  }
]);

const root = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(root).render(<RouterProvider router={router} />);
