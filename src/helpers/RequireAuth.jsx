import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "./useAuth";

const RequireAuth = () => {
    const { auth } = useAuth();
    const location = useLocation();


    return (
        auth?.user ? <Outlet /> : <Navigate to="/SignIn" state={{from: location}} replace/>
    );
}

export default RequireAuth;

