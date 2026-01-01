import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom'
import Logo from '../Images/SimplyTODO.png';
import { ToastContainer, toast, Slide, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from '../api/axios';
import { showCustomToast } from '../helpers/ToastContext';
import { VscEye, VscEyeClosed } from "react-icons/vsc";
import { useForm } from 'react-hook-form';
import ButtonLoader from '../Components/buttonLoader';
import { MdErrorOutline } from 'react-icons/md';
import useAuth from '../helpers/useAuth';
import axiosInstance from '../helpers/useAxiosPrivate';


const SignIn = () => {
    const { setAuth } = useAuth();
    const [seePass, setseePass] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [loading, setloading] = useState(false);
    const loginURL = "/auth/Login"
    let navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathename || "/Webapp";

    const {
        register,
        handleSubmit,
        formState: { errors },
        clearErrors,
        watch
    } = useForm()

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            const timer = setTimeout(() => {
                clearErrors();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [errors, clearErrors])

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const loginUser = async (e) => {
        setloading(true);

        try {
            const response = await axios.post(
                loginURL,
                {
                    email: formData.email,
                    password: formData.password
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );

            const result = response.data;
            const accessToken = result.token;
            console.log('the token is', accessToken);
            const token = accessToken;
            localStorage.setItem("accessToken", accessToken);
            console.log("Received token:", accessToken);

            if (accessToken) {
                localStorage.setItem("accessToken", accessToken);
            }

            if (token) {
                console.log("Token exists", token)
            } else {
                console.log("No token")
            }

            setAuth({ user: formData.email, password: formData.password, accessToken })

            if (result.status === "Success") {

                showCustomToast("Success", "Login successful!");
                setTimeout(() => {
                    navigate(from, { replace: true });
                }, 1000);
                console.log("Token in localStorage:", localStorage.getItem("accessToken"));

            } else {
                showCustomToast(result.status || "Failed", result.message || "Login failed");
            }
        }
        catch (error) {
            console.error("Error logging in", error);
            const errorMessage = error.response?.data?.message || "Error Logging In";
            showCustomToast("Failed", errorMessage);
        }
        finally {
            setloading(false);
        }
    }

    return (
        <div className='flex min-h-screen flex-col bg-gradient-to-tl from-amber-100 via-white to-amber-50'>
            <ToastContainer
                style={{ '--toastify-color-progress-light': 'linear-gradient(to right, #90d4f7, #63b3ed)', '--toastify-color-progress-dark': 'linear-gradient(to right, #90d4f7, #63b3ed)', '--toastify-toast-min-height': '80px' }}
                progressStyle={{ background: 'var(--toastify-color-progress-light)', height: '3px' }}
                transition={Zoom}
                toastClassName={() => "!min-w-full !max-w-full !w-full !p-0"}
                bodyClassName={() => "!p-0 !m-0 !w-full !h-full"}
                className="!w-auto !max-w-[500px]"
                pauseOnFocusLoss={false}
                closeButton={false} />
            <nav className='flex items-center gap-3 px-5 py-2'>
                <div className='mr-auto flex items-center gap-3'>
                    <img src={Logo} className='size-15' alt="" />
                    <h2 className='text-xl font-semibold'>SimplyTODO</h2>
                </div>
                <div className='flex items-center gap-3'>
                    <p className="text-center text-sm font-medium text-gray-600">
                        Don't have an account ?
                    </p>
                    <NavLink to='/' className="rounded-lg bg-amber-300 px-4 py-2 font-medium">
                        Sign Up
                    </NavLink>
                </div>
            </nav>
            <div className="flex flex-1 items-center justify-center px-4">
                <div className="flex w-full max-w-md flex-col gap-6 rounded-2xl bg-white p-8 shadow-2xl md:p-10">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-700 md:text-4xl">Welcome Back</h2>
                        <p className="mt-2 text-sm text-gray-500">Organize Your Life, One Task at a Time.</p>
                    </div>
                    <form action="" onSubmit={handleSubmit(loginUser)} className="flex flex-col gap-4">
                        <div className='flex flex-col gap-2'>
                            <input type="email" id='email' name='email' placeholder="Email" className="w-full rounded-xl border border-gray-300 p-3 text-[16px] transition focus:ring-2 focus:ring-amber-300 focus:outline-none"
                                {...register("email", { required: "Please enter an email" })} onChange={handleInputChange} />
                            {errors.email && (<p className='mt-1 flex items-center gap-1 text-sm text-red-600'>
                                <MdErrorOutline className="inline" /> {errors.email.message}
                            </p>)}
                        </div>
                        <div className='relative flex flex-col gap-2' onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}>
                            <input type={seePass ? "text" : "password"} id='password' name='password' placeholder="Password" className="w-full rounded-xl border border-gray-300 p-3 text-[16px] transition focus:ring-2 focus:ring-amber-300 focus:outline-none"
                                {...register("password", { required: "please enter a password" })} onChange={handleInputChange} />
                            {errors.password && (<p className='mt-1 flex items-center gap-1 text-sm text-red-600'>
                                <MdErrorOutline className="inline" /> {errors.password.message}
                            </p>)}
                            {(isFocused === true) && (
                                <button type='button' className='absolute top-4 right-3 flex items-center justify-center' onMouseDown={(e) => { setseePass(!seePass); e.preventDefault(); }}>
                                    {seePass ? <VscEye className='size-5' /> : <VscEyeClosed className='size-5' />}
                                </button>
                            )}
                        </div>
                        <button type="submit" className="flex w-full transform flex-col items-center justify-center rounded-xl bg-amber-300 px-6 py-3 font-semibold text-gray-700 shadow-md transition-transform hover:scale-[1.02] hover:bg-amber-400" disabled={loading}>
                            {loading ? <ButtonLoader /> : "Sign In"}
                        </button>
                    </form>
                    <div className='border-b border-gray-300'></div>
                    <p className="text-center text-sm text-gray-600">
                        Don't have an account ?{" "}
                        <NavLink to='/' className="font-medium text-amber-500 hover:underline">
                            Sign Up
                        </NavLink>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default SignIn