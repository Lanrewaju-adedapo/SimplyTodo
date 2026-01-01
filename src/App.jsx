import Homepane from "./Components/homepane";
import {
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import { ToastContainer, Zoom } from "react-toastify";
import RequireAuth from "./helpers/RequireAuth";
import { AuthProvider } from "./helpers/AuthProvider";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route index element={<SignUp />} />
      <Route path="/SignIn" element={<SignIn />} />
      <Route element={<RequireAuth />}>
        <Route path="/Webapp" element={<Homepane />} />
      </Route>
    </Route>
  )
);

function App() {
  return (
    <>
      <ToastContainer
        style={{
          "--toastify-color-progress-light":
            "linear-gradient(to right, #90d4f7, #63b3ed)",
          "--toastify-color-progress-dark":
            "linear-gradient(to right, #90d4f7, #63b3ed)",
          "--toastify-toast-min-height": "80px",
        }}
        progressStyle={{
          background: "var(--toastify-color-progress-light)",
          height: "3px",
        }}
        transition={Zoom}
        toastClassName={() => "!min-w-full !max-w-full !w-full !p-0"}
        bodyClassName={() => "!p-0 !m-0 !w-full !h-full"}
        className="!w-auto !max-w-[500px]"
        pauseOnFocusLoss={false}
        closeButton={false}
      />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </>
  );
}

export default App;
