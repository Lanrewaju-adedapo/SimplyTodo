import React, { useEffect, useState } from 'react'
import Logo from '../Images/SimplyTODO.png';
import { NavLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form'
import { ToastContainer, Slide, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { VscEye, VscEyeClosed } from "react-icons/vsc";
import { MdErrorOutline } from 'react-icons/md';
import { showCustomToast } from '../helpers/ToastContext';
import ButtonLoader from '../Components/buttonLoader';

const SignUp = () => {
    const BASE_URL = "http://localhost:50/api/Auth"
    const [seePass, setseePass] = useState(false);
    const [seeCPass, setseeCPass] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isCFocused, setIsCFocused] = useState(false);

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
        name: '',
        email: '',
        password: '',
        confirmpassword: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const password = watch('password')
    const navigate = useNavigate();

    const [loading, setloading] = useState(false);
    const registerUser = async () => {
        setloading(true)
        try {
            const response = await fetch(`${BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({
                    userName: formData.name,
                    password: formData.password,
                    confirmpassword: formData.confirmpassword,
                    email: formData.email
                })
            })

            const result = await response.json();
            if (result.status === "Success") {
                showCustomToast(`${result.status}`, `${result.message}`);
                setTimeout(() => {
                    navigate("/SignIn", { replace: true })
                }, 2000)
            } else {
                showCustomToast(`${result.status}`, `${result.message}`)
            }
        }
        catch (error) {
            console.error("error adding user", error)
        }
        finally {
            setloading(false)
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
                        Already have an account ?
                    </p>
                    <NavLink to='/SignIn' className="rounded-lg bg-amber-300 px-4 py-2 font-medium">
                        Sign In
                    </NavLink>
                </div>
            </nav>
            <div className="flex flex-1 items-center justify-center px-4">
                <div className="flex w-full max-w-md flex-col gap-6 rounded-2xl bg-white p-8 shadow-2xl md:p-10">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-800 md:text-4xl">Create Account</h2>
                        <p className="mt-2 text-sm text-gray-500">Organize Your Life, One Task at a Time.</p>
                    </div>
                    <form action="" onSubmit={handleSubmit(registerUser)} className="flex flex-col gap-4">
                        <div className='flex flex-col gap-2'>
                            <input type="text" id='name' name='name' placeholder="Name" className={`p-3 border border-gray-300 rounded-xl text-[16px] w-full focus:outline-none focus:ring-2 focus:ring-amber-300 transition`}{...register("name", { required: "Please enter your name" })} onChange={handleInputChange} />
                            {errors.name && (<p className='mt-1 flex items-center gap-1 text-sm text-red-600'>
                                <MdErrorOutline className="inline" /> {errors.name.message}
                            </p>)}
                        </div>
                        <div className='flex flex-col gap-2'>
                            <input type="email" id='email' name='email' placeholder="Email" className="w-full rounded-xl border border-gray-300 p-3 text-[16px] transition focus:ring-2 focus:ring-amber-300 focus:outline-none"
                                {...register("email", { required: "Please enter an email" })} onChange={handleInputChange} />
                            {errors.email && (<p className='mt-1 flex items-center gap-1 text-sm text-red-600'>
                                <MdErrorOutline className="inline" /> {errors.email.message}
                            </p>)}
                        </div>
                        <div className='flex flex-col gap-2 relative' onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}>
                            <input type={seePass ? "text" : "password"} id='password' name='password' placeholder="Password" className="w-full rounded-xl border border-gray-300 p-3 text-[16px] transition focus:ring-2 focus:ring-amber-300 focus:outline-none"
                                {...register("password", { required: "please enter a password" })} onChange={handleInputChange} />
                            {errors.password && (<p className='mt-1 flex items-center gap-1 text-sm text-red-600'>
                                <MdErrorOutline className="inline" /> {errors.password.message}
                            </p>)}
                            {(isFocused === true ) && (
                                <button type='button' className='absolute top-4 right-3 flex items-center justify-center' onMouseDown={(e) => {setseePass(!seePass); e.preventDefault();}}>
                                    {seePass ? <VscEye className='size-5' /> : <VscEyeClosed className='size-5' />}
                                </button>
                            )}
                        </div>
                        <div className='flex flex-col gap-2 relative' onFocus={() => setIsCFocused(true)} onBlur={() => setIsCFocused(false)}>
                            <input type={seeCPass ? "text" : "password"} id='confirmpassword' name='confirmpassword' placeholder="Password Confirm" className="w-full rounded-xl border border-gray-300 p-3 text-[16px] transition focus:ring-2 focus:ring-amber-300 focus:outline-none" 
                                {...register("confirmpassword", { required: "please confirm password", validate: (value) => value === password || 'Passwords do not match' })} onChange={handleInputChange} />
                            {errors.confirmpassword && (<p className='mt-1 flex items-center gap-1 text-sm text-red-600'>
                                <MdErrorOutline className="inline" /> {errors.confirmpassword.message}
                            </p>)}
                            {(isCFocused === true) && (
                                <button type='button' className='absolute top-4 right-3 flex items-center justify-center' onMouseDown={(e) => {setseeCPass(!seeCPass); e.preventDefault();}}>
                                    {seeCPass ? <VscEye className='size-5' /> : <VscEyeClosed className='size-5' />}
                                </button>
                            )}
                        </div>
                        <button type="submit" className="flex w-full transform flex-col items-center justify-center rounded-xl bg-amber-300 px-6 py-3 font-semibold text-gray-700 shadow-md transition-transform hover:scale-[1.02] hover:bg-amber-400">
                            {loading ? <ButtonLoader /> : "Sign Up"}
                        </button>
                    </form>
                    <div className='border-b border-gray-300'></div>
                    <p className="text-center text-sm text-gray-600">
                        Already have an account? {" "}
                        <NavLink to='/SignIn' className="font-medium text-amber-500 hover:underline">
                            Sign in
                        </NavLink>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default SignUp
