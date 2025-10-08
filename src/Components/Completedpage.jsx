import React, { useState } from 'react'
import Error from '../Images/error.png'
import { format, isBefore } from 'date-fns'
import Loader from './Loader'
import { LuCalendarCheck, LuCalendarClock } from 'react-icons/lu'
import Completed from '../Images/Completed.png'
import { FiChevronRight } from 'react-icons/fi'

const Completedpage = ({ completedtasks, activesection, isloading, error, open, fetchcompletedtasks, fetchlength }) => {

    const [tasks, setTasks] = useState(completedtasks);
    const baseUrl = "http://localhost:50/api/Todos/CompleteTask";
    
    const UpdateTask = async (taskId, isCompleted) => {
        try {
            const response = await fetch(`${baseUrl}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ taskId, isCompleted }),
            });
            if (response.ok) {
                console.log(await response.json());
                setTasks(prevTasks =>
                    prevTasks.map(task =>
                        task.taskId === taskId ? { ...task, isCompleted } : task
                    )
                );
                if (typeof fetchcompletedtasks === 'function') {
                    fetchcompletedtasks();
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

    const isDue = (dueDate) => {
        return dueDate && isBefore(new Date(dueDate), new Date());
    };
    console.log(error);
    return (
        <div className="flex flex-1 flex-col">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                <div className="flex items-center">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-800">{activesection}</h1>
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-sm sm:text-lg lg:text-xl font-medium text-gray-600">{completedtasks.length}</span>
                    </div>
                </div>
            </div>
            {(isloading === false && error === 'Error fetching completed tasks:') && (
                <div className='flex h-screen w-full flex-col items-center justify-center gap-3 px-4'>
                    <img src={Error} alt="Error" className='size-16 sm:size-20' />
                    <h2 className='text-base sm:text-lg font-medium text-gray-500 text-center'>Error Fetching Data...</h2>
                </div>
            )}
            {isloading === true &&
                <div className='flex h-screen w-full items-center justify-center gap-2 px-4'>
                    <h2 className='text-base sm:text-lg font-medium text-gray-500'>Fetching Tasks...</h2>
                    <Loader />
                </div>}
            {(completedtasks.length <= 0 && error !== 'Error fetching completed tasks:' && isloading === false) &&
                <div className='flex h-screen w-full flex-col items-center justify-center gap-3 px-4'>
                    <img src={Completed} alt='empty' className='size-32 sm:size-40 opacity-70' />
                    <h2 className='text-sm sm:text-lg font-medium text-gray-500 text-center max-w-md'>Completed Tasks Will Appear Here.</h2>
                </div>
            }
            {(isloading === false && completedtasks.length > 0 && error !== 'Error fetching completed tasks:') && (
                <div className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="space-y-2 sm:space-y-3 p-4 sm:p-6 lg:p-8">
                        {completedtasks.map((task) => (
                            <div key={task.taskId} className="rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-sm">
                                <div className="flex items-center justify-between p-3 sm:p-4">
                                    <div className="flex flex-1 items-start sm:items-center space-x-3 sm:space-x-4 min-w-0">
                                        <input 
                                            type="checkbox" 
                                            checked={task.isCompleted} 
                                            onChange={() => handleCompleted(task.taskId, task.isCompleted)} 
                                            className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500 mt-0.5 sm:mt-0 flex-shrink-0" 
                                        />
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

export default Completedpage