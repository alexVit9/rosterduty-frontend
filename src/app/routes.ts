import { createBrowserRouter } from "react-router";
import HomePage from "./pages/HomePage";
import TemplatesPage from "./pages/TemplatesPage";
import TemplateEditorPage2 from "./pages/TemplateEditorPage2";
import FillChecklistPage from "./pages/FillChecklistPage";
import HistoryPage from "./pages/HistoryPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import RestaurantPage from "./pages/RestaurantPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AcceptInvitePage from "./pages/AcceptInvitePage";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/invite/accept",
    Component: AcceptInvitePage,
  },
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/templates",
    Component: TemplatesPage,
  },
  {
    path: "/templates/new",
    Component: TemplateEditorPage2,
  },
  {
    path: "/templates/edit/:id",
    Component: TemplateEditorPage2,
  },
  {
    path: "/fill",
    Component: FillChecklistPage,
  },
  {
    path: "/history",
    Component: HistoryPage,
  },
  {
    path: "/restaurant",
    Component: RestaurantPage,
  },
  {
    path: "/subscription",
    Component: SubscriptionPage,
  },
]);
