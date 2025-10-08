import React, { useEffect, useState, useRef } from 'react'
import { IoClose } from "react-icons/io5";
import { BiSolidFlag } from "react-icons/bi";
import { LuCalendarCheck, LuCalendarClock } from "react-icons/lu";
import { BsHourglassSplit, BsCalendar3 } from "react-icons/bs";
import { IoFolderOpenOutline } from "react-icons/io5";
import { FiCheckCircle } from "react-icons/fi";
import { format, isBefore } from 'date-fns';
import Calendar from './Calendar';
import { FaRegBell } from 'react-icons/fa6';

const Taskmenu = ({ onclose, taskdetails, onTaskdeleted, refetch, fetchlength }) => {
    const baseUrl = "http://localhost:50/api/Todos/";
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [priorityDropdown, setPriorityDropdown] = useState(false);
    const [categoryDropdown, setcategoryDropdown] = useState(false);
    const [openCalendar, setOpenCalendar] = useState(false);
    const calendarRef = useRef(null);
    const priorityRef = useRef(null);

    const handleSelect = (category) => {
        setSelected(category);
        setOpen(false);
    };


    const [formData, setFormData] = useState({
        title: taskdetails.title ? taskdetails.title : '',
        description: taskdetails.description ? taskdetails.description : '',
        priority: taskdetails.priority,
        dueDate: taskdetails.dueDate ? new Date(taskdetails.dueDate) : null,
        categoryId: taskdetails.categoryId
    });

    useEffect(() => {
        setFormData({
            taskId: taskdetails.taskId,
            title: taskdetails.title ? taskdetails.title : '',
            description: taskdetails.description ? taskdetails.description : '',
            priority: taskdetails.priority,
            dueDate: taskdetails.dueDate ? new Date(taskdetails.dueDate) : null,
            categoryId: taskdetails.categoryId
        });
        setOpenCalendar(false);
    }, [taskdetails]);

    const togglePriorityDropdown = () => {
        setPriorityDropdown(!priorityDropdown);
    };

    const DeleteTask = async (taskId) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${baseUrl}${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                onclose();
                onTaskdeleted(taskId);
                if (typeof refetch === 'function') {
                    refetch();
                    fetchlength();
                }
            } else {
                console.error('Failed to delete task');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const UpdateTask = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`${baseUrl}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                console.log(await response.json());
                if (typeof refetch === 'function') {
                    refetch();
                    fetchlength();
                }
            } else {
                console.error('Failed to update task');
            }
        } catch (error) {
            console.error('Error updating task:', error);
        } finally {
            setIsSaving(false);
        }
    }

    const isDue = (dueDate) => {
        return dueDate && isBefore(new Date(dueDate), new Date());
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCalendarClick = () => {
        setOpenCalendar(true);
    };

    const handleCalendarClose = () => {
        setOpenCalendar(false);
    };

    const handleDateSelected = (date) => {
        setFormData(prev => ({ ...prev, dueDate: date }));
        setOpenCalendar(false);
    };

    const handlePriorityChange = (priority) => {
        setFormData(prev => ({ ...prev, priority }));
        setPriorityDropdown(false);
    };

    const handleClose = () => {
        handleCalendarClose();
        setPriorityDropdown(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setOpenCalendar(false);
            }
            if (priorityRef.current && !priorityRef.current.contains(event.target)) {
                setPriorityDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    const fetchCategoriesURL = "http://localhost:50/api/Todos/categories";
    const [selected, setSelected] = useState();
    const [allCategories, setallCategories] = useState();
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const result = await fetch(fetchCategoriesURL);
                const data = await result.json();
                setallCategories(data.data);
                const taskcategory = data.data.find(x => x.categoryId === formData.categoryId);
                setSelected(taskcategory);

                console.log("task category:", selected)
            } catch (error) {
                console.error('Error fetching categories:', error.message);
            }
        };
        fetchCategories();
    }, [formData.categoryId]);

    const [open, setOpen] = useState(false);
    const handleCategoryChange = (categoryId) => {
        setFormData(prev => ({ ...prev, categoryId }));
        setOpen(false);
    }

    return (
        <div className={`w-full h-full flex flex-col`}>
            <div className='flex-1 overflow-y-auto'>
                <div className='sticky top-0 z-10 flex items-center justify-between border-b border-gray-300 bg-[#f4f4f4] p-6' onClick={handleClose}>
                    <span className={`text-sm ${taskdetails.isCompleted ? 'text-green-500 font-semibold text-[16px]' : 'text-red-500 font-semibold text-[16px]'}`}>
                        {taskdetails.isCompleted ?
                            <span className='flex items-center gap-2'><FiCheckCircle color='#10B981' /><h2>Completed</h2></span> :
                            <span className='flex items-center gap-2'><BsHourglassSplit color='#D84315' /><h2>Pending..</h2></span>}
                    </span>
                    <IoClose className="size-6 cursor-pointer font-semibold text-gray-700" onClick={onclose} />
                </div>
                <div className='p-4'>
                    <div className='flex flex-col gap-4'>
                        <div className='flex flex-col gap-2'>
                            <div className='flex items-center justify-between'>
                                <label htmlFor="title" className='text-sm font-medium text-gray-800'>Title</label>
                                <div className='relative' ref={priorityRef}>
                                    {formData.priority === 1 ? (
                                        <div onClick={togglePriorityDropdown} className='flex cursor-pointer items-center gap-2 rounded-full p-2 text-gray-800 transition-all duration-200 hover:bg-gray-200'>
                                            <BiSolidFlag color='#FFA726' />
                                        </div>
                                    ) : formData.priority === 2 ? (
                                        <div onClick={togglePriorityDropdown} className='flex cursor-pointer items-center gap-2 rounded-full p-2 text-gray-800 transition-all duration-200 hover:bg-gray-200'>
                                            <BiSolidFlag color='#D84315' />
                                        </div>
                                    ) : (
                                        <div onClick={togglePriorityDropdown} className='flex cursor-pointer items-center gap-2 rounded-full p-2 text-gray-800 transition-all duration-200 hover:bg-gray-200'>
                                            <BiSolidFlag color='#9CCC65' />
                                        </div>
                                    )}
                                    {priorityDropdown && (
                                        <div className='absolute top-0 right-full z-50 mr-1 -translate-y-[10%]'>
                                            <div className='flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 shadow-xl'>
                                                <div onClick={() => handlePriorityChange(0)} className='flex items-center gap-2 hover:bg-gray-100 pl-4 pr-20 py-2 rounded-lg transition-all duration-200 cursor-pointer'>
                                                    <BiSolidFlag color='#9CCC65' /> <span>Low</span>
                                                </div>
                                                <div onClick={() => handlePriorityChange(1)} className='flex items-center gap-2 hover:bg-gray-100 pl-4 pr-20 py-2 rounded-lg transition-all duration-200 cursor-pointer'>
                                                    <BiSolidFlag color='#FFA726' /> <span>Medium</span>
                                                </div>
                                                <div onClick={() => handlePriorityChange(2)} className='flex items-center gap-2 hover:bg-gray-100 pl-4 pr-20 py-2 rounded-lg transition-all duration-200 cursor-pointer'>
                                                    <BiSolidFlag color='#D84315' /> <span>High</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <input type="text" name="title" value={formData.title} onChange={handleInputChange} className='rounded-lg border border-gray-300 p-3 focus:outline-none' />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <label htmlFor="description" className='text-sm font-medium text-gray-800'>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} className='h-40 border border-gray-300 p-3 focus:outline-none' />
                        </div>
                        <div className='relative flex items-center justify-between'>
                            <span className='flex items-center gap-1 text-sm text-gray-500'>
                                {taskdetails.isCompleted ?
                                    <LuCalendarCheck color='#10B981' className='size-5' /> :
                                    <LuCalendarClock color={isDue(formData.dueDate) ? '#D84315' : '#10B981'} className='size-5' />}
                                <span className='font-medium text-gray-800'>
                                    Due: {formData.dueDate ? format(formData.dueDate, 'h:mm a MMMM d, yyyy') : 'No Due Date'}
                                </span>
                            </span>
                            <div className='relative'>
                                <div className='cursor-pointer rounded-full p-3 hover:bg-gray-200' onClick={handleCalendarClick}>
                                    <FaRegBell className='size-5 text-gray-900' />
                                </div>
                                {openCalendar && (
                                    <div className='absolute top-0 right-full z-50 mr-2 -translate-y-[60%]' ref={calendarRef}>
                                        <Calendar onClose={handleCalendarClose} onDateSelected={handleDateSelected} initialDate={formData.dueDate} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative mr-3 ml-3 flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white backdrop-opacity-50 py-4 px-6 transition-all duration-200 hover:bg-gray-50 hover:shadow-md" onClick={() => setOpen(!open)}>
                    <div className='flex items-center space-x-2'>
                        {selected ? (
                            <>
                                <div style={{ backgroundColor: selected.colorCode }} className='size-3 rounded-lg'></div>
                                <span className="text-[14px] font-medium text-gray-500">{selected.categoryName}</span>
                            </>
                        ) :
                            <span className="text-[14px] font-medium text-gray-500">Category</span>
                        }
                    </div>
                    <div className='flex gap-3 items-center'>
                        <IoFolderOpenOutline className="text-lg text-gray-500" />
                    </div>
                    {open && (
                        <div className="absolute left-0 bottom-full z-20 mb-3 w-full max-h-60 overflow-y-auto rounded-xl border border-gray-200/80 bg-white shadow-2xl backdrop-blur-sm animate-in slide-in-from-top-2 duration-200">
                            {allCategories.map((cat) => (
                                <div key={cat.categoryId} className={`flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 first:rounded-t-xl last:rounded-b-xl transition-all duration-150 ${selected.categoryId === cat.categoryId ? 'bg-blue-50 border-r-2 border-blue-500' : ''}`} onClick={() => handleCategoryChange(cat.categoryId)}>
                                    <span style={{ backgroundColor: cat.colorCode }} className="h-4 w-4 rounded-full shadow-sm border border-white"/>
                                    <span className="text-gray-800 font-medium">{cat.categoryName}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className='bg-[#f4f4f4] p-4'>
                <div className='flex items-center justify-around gap-2 sm:gap-5'>
                    <button onClick={() => DeleteTask(taskdetails.taskId)} className='cursor-pointer px-7 font-semibold py-3 border-2 tracking-wide rounded-xl hover:shadow-sm transition-shadow border-gray-300' disabled={isLoading}>
                        {isLoading ? 'Deleting...' : 'Delete Task'}
                    </button>
                    <button onClick={UpdateTask} className={`${taskdetails.isCompleted ? 'cursor-not-allowed' : 'cursor-pointer'} px-7 font-semibold py-3 border-2 tracking-wide rounded-xl hover:shadow-sm transition-shadow bg-amber-300 border-amber-300`} disabled={taskdetails.isCompleted || isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Taskmenu;