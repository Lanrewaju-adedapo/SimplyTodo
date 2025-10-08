import axios from "../api/axios";
import useAuth from "./useAuth";

const useRefreshToken = () => {
    const { auth, setAuth } = useAuth(); 

    const refresh = async () => {
        try {
            const response = await axios.post("/Auth/refreshToken",
                {
                    token: auth?.token, 
                    refreshToken: auth?.refreshToken 
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );   

            const newToken = response.data.token;
            const newRefreshToken = response.data.refreshToken;

            setAuth(prev => {
                return { 
                    ...prev, 
                    token: newToken,
                    refreshToken: newRefreshToken
                }
            });

            return newToken;
        } catch (error) {
            console.error("Refresh token failed:", error);
            throw error; 
        }
    }

    return refresh;
}

export default useRefreshToken;