import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "../shared/RootLayout";
import { HomePage } from "../pages/HomePage";
import { AdminPage } from "../pages/AdminPage";
import { StudentPage } from "../pages/StudentPage";
import { ResultPage } from "../pages/ResultPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "admin", element: <AdminPage /> },
      { path: "student", element: <StudentPage /> },
      { path: "result/:assignmentId", element: <ResultPage /> },
    ],
  },
]);
