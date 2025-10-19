import React, { useState, useEffect, useRef } from 'react'
import { FiPlus, FiChevronRight } from 'react-icons/fi';
import { LuCalendarClock, LuCalendarCheck } from "react-icons/lu";
import { IoIosArrowDown } from "react-icons/io";
import { format, isBefore } from 'date-fns';
import Loader from './Loader'
import Error from '../Images/error.png'
import { FaRegBell } from "react-icons/fa6";
import Calendar from './Calendar';
import { BiSolidFlag } from 'react-icons/bi';
import emptyicon from '../Images/Caticon.png'
import axiosInstance from '../helpers/useAxiosPrivate';

const Upcomingpage = ({ open, activesection, TASK, loader, error, fetchtasks, fetchlength }) => {
    const [openCalendar, setOpenCalendar] = useState(false);
    const [priorityDropdown, setpriorityDropdown] = useState(false);
    const calendarRef = useRef(null);
    const priorityRef = useRef(null);
    const baseUrl = "http://localhost:50/api/Todos/CompleteTask";
    const addTaskUrl = "http://localhost:50/api/Todos/";

    const [tasks, setTasks] = useState(TASK);

    useEffect(() => {
        setTasks(TASK);
    }, [TASK]);

    const [formData, setFormData] = useState({
        title: '',
        dueDate: new Date(),
        Priority: 0,
    });

    const UpdateTask = async (taskId, isCompleted) => {
        try {
            const response = await axiosInstance.put('/api/Todos/CompleteTask', {
                taskId, isCompleted,
            });
            if (response.status === 200) {
                // console.log(await response.json());
                setTasks(prevTasks =>
                    prevTasks.map(task =>
                        task.taskId === taskId ? { ...task, isCompleted } : task
                    )
                );
                if (typeof fetchtasks === 'function') {
                    fetchtasks();
                    fetchlength();
                }
            } else {
                console.error('Failed to update task');
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    }

    const handleCompleted = async (taskId, currentStatus) => {
        const newStatus = !currentStatus;
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.taskId === taskId ? { ...task, isCompleted: newStatus } : task));
        await UpdateTask(taskId, newStatus);
    }

    const handleCalendarClick = () => {
        setOpenCalendar(true);
    };

    const handleCalendarClose = () => {
        setOpenCalendar(false);
    };

    const togglePriorityDropdown = () => {
        setpriorityDropdown(!priorityDropdown);
    };

    const handleDateSelected = (date) => {
        setFormData(prev => ({ ...prev, dueDate: date }));
        setOpenCalendar(false);
    };

    const handleprioritySelected = (priority) => {
        setFormData(prev => ({ ...prev, Priority: priority }));
        setpriorityDropdown(false);
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleKeyPress = async (e) => {
        if (e.key === 'Enter' && formData.title.trim() !== '') {
            e.preventDefault();
            await addNewTask();
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setOpenCalendar(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const addNewTask = async () => {
        try {
            const response = await axiosInstance.post('/api/Todos', {
                    title: formData.title,
                    dueDate: new Date(formData.dueDate).toISOString() ,
                    priority: formData.Priority
            });

            if (response.status === 200) {
                const newTask = await response.data;
                console.log('Task added:', newTask);

                setTasks(prevTasks => [...prevTasks, newTask]);

                setFormData({
                    title: '',
                    dueDate: new Date(),
                    Priority: 0,
                });

                await fetchlength();
            } else {
                console.error('Failed to add task');
            }
        } catch (error) {
            console.error('Error adding task:', error);
        }
    }

    const isDue = (dueDate) => {
        return dueDate && isBefore(new Date(dueDate), new Date());
    };

    return (
        <div className="flex flex-1 flex-col">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                <div className="flex items-center">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-800">{activesection}</h1>
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-sm sm:text-lg lg:text-xl font-medium text-gray-600">{TASK.length}</span>
                    </div>
                </div>
            </div>
            <div className="mx-3 sm:mx-6 lg:mx-8 mt-2 sm:mt-4 mb-2 rounded-2xl border border-gray-200 bg-white px-3 sm:px-6 py-3 shadow-sm transition-all duration-200 focus-within:border-amber-300">
                {/* Mobile Layout (lg:hidden) */}
                <div className="flex flex-col gap-2 lg:hidden">
                    <div className="flex items-center gap-2 border-b border-gray-200 sm:gap-3">
                        <FiPlus className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                        <input type="text" name="title" value={formData.title} placeholder="Add New Task" className="placeholder-gray-400 flex-1 bg-transparent text-sm sm:text-base text-gray-700 focus:outline-none min-w-0" onChange={handleInputChange} onKeyPress={handleKeyPress} />
                        <div className="relative flex items-center" ref={calendarRef}>
                            <div className="cursor-pointer rounded-full p-2 transition-colors duration-150 hover:bg-gray-100" onClick={handleCalendarClick}>
                                <FaRegBell className="size-5 text-gray-700" />
                            </div>
                            {openCalendar && (
                                <div className="absolute top-full right-0 z-50 mt-2">
                                    <Calendar
                                        onClose={handleCalendarClose}
                                        onDateSelected={handleDateSelected}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="relative flex-shrink-0" ref={priorityRef}>
                            {formData.Priority === 1 ? (
                                <BiSolidFlag color="#FFA726" className="size-4 sm:size-5" />
                            ) : formData.Priority === 2 ? (
                                <BiSolidFlag color="#D84315" className="size-4 sm:size-5" />
                            ) : (
                                <BiSolidFlag color="#9CCC65" className="size-4 sm:size-5" />
                            )}
                        </div>
                        <div className="relative flex cursor-pointer rounded-full p-1 transition-colors duration-150 hover:bg-gray-100 flex-shrink-0">
                            <IoIosArrowDown onClick={togglePriorityDropdown} className="size-4 sm:size-5" />
                            {priorityDropdown && (
                                <div className="absolute top-full right-0 z-50 mt-2">
                                    <div className="flex w-36 sm:w-44 flex-col gap-1.5 rounded-xl border border-gray-100 bg-white p-2.5 shadow-lg">
                                        <h1 className="border-b border-gray-200 pb-2 font-medium text-[12px]">Priority</h1>
                                        <div onClick={() => handleprioritySelected(0)} className="flex items-center gap-2 hover:bg-green-50 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200">
                                            <BiSolidFlag color="#9CCC65" className="text-lg" />
                                            <span className="text-sm font-medium text-gray-700">Low</span>
                                        </div>
                                        <div onClick={() => handleprioritySelected(1)} className="flex items-center gap-2 hover:bg-amber-50 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200">
                                            <BiSolidFlag color="#FFA726" className="text-lg" />
                                            <span className="text-sm font-medium text-gray-700">Medium</span>
                                        </div>
                                        <div onClick={() => handleprioritySelected(2)} className="flex items-center gap-2 hover:bg-red-50 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200">
                                            <BiSolidFlag color="#D84315" className="text-lg" />
                                            <span className="text-sm font-medium text-gray-700">High</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <FaRegBell className="size-4 text-gray-500" />
                        <span>{format(formData.dueDate, "h:mm a MMM d, yyyy")}</span>
                    </div>
                </div>
                {/* Desktop Layout (hidden lg:flex) */}
                <div className="hidden lg:flex items-center gap-2 sm:gap-3">
                    <FiPlus className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                    <input type="text" name="title" value={formData.title} placeholder="Add New Task" className="placeholder-gray-400 flex-1 bg-transparent text-sm sm:text-base text-gray-700 focus:outline-none min-w-0" onChange={handleInputChange} onKeyPress={handleKeyPress} />
                    <div className="relative flex items-center gap-2" ref={calendarRef}>
                        <div className="cursor-pointer rounded-full p-2 transition-colors duration-150 hover:bg-gray-100" onClick={handleCalendarClick}>
                            <FaRegBell className="size-5 text-gray-700" />
                        </div>
                        <h2 className="text-sm font-medium text-gray-600 whitespace-nowrap">
                            {format(formData.dueDate, "h:mm a MMM d, yyyy")}
                        </h2>
                        {openCalendar && (
                            <div className="absolute top-full right-0 z-50 mt-2">
                                <Calendar onClose={handleCalendarClose} onDateSelected={handleDateSelected} />
                            </div>
                        )}
                    </div>
                    <div className="relative flex-shrink-0" ref={priorityRef}>
                        {formData.Priority === 1 ? (
                            <BiSolidFlag color="#FFA726" className="size-4 sm:size-5" />
                        ) : formData.Priority === 2 ? (
                            <BiSolidFlag color="#D84315" className="size-4 sm:size-5" />
                        ) : (
                            <BiSolidFlag color="#9CCC65" className="size-4 sm:size-5" />
                        )}
                    </div>
                    <div className="relative flex cursor-pointer rounded-full p-1 transition-colors duration-150 hover:bg-gray-100 flex-shrink-0">
                        <IoIosArrowDown onClick={togglePriorityDropdown} className="size-4 sm:size-5" />
                        {priorityDropdown && (
                            <div className="absolute top-full right-0 z-50 mt-2">
                                <div className="flex w-36 sm:w-44 flex-col gap-1.5 rounded-xl border border-gray-100 bg-white p-2.5 shadow-lg">
                                    <h1 className="border-b border-gray-200 pb-2 font-medium text-[12px]">Priority</h1>
                                    <div onClick={() => handleprioritySelected(0)} className="flex items-center gap-2 hover:bg-green-50 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200">
                                        <BiSolidFlag color="#9CCC65" className="text-lg" />
                                        <span className="text-sm font-medium text-gray-700">Low</span>
                                    </div>
                                    <div onClick={() => handleprioritySelected(1)} className="flex items-center gap-2 hover:bg-amber-50 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200">
                                        <BiSolidFlag color="#FFA726" className="text-lg" />
                                        <span className="text-sm font-medium text-gray-700">Medium</span>
                                    </div>
                                    <div onClick={() => handleprioritySelected(2)} className="flex items-center gap-2 hover:bg-red-50 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200">
                                        <BiSolidFlag color="#D84315" className="text-lg" />
                                        <span className="text-sm font-medium text-gray-700">High</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {(loader === false && error === 'Error fetching upcoming tasks:') && (
                <div className='flex h-screen w-full flex-col items-center justify-center gap-3 px-4'>
                    <img src={Error} alt="Error" className='size-16 sm:size-20' />
                    <h2 className='text-base sm:text-lg font-medium text-gray-500 text-center'>Error Fetching Data...</h2>
                </div>
            )}
            {loader === true &&
                <div className='flex h-screen w-full items-center justify-center gap-2 px-4'>
                    <h2 className='text-base sm:text-lg font-medium text-gray-500'>Fetching Tasks...</h2>
                    <Loader />
                </div>}
            {(error !== 'Error fetching upcoming tasks:' && tasks.length <= 0 && loader === false) &&
                <div className='flex h-screen w-full flex-col items-center justify-center gap-3 px-4'>
                    <img src={emptyicon} alt='empty' className='size-32 sm:size-40 opacity-70' />
                    <h2 className='text-sm sm:text-lg font-medium text-gray-500 text-center max-w-md'>
                        Nothing to do! Enjoy the peace and quiet or add a new task <span className='text-lg sm:text-xl font-semibold'>+</span>.
                    </h2>
                </div>
            }
            {(loader === false && tasks.length > 0) && (
                <div className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="space-y-2 sm:space-y-3 p-4 sm:p-6 lg:p-8">
                        {tasks.map((task) => (
                            <div key={task.taskId} className="rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-sm">
                                <div className="flex items-center justify-between p-3 sm:p-4">
                                    <div className="flex flex-1 items-start sm:items-center space-x-3 sm:space-x-4 min-w-0">
                                        <input type="checkbox" checked={task.isCompleted} onChange={() => handleCompleted(task.taskId, task.isCompleted)} className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500 mt-0.5 sm:mt-0 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                                                <span className={`text-sm sm:text-base text-gray-800 break-words ${task.isCompleted ? "line-through text-gray-500" : ""}`}>
                                                    {task.title}
                                                </span>
                                                <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0 text-xs sm:text-sm">
                                                    {task.dueDate && (
                                                        <span className="flex items-center gap-1 sm:gap-2 rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
                                                            {task.isCompleted ? (
                                                                <LuCalendarCheck color="#10B981" className="size-3 sm:size-4 flex-shrink-0"/>
                                                            ) : (
                                                                <LuCalendarClock color={isDue(task.dueDate) ? "#D84315" : "#10B981"} className="size-3 sm:size-4 flex-shrink-0"/>
                                                            )}
                                                            <span className="hidden sm:inline">
                                                                {format(new Date(task.dueDate), "MMMM dd, yyyy h:mm a")}
                                                            </span>
                                                            <span className="sm:hidden">
                                                                {format(new Date(task.dueDate), "MMM dd, h:mm a")}
                                                            </span>
                                                        </span>
                                                    )}
                                                    {task.list && (
                                                        <div className="flex items-center space-x-1">
                                                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                                            <span className="text-xs text-gray-500">
                                                                {task.list}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {task.categoryName && (
                                                        <div className="flex items-center space-x-1 sm:space-x-2">
                                                            <div style={{ backgroundColor: task.colorCode }} className="size-3 sm:size-4 rounded-lg flex-shrink-0"></div>
                                                            <span className="text-xs text-gray-500 truncate">
                                                                {task.categoryName}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div onClick={() => open(task.taskId)} className="cursor-pointer hover:bg-gray-100 rounded-full transition-all duration-150 p-1 sm:p-1.5 ml-2 flex-shrink-0">
                                        <FiChevronRight className="size-4 sm:size-5 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Upcomingpage;