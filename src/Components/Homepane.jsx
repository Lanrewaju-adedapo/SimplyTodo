import React, { useEffect, useState } from 'react';
import { FiMenu } from 'react-icons/fi';
import Taskmenu from './TaskMenu';
import Todaypage from './Todaypage';
import Sidebar from './Sidebar';
import Completedpage from './Completedpage'
import Upcomingpage from './Upcomingpage';
import Categoriespage from './Categoriespage'
import { isAfter, endOfToday, isBefore, startOfToday } from 'date-fns';
import Duepage from './Duepage';
import axiosInstance from '../helpers/useAxiosPrivate';

const Homepane = () => {

  const [activeSection, setActiveSection] = useState('Today');

  const fetchCategoriesURL = "http://localhost:50/api/Todos/categories";
  const [Categories, setCategories] = useState([]);
  const fetchCategories = async () => {
    try {
      const result = await fetch(fetchCategoriesURL);
      const data = await result.json();
      console.log('Fetched Categories:', data.data);
      setCategories(data.data);
    } catch (error) {
      setError('Error fetching categories:', error.message);
    }
  };
  
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchAllTasksURL = "http://localhost:50/api/Todos";
  const [allTasks, setallTasks] = useState([]);
  const [completedlength, setcompletedlength] = useState([]);
  const [upcominglength, setupcominglength] = useState([]);
  const [duelength, setduelength] = useState([]);

  const fetchAllTasks = async () => {
    try {
      const result = await fetch(fetchAllTasksURL);
      const data = await result.json();
      console.log('Fetched Tasks:', data.data);
      setallTasks(data.data);

      const length = data.data.filter(x => x.isCompleted === true)
      const upcoming = data.data.filter(x => isAfter(new Date(x.dueDate), endOfToday()));
      const now = new Date();
      const due = data.data.filter(x => (isBefore(new Date(x.dueDate), now) && x.isCompleted !== true));
      setcompletedlength(length);
      setupcominglength(upcoming);
      setduelength(due);

      console.log("Due", due.length)
    } catch (e) {
      console.error('Error fetching tasks:', e.message);
    }
  };

  useEffect(() => {
    fetchAllTasks();
  }, []);

  const fetchTodayTasksURL = "http://localhost:50/api/Todos/todayTasks"
  const [Tasks, setTasks] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [Error, setError] = useState(null)

  const fetchTasks = async () => {
    setisLoading(true);
    try {
      const result = await fetch(fetchTodayTasksURL);
      const data = await result.json();
      console.log('Today Tasks:', data.data);
      setTasks(data.data);

    } catch (e) {
      console.error('Error fetching tasks:')
      setError('Error fetching tasks:');
    }
    finally {
      setisLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskDeleted = (deletedTaskId) => {
    setTasks(Tasks.filter(task => task.taskId !== deletedTaskId));
  };

  const [TaskMenu, setTaskMenu] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleTaskClick = (taskId) => {
    let taskObj = null;
    if (activeSection === 'Today') {
      taskObj = Tasks.find(task => task.taskId === taskId);
    } else if (activeSection === 'Upcoming') {
      taskObj = upcomingTasks.find(task => task.taskId === taskId);
    } else if (activeSection === 'Completed') {
      taskObj = completedTasks.find(task => task.taskId === taskId);
    } else if (activeSection === 'Due') {
      taskObj = dueTasks.find(task => task.taskId === taskId);
    } else if (Categories.filter(category => activeSection === category.categoryName)) {
      taskObj = CategoryTasks.find(task => task.taskId === taskId)
    }
    setSelectedTask(taskObj);
    setTaskMenu(true);
  };

  const handleCategoryTaskClick = (taskObj) => {
    setSelectedTask(taskObj);
    setTaskMenu(true);
  };

  const handleRefetch = () => {
    if (activeSection === 'Today') {
      fetchTasks();
    } else if (activeSection === 'Upcoming') {
      FetchUpcomingTasks();
    } else if (activeSection === 'Completed') {
      fetchCompletedTasks();
    } else if (activeSection === 'Due') {
      fetchDueTasks();
    }
  }


  const fetchCompletedTasksURL = 'http://localhost:50/api/Todos/getCompletedTasks'
  const [completedTasks, setcompletedTasks] = useState([]);
  const [fetcherror, setfetcherror] = useState(null);
  const [fetchLoader, setfetchloader] = useState(false);
  const fetchCompletedTasks = async () => {
    try {
      setfetchloader(true);
      const response = await axiosInstance.get('/api/Todos/getCompletedTasks', 
        // {
        //    method: 'GET',
        //    headers: {
        //     'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjUwIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvZW1haWxhZGRyZXNzIjoiYWRlZmFsdWRhcG9AZ21haWwuY29tIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6IiAiLCJqdGkiOiIwZWI1NTZhMC0wYzlkLTRhN2UtOTE2Zi1lZWJhOTg0MjY0M2QiLCJleHAiOjE3NTc5MzY5Nzh9.2W3qcz6IsDU8Qt6RqY5B7guXnY3fkgS5iBsr7RP-bw4`,
        //     'Content-type' : 'application/json'
        //    }
           
        // }
      );
      const data = await response.json();
      console.log('Completed Tasks', data.data)
      setcompletedTasks(data.data)
    }
    catch (e) {
      setfetcherror('Error fetching completed tasks:');
    }
    finally {
      setfetchloader(false);
    }
  }

  const fetchUpcomingTasksURL = 'http://localhost:50/api/Todos/upcomingTasks'
  const [upcomingTasks, setupcomingTasks] = useState([]);
  const [upcomingError, setupcomingError] = useState(null);
  const [upcomingLoader, setupcomingLoader] = useState(false);
  const FetchUpcomingTasks = async () => {
    try {
      setfetchloader(true);
      const response = await fetch(`${fetchUpcomingTasksURL}`);
      const data = await response.json();
      console.log('UpcomingTasks', data.data)
      setupcomingTasks(data.data)
    }
    catch (e) {
      setupcomingError('Error fetching upcoming tasks:');
    }
    finally {
      setupcomingLoader(false);
    }
  }

  const fetchDueTasksURL = 'http://localhost:50/api/Todos/DueTasks'
  const [dueTasks, setdueTasks] = useState([]);
  const [dueError, setdueError] = useState(null);
  const [dueLoader, setdueLoader] = useState(false);
  const fetchDueTasks = async () => {
    try {
      setfetchloader(true);
      const response = await fetch(`${fetchDueTasksURL}`);
      const data = await response.json();
      console.log('Due Tasks:', data.data)
      setdueTasks(data.data)
    }
    catch (e) {
      setdueError('Error fetching Due tasks:');
    }
    finally {
      setdueLoader(false);
    }
  }
  const getCategoryURL = "http://localhost:50/api/Todos/getcategory";
  const [CategoryTasks, setCategoryTasks] = useState([]);
  const [CisLoading, setCisLoading] = useState(false);
  const [CError, setCError] = useState(null)
  const [taskCounts, setTaskCounts] = useState({});
  const fetchCategoryTasks = async (categoryId) => {
    setCisLoading(true);
    try {
      const result = await fetch(`${getCategoryURL}/${categoryId}`)
      const data = await result.json();
      if (result.ok) {
        console.log("Category Tasks:", data.data)
        setCategoryTasks(data.data);

        setTaskCounts(prevCounts => ({
          ...prevCounts,
          [categoryId]: data.data.length
        }));
      }
    }
    catch {
      console.error("Error Fetching");
      setCError('Error fetching tasks:');
    }
    finally {
      setCisLoading(false);
    }
  }

  const [menuOpen, setmenuOpen] = useState(true);
  const toggleMenu = () => {
    setmenuOpen(!menuOpen)
  }


  return (
    <div className="flex h-screen bg-gray-50">
      < Sidebar menuopen={menuOpen}
        togglemenu={toggleMenu}
        activesection={activeSection}
        setactivesection={setActiveSection}
        categories={Categories}
        error={Error}
        TodayTask={Tasks}
        fetchTodayTasks={fetchTasks}
        fetchcompletedtasks={fetchCompletedTasks}
        completedtasks={completedlength}
        fetchupcomingtasks={FetchUpcomingTasks}
        upcomingtasks={upcominglength}
        DueTasks={duelength}
        fetchduetasks={fetchDueTasks}
        closMenu={() => setTaskMenu(null)}
        closesidebar={() => setmenuOpen(false)}
        categoriesLength={taskCounts} 
        fetchCategories={fetchCategories}/>

      {!menuOpen && (
        <div className="m-2 p-2 sm:m-3 sm:p-3 md:m-3 md:p-3 cursor-pointer opacity-70 transition-opacity duration-300 ease-in-out hover:opacity-100" >
          <FiMenu onClick={toggleMenu} className="w-6 h-6 sm:w-6 sm:h-6 md:w-7 md:h-7" />
        </div>
      )}

      {activeSection === 'Today' && (
        <Todaypage open={handleTaskClick} activesection={activeSection} TASK={Tasks} loader={isLoading} error={Error} fetchtasks={fetchTasks} fetchlength={fetchAllTasks} />
      )}
      {/* Mobile View */}
      {activeSection === "Today" && (
        <div className={`fixed inset-0 z-50 bg-black/30 transition-opacity lg:hidden ${TaskMenu ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setTaskMenu(null)}>
          <div className={`absolute right-0 top-0 h-full w-full max-w-[90%] bg-[#f4f4f4] shadow-xl transform transition-transform duration-300 ${TaskMenu ? "translate-x-0" : "translate-x-full"}`} onClick={(e) => e.stopPropagation()}>
            {TaskMenu && selectedTask && (
              <Taskmenu onclose={() => setTaskMenu(null)} taskdetails={selectedTask} onTaskdeleted={handleTaskDeleted} menuopen={menuOpen} refetch={handleRefetch} fetchlength={fetchAllTasks} />
            )}
          </div>
        </div>
      )}
      {activeSection === 'Today' && (
        <div className={`m-3 w-[70%] lg:w-[40%] xl:w-[27%] rounded-lg flex-col overflow-hidden bg-[#f4f4f4] h-[calc(100vh-2rem)] ${TaskMenu ? "block" : "hidden"}`}>
          {TaskMenu && selectedTask && (
            <Taskmenu onclose={() => setTaskMenu(null)} taskdetails={selectedTask} onTaskdeleted={handleTaskDeleted} menuopen={menuOpen} refetch={handleRefetch} fetchlength={fetchAllTasks} />
          )}
        </div>
      )}

      {activeSection === "Upcoming" && (
        <Upcomingpage open={handleTaskClick} activesection={activeSection} TASK={upcomingTasks} loader={upcomingLoader} error={upcomingError} fetchtasks={FetchUpcomingTasks} fetchlength={fetchAllTasks} />
      )}
      {/* Mobile View */}
      {activeSection === "Upcoming" && (
        <div className={`fixed inset-0 z-50 bg-black/30 transition-opacity sm:hidden ${TaskMenu ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setTaskMenu(null)}>
          <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-[#f4f4f4] shadow-xl transform transition-transform duration-300 ${TaskMenu ? "translate-x-0" : "translate-x-full"}`} onClick={(e) => e.stopPropagation()}>
            {TaskMenu && selectedTask && (
              <Taskmenu onclose={() => setTaskMenu(null)} taskdetails={selectedTask} onTaskdeleted={handleTaskDeleted} menuopen={menuOpen} refetch={handleRefetch} fetchlength={fetchAllTasks} />
            )}
          </div>
        </div>
      )}
      {/* Desktop View */}
      {activeSection === "Upcoming" && (
        <div className={`m-3 w-[70%] lg:w-[40%] xl:w-[27%] rounded-lg flex-col overflow-hidden bg-[#f4f4f4] h-[calc(100vh-2rem)] ${TaskMenu ? "block" : "hidden"}`}>
          {TaskMenu && selectedTask && (
            <Taskmenu onclose={() => setTaskMenu(null)} taskdetails={selectedTask} onTaskdeleted={handleTaskDeleted} menuopen={menuOpen} refetch={handleRefetch} fetchlength={fetchAllTasks} />
          )}
        </div>
      )}
      {activeSection === 'Completed' && (
        <Completedpage completedtasks={completedTasks} activesection={activeSection} isloading={fetchLoader} error={fetcherror} open={handleTaskClick} fetchcompletedtasks={fetchCompletedTasks} fetchlength={fetchAllTasks} />
      )}
      {/* Mobile View */}
      {activeSection === "Completed" && (
        <div className={`fixed inset-0 z-50 bg-black/30 transition-opacity sm:hidden ${TaskMenu ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setTaskMenu(null)}>
          <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-[#f4f4f4] shadow-xl transform transition-transform duration-300 ${TaskMenu ? "translate-x-0" : "translate-x-full"}`} onClick={(e) => e.stopPropagation()}>
            {TaskMenu && selectedTask && (
              <Taskmenu onclose={() => setTaskMenu(null)} taskdetails={selectedTask} onTaskdeleted={handleTaskDeleted} menuopen={menuOpen} refetch={handleRefetch} fetchlength={fetchAllTasks} />
            )}
          </div>
        </div>
      )}
      {activeSection === 'Completed' && (
        <div className={`m-3 w-[70%] lg:w-[40%] xl:w-[27%] rounded-lg flex-col overflow-hidden bg-[#f4f4f4] h-[calc(100vh-2rem)] ${TaskMenu ? "block" : "hidden"}`}>
          {TaskMenu && selectedTask && (
            <Taskmenu onclose={() => setTaskMenu(null)} taskdetails={selectedTask} onTaskdeleted={handleTaskDeleted} menuopen={menuOpen} refetch={handleRefetch} fetchlength={fetchAllTasks} />
          )}
        </div>
      )}

      {activeSection === 'Due' && (
        <Duepage duetasks={dueTasks} activesection={activeSection} isloading={dueLoader} error={dueError} open={handleTaskClick} fetchduetasks={fetchDueTasks} fetchlength={fetchAllTasks}/>
      )}
      {/* Mobile View */}
      {activeSection === "Due" && (
        <div className={`fixed inset-0 z-50 bg-black/30 transition-opacity sm:hidden ${TaskMenu ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setTaskMenu(null)}>
          <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-[#f4f4f4] shadow-xl transform transition-transform duration-300 ${TaskMenu ? "translate-x-0" : "translate-x-full"}`} onClick={(e) => e.stopPropagation()}>
            {TaskMenu && selectedTask && (
              <Taskmenu onclose={() => setTaskMenu(null)} taskdetails={selectedTask} onTaskdeleted={handleTaskDeleted} menuopen={menuOpen} refetch={handleRefetch} fetchlength={fetchAllTasks} />
            )}
          </div>
        </div>
      )}
      {activeSection === 'Due' && (
        <div className={`m-3 w-[70%] lg:w-[40%] xl:w-[27%] rounded-lg flex-col overflow-hidden bg-[#f4f4f4] h-[calc(100vh-2rem)] ${TaskMenu ? "block" : "hidden"}`}>
          {TaskMenu && selectedTask && (
            <Taskmenu onclose={() => setTaskMenu(null)} taskdetails={selectedTask} onTaskdeleted={handleTaskDeleted} menuopen={menuOpen} refetch={handleRefetch} fetchlength={fetchAllTasks} />
          )}
        </div>
      )}

      {Categories.filter(category => activeSection === category.categoryName).map(category => (
        <Categoriespage key={category.categoryId} categoryId={category.categoryId} open={handleTaskClick} activesection={activeSection} fetchCategoryTasks={fetchCategoryTasks} isLoading={CisLoading} Error={CError} Tasks={CategoryTasks} />
      ))}

      {Categories.filter(category => activeSection === category.categoryName).map(category => (
        <div key={category.categoryId} className={`fixed inset-0 z-50 bg-black/30 transition-opacity sm:hidden ${TaskMenu ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setTaskMenu(null)}>
          <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-[#f4f4f4] shadow-xl transform transition-transform duration-300 ${TaskMenu ? "translate-x-0" : "translate-x-full"}`} onClick={(e) => e.stopPropagation()}>
            {TaskMenu && selectedTask && (
              <Taskmenu onclose={() => setTaskMenu(null)} taskdetails={selectedTask} onTaskdeleted={handleTaskDeleted} menuopen={menuOpen} refetch={handleRefetch} fetchlength={fetchAllTasks} />
            )}
          </div>
        </div>
      ))
      }

      {Categories.filter(category => activeSection === category.categoryName).map(category => (
        <div key={category.categoryId} className={`m-3 w-[70%] lg:w-[40%] xl:w-[27%] rounded-lg flex-col overflow-hidden bg-[#f4f4f4] h-[calc(100vh-2rem)] ${TaskMenu ? "block" : "hidden"}`}>
          {TaskMenu && selectedTask && (
            <Taskmenu onclose={() => setTaskMenu(null)} taskdetails={selectedTask} onTaskdeleted={handleTaskDeleted} menuopen={menuOpen} refetch={handleRefetch} fetchlength={fetchAllTasks} />
          )}
        </div>
      ))
      }

    </div>
  );
};

export default Homepane