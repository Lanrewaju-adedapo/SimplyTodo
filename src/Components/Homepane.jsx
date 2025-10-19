import React, { useEffect, useState } from "react";
import { FiMenu } from "react-icons/fi";
import Taskmenu from "./TaskMenu";
import Todaypage from "./Todaypage";
import Sidebar from "./Sidebar";
import Completedpage from "./Completedpage";
import Upcomingpage from "./Upcomingpage";
import Categoriespage from "./Categoriespage";
import { isAfter, endOfToday, isBefore, startOfToday } from "date-fns";
import Duepage from "./Duepage";
import axiosInstance from "../helpers/useAxiosPrivate";
import { ToastContainer, Slide, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showCustomToast } from "../helpers/ToastContext";

const Homepane = () => {
  const [activeSection, setActiveSection] = useState("Today");

  const [Categories, setCategories] = useState([]);
  const fetchCategories = async () => {
    try {
      const result = await axiosInstance.get("/api/Todos/categories");
      console.log("Fetched Categories:", result.data.data);
      setCategories(result.data.data);
    } catch (error) {
      setError("Error fetching categories:", error.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const [allTasks, setallTasks] = useState([]);
  const [completedlength, setcompletedlength] = useState([]);
  const [upcominglength, setupcominglength] = useState([]);
  const [duelength, setduelength] = useState([]);

  const fetchAllTasks = async () => {
    try {
      const result = await axiosInstance.get("/api/Todos");
      const data = result.data;
      console.log("Fetched Tasks:", data.data);
      setallTasks(data.data);

      const length = data.data.filter((x) => x.isCompleted === true);
      const upcoming = data.data.filter((x) =>
        isAfter(new Date(x.dueDate), endOfToday())
      );
      const now = new Date();
      const due = data.data.filter(
        (x) => isBefore(new Date(x.dueDate), now) && x.isCompleted !== true
      );
      setcompletedlength(length);
      setupcominglength(upcoming);
      setduelength(due);

      console.log("Due", due.length);
    } catch (e) {
      console.error("Error fetching tasks:", e.message);
    }
  };

  useEffect(() => {
    fetchAllTasks();
  }, []);

  const [Tasks, setTasks] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [Error, setError] = useState(null);

  const fetchTasks = async () => {
    setisLoading(true);
    try {
      const result = await axiosInstance.get("/api/Todos/todayTasks");
      console.log("Today Tasks:", result.data.data);
      setTasks(result.data.data);
    } catch (e) {
      console.error("Error fetching tasks:");
      setError("Error fetching tasks:");
    } finally {
      setisLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskDeleted = (deletedTaskId) => {
    setTasks(Tasks.filter((task) => task.taskId !== deletedTaskId));
  };

  const [TaskMenu, setTaskMenu] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleTaskClick = (taskId) => {
    let taskObj = null;
    if (activeSection === "Today") {
      taskObj = Tasks.find((task) => task.taskId === taskId);
    } else if (activeSection === "Upcoming") {
      taskObj = upcomingTasks.find((task) => task.taskId === taskId);
    } else if (activeSection === "Completed") {
      taskObj = completedTasks.find((task) => task.taskId === taskId);
    } else if (activeSection === "Due") {
      taskObj = dueTasks.find((task) => task.taskId === taskId);
    } else if (
      Categories.filter((category) => activeSection === category.categoryName)
    ) {
      taskObj = CategoryTasks.find((task) => task.taskId === taskId);
    }
    setSelectedTask(taskObj);
    setTaskMenu(true);
  };

  const handleCategoryTaskClick = (taskObj) => {
    setSelectedTask(taskObj);
    setTaskMenu(true);
  };

  const handleRefetch = () => {
    if (activeSection === "Today") {
      fetchTasks();
    } else if (activeSection === "Upcoming") {
      FetchUpcomingTasks();
    } else if (activeSection === "Completed") {
      fetchCompletedTasks();
    } else if (activeSection === "Due") {
      fetchDueTasks();
    }
  };

  const [completedTasks, setcompletedTasks] = useState([]);
  const [fetcherror, setfetcherror] = useState(null);
  const [fetchLoader, setfetchloader] = useState(false);
  const fetchCompletedTasks = async () => {
    try {
      setfetchloader(true);
      const response = await axiosInstance.get("/api/Todos/getCompletedTasks/");
      // const data = await response.json();
      console.log("Completed Tasks", response.data.data);
      setcompletedTasks(response.data.data);
    } catch (e) {
      setfetcherror("Error fetching completed tasks:");
    } finally {
      setfetchloader(false);
    }
  };

  const [upcomingTasks, setupcomingTasks] = useState([]);
  const [upcomingError, setupcomingError] = useState(null);
  const [upcomingLoader, setupcomingLoader] = useState(false);
  const FetchUpcomingTasks = async () => {
    try {
      setupcomingLoader(true);
      const response = await axiosInstance.get("/api/Todos/upcomingTasks");
      setupcomingTasks(response.data.data);
    } catch (e) {
      setupcomingError("Error fetching upcoming tasks:");
    } finally {
      setupcomingLoader(false);
    }
  };

  const [dueTasks, setdueTasks] = useState([]);
  const [dueError, setdueError] = useState(null);
  const [dueLoader, setdueLoader] = useState(false);
  const fetchDueTasks = async () => {
    try {
      setfetchloader(true);
      const response = await axiosInstance.get("/api/Todos/DueTasks/");
      console.log("Due Tasks:", response.data.data);
      setdueTasks(response.data.data);
    } catch (e) {
      setdueError("Error fetching Due tasks:");
    } finally {
      setdueLoader(false);
    }
  };

  const [CategoryTasks, setCategoryTasks] = useState([]);
  const [CisLoading, setCisLoading] = useState(false);
  const [CError, setCError] = useState(null);
  const [taskCounts, setTaskCounts] = useState({});
  const fetchCategoryTasks = async (categoryId) => {
    setCisLoading(true);
    setCError(null);

    try {
      const result = await axiosInstance.get(
        `/api/Todos/getcategory/${categoryId}`
      );

      if (result.status === 200 && result.data) {
        console.log("Category Tasks:", result.data.data);
        setCategoryTasks(result.data.data);

        setTaskCounts((prevCounts) => ({
          ...prevCounts,
          [categoryId]: result.data.data.length,
        }));
      }
    } catch (error) {
      console.error("Error Fetching:", error);
      setCError(error.response?.data?.message || "Error fetching tasks");
    } finally {
      setCisLoading(false);
    }
  };

  const [menuOpen, setmenuOpen] = useState(true);
  const toggleMenu = () => {
    setmenuOpen(!menuOpen);
  };

  return (
    <div className="flex relative h-screen bg-gray-50">
      <ToastContainer
        style={{
          "--toastify-color-progress-light":
            "linear-gradient(to right, #90d4f7, #63b3ed)",
          "--toastify-color-progress-dark":
            "linear-gradient(to right, #90d4f7, #63b3ed)",
          "--toastify-toast-min-height": "80px",
        }}
        progressStyle={{
          background: "var(--toastify-color-progress-light)",
          height: "3px",
        }}
        transition={Zoom}
        toastClassName={() => "!min-w-full !max-w-full !w-full !p-0"}
        bodyClassName={() => "!p-0 !m-0 !w-full !h-full"}
        className="!w-auto !max-w-[500px]"
        pauseOnFocusLoss={false}
        closeButton={false}
      />
      <Sidebar
        menuopen={menuOpen}
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
        fetchCategories={fetchCategories}
      />

      {!menuOpen && (
        <div className="m-2 p-2 sm:m-3 sm:p-3 md:m-3 md:p-3 cursor-pointer opacity-70 transition-opacity duration-300 ease-in-out hover:opacity-100">
          <FiMenu
            onClick={toggleMenu}
            className="w-6 h-6 sm:w-6 sm:h-6 md:w-7 md:h-7"
          />
        </div>
      )}

      {activeSection === "Today" && (
        <Todaypage
          open={handleTaskClick}
          activesection={activeSection}
          TASK={Tasks}
          loader={isLoading}
          error={Error}
          fetchtasks={fetchTasks}
          fetchlength={fetchAllTasks}
        />
      )}
      {/* Mobile View */}
      {activeSection === "Today" && (
        <div
          className={`fixed inset-0 z-50 bg-black/30 transition-opacity lg:hidden ${
            TaskMenu ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setTaskMenu(null)}
        >
          <div
            className={`absolute right-0 top-0 h-full w-full max-w-[90%] bg-[#f4f4f4] shadow-xl transform transition-transform duration-300 ${
              TaskMenu ? "translate-x-0" : "translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {TaskMenu && selectedTask && (
              <Taskmenu
                onclose={() => setTaskMenu(null)}
                taskdetails={selectedTask}
                onTaskdeleted={handleTaskDeleted}
                menuopen={menuOpen}
                refetch={handleRefetch}
                fetchlength={fetchAllTasks}
              />
            )}
          </div>
        </div>
      )}
      {activeSection === "Today" && (
        <div
          className={`m-3 w-[70%] lg:w-[40%] xl:w-[27%] rounded-lg flex-col overflow-hidden bg-[#f4f4f4] h-[calc(100vh-2rem)] ${
            TaskMenu ? "block" : "hidden"
          }`}
        >
          {TaskMenu && selectedTask && (
            <Taskmenu
              onclose={() => setTaskMenu(null)}
              taskdetails={selectedTask}
              onTaskdeleted={handleTaskDeleted}
              menuopen={menuOpen}
              refetch={handleRefetch}
              fetchlength={fetchAllTasks}
            />
          )}
        </div>
      )}

      {activeSection === "Upcoming" && (
        <Upcomingpage
          open={handleTaskClick}
          activesection={activeSection}
          TASK={upcomingTasks}
          loader={upcomingLoader}
          error={upcomingError}
          fetchtasks={FetchUpcomingTasks}
          fetchlength={fetchAllTasks}
        />
      )}
      {/* Mobile View */}
      {activeSection === "Upcoming" && (
        <div
          className={`fixed inset-0 z-50 bg-black/30 transition-opacity sm:hidden ${
            TaskMenu ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setTaskMenu(null)}
        >
          <div
            className={`absolute right-0 top-0 h-full w-full max-w-md bg-[#f4f4f4] shadow-xl transform transition-transform duration-300 ${
              TaskMenu ? "translate-x-0" : "translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {TaskMenu && selectedTask && (
              <Taskmenu
                onclose={() => setTaskMenu(null)}
                taskdetails={selectedTask}
                onTaskdeleted={handleTaskDeleted}
                menuopen={menuOpen}
                refetch={handleRefetch}
                fetchlength={fetchAllTasks}
              />
            )}
          </div>
        </div>
      )}
      {/* Desktop View */}
      {activeSection === "Upcoming" && (
        <div
          className={`m-3 w-[70%] lg:w-[40%] xl:w-[27%] rounded-lg flex-col overflow-hidden bg-[#f4f4f4] h-[calc(100vh-2rem)] ${
            TaskMenu ? "block" : "hidden"
          }`}
        >
          {TaskMenu && selectedTask && (
            <Taskmenu
              onclose={() => setTaskMenu(null)}
              taskdetails={selectedTask}
              onTaskdeleted={handleTaskDeleted}
              menuopen={menuOpen}
              refetch={handleRefetch}
              fetchlength={fetchAllTasks}
            />
          )}
        </div>
      )}
      {activeSection === "Completed" && (
        <Completedpage
          completedtasks={completedTasks}
          activesection={activeSection}
          isloading={fetchLoader}
          error={fetcherror}
          open={handleTaskClick}
          fetchcompletedtasks={fetchCompletedTasks}
          fetchlength={fetchAllTasks}
        />
      )}
      {/* Mobile View */}
      {activeSection === "Completed" && (
        <div
          className={`fixed inset-0 z-50 bg-black/30 transition-opacity sm:hidden ${
            TaskMenu ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setTaskMenu(null)}
        >
          <div
            className={`absolute right-0 top-0 h-full w-full max-w-md bg-[#f4f4f4] shadow-xl transform transition-transform duration-300 ${
              TaskMenu ? "translate-x-0" : "translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {TaskMenu && selectedTask && (
              <Taskmenu
                onclose={() => setTaskMenu(null)}
                taskdetails={selectedTask}
                onTaskdeleted={handleTaskDeleted}
                menuopen={menuOpen}
                refetch={handleRefetch}
                fetchlength={fetchAllTasks}
              />
            )}
          </div>
        </div>
      )}
      {activeSection === "Completed" && (
        <div
          className={`m-3 w-[70%] lg:w-[40%] xl:w-[27%] rounded-lg flex-col overflow-hidden bg-[#f4f4f4] h-[calc(100vh-2rem)] ${
            TaskMenu ? "block" : "hidden"
          }`}
        >
          {TaskMenu && selectedTask && (
            <Taskmenu
              onclose={() => setTaskMenu(null)}
              taskdetails={selectedTask}
              onTaskdeleted={handleTaskDeleted}
              menuopen={menuOpen}
              refetch={handleRefetch}
              fetchlength={fetchAllTasks}
            />
          )}
        </div>
      )}

      {activeSection === "Due" && (
        <Duepage
          duetasks={dueTasks}
          activesection={activeSection}
          isloading={dueLoader}
          error={dueError}
          open={handleTaskClick}
          fetchduetasks={fetchDueTasks}
          fetchlength={fetchAllTasks}
        />
      )}
      {/* Mobile View */}
      {activeSection === "Due" && (
        <div
          className={`fixed inset-0 z-50 bg-black/30 transition-opacity sm:hidden ${
            TaskMenu ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setTaskMenu(null)}
        >
          <div
            className={`absolute right-0 top-0 h-full w-full max-w-md bg-[#f4f4f4] shadow-xl transform transition-transform duration-300 ${
              TaskMenu ? "translate-x-0" : "translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {TaskMenu && selectedTask && (
              <Taskmenu
                onclose={() => setTaskMenu(null)}
                taskdetails={selectedTask}
                onTaskdeleted={handleTaskDeleted}
                menuopen={menuOpen}
                refetch={handleRefetch}
                fetchlength={fetchAllTasks}
              />
            )}
          </div>
        </div>
      )}
      {activeSection === "Due" && (
        <div
          className={`m-3 w-[70%] lg:w-[40%] xl:w-[27%] rounded-lg flex-col overflow-hidden bg-[#f4f4f4] h-[calc(100vh-2rem)] ${
            TaskMenu ? "block" : "hidden"
          }`}
        >
          {TaskMenu && selectedTask && (
            <Taskmenu
              onclose={() => setTaskMenu(null)}
              taskdetails={selectedTask}
              onTaskdeleted={handleTaskDeleted}
              menuopen={menuOpen}
              refetch={handleRefetch}
              fetchlength={fetchAllTasks}
            />
          )}
        </div>
      )}

      {Categories.filter(
        (category) => activeSection === category.categoryName
      ).map((category) => (
        <Categoriespage
          key={category.categoryId}
          categoryId={category.categoryId}
          open={handleTaskClick}
          activesection={activeSection}
          fetchCategoryTasks={fetchCategoryTasks}
          isLoading={CisLoading}
          Error={CError}
          Tasks={CategoryTasks}
        />
      ))}

      {Categories.filter(
        (category) => activeSection === category.categoryName
      ).map((category) => (
        <div
          key={category.categoryId}
          className={`fixed inset-0 z-50 bg-black/30 transition-opacity sm:hidden ${
            TaskMenu ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setTaskMenu(null)}
        >
          <div
            className={`absolute right-0 top-0 h-full w-full max-w-md bg-[#f4f4f4] shadow-xl transform transition-transform duration-300 ${
              TaskMenu ? "translate-x-0" : "translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {TaskMenu && selectedTask && (
              <Taskmenu
                onclose={() => setTaskMenu(null)}
                taskdetails={selectedTask}
                onTaskdeleted={handleTaskDeleted}
                menuopen={menuOpen}
                refetch={handleRefetch}
                fetchlength={fetchAllTasks}
              />
            )}
          </div>
        </div>
      ))}

      {Categories.filter(
        (category) => activeSection === category.categoryName
      ).map((category) => (
        <div
          key={category.categoryId}
          className={`m-3 w-[70%] lg:w-[40%] xl:w-[27%] rounded-lg flex-col overflow-hidden bg-[#f4f4f4] h-[calc(100vh-2rem)] ${
            TaskMenu ? "block" : "hidden"
          }`}
        >
          {TaskMenu && selectedTask && (
            <Taskmenu
              onclose={() => setTaskMenu(null)}
              taskdetails={selectedTask}
              onTaskdeleted={handleTaskDeleted}
              menuopen={menuOpen}
              refetch={handleRefetch}
              fetchlength={fetchAllTasks}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default Homepane;
