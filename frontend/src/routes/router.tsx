import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "../shared/RootLayout";
import { HomePage } from "../pages/HomePage";
import { AdminPage } from "../pages/AdminPage";
import { StudentPage } from "../pages/StudentPage";
import { ResultPage } from "../pages/ResultPage";
import { LoginPage } from "../pages/LoginPage";
import { SignupPage } from "../pages/SignupPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
      { path: "admin", element: <AdminPage /> },
      { path: "student", element: <StudentPage /> },
      { path: "result/:assignmentId", element: <ResultPage /> },
    ],
  },
]);
