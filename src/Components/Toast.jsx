import React from 'react';
import { MdOutlineCancel, MdOutlineCheckCircleOutline } from "react-icons/md";
import PropTypes from 'prop-types'; 

const Toast = ({ type = 'Success', title }) => {
    const toastStyles = {
        Success: {
            background: 'bg-green-100',
            icon: <div className='bg-green-100 p-2.5 rounded-full text-green-600'><MdOutlineCheckCircleOutline className="size-8" /></div>,
            titlecolor: 'text-black',
            role: 'status',
            ariaLive: 'polite'
        },
        Failed: {
            background: 'bg-red-100',
            icon: <div className='bg-red-100 p-2.5 rounded-full text-red-600'><MdOutlineCancel className="size-8" /></div>,
            titlecolor: 'text-black',
            role: 'alert',
            ariaLive: 'assertive'
        }
    };

    const style = toastStyles[type] || toastStyles.Success;

    return (
        <div className={`${style.background} ${style.border} py-2 px-3 rounded-lg shadow-lg w-full min-w-70`} role={style.role} aria-live={style.ariaLive}>
            <div className="flex items-center gap-3">
                {style.icon}
                <div className='flex flex-col items-start'>
                    <span className={`${style.titlecolor} font-semibold text-md leading-tight`}>{title}</span>
                </div>
            </div> 
        </div>
    );
};

Toast.propTypes = {
    type: PropTypes.oneOf(['Success', 'Failed']),
    message: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired
};

export default Toast;