import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../Components/Toast";

export const showCustomToast = (type, title) => {
  toast(<Toast type={type} title={title} />, {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    progress: undefined,
  });
};
