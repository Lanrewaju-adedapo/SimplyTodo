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
  const fetchCategories = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cachedData = localStorage.getItem("Categories");
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setCategories(parsedData);
        return;
      }
    }
    try {
      const result = await axiosInstance.get("/api/Todos/categories");

      // Validate response structure
      if (result && result.data && result.data.data !== undefined) {
        console.log("Fetched Categories:", result.data.data);
        setCategories(result.data.data);
        localStorage.setItem("Categories", JSON.stringify(result.data.data));

        // Optional: Show success toast if needed
        // showCustomToast("Success", "Categories loaded successfully");
      } else {
        console.warn("Unexpected response structure:", result);
        showCustomToast("Failed", "Invalid response format from server");
        setCategories([]); // Set empty array as fallback
      }
    } catch (error) {
      console.error("Error fetching categories:", error);

      let errorMessage = "Error fetching categories";
      let errorStatus = "Failed";

      if (error.response) {
        const status = error.response.status;
        const message =
          error.response.data?.message || error.response.statusText;

        // errorStatus = status.toString();
        errorMessage = message || `Server error: ${status}`;

        // Handle specific status codes
        if (status === 401) {
          errorMessage = "Please log in to view categories";
        } else if (status === 403) {
          errorMessage = "You don't have permission to view categories";
        } else if (status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message || "Unknown error occurred";
      }

      showCustomToast(errorStatus, errorMessage);
      setCategories([]); // Set empty array on error
      setError(errorMessage);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const [allTasks, setallTasks] = useState([]);
  const [completedlength, setcompletedlength] = useState([]);
  const [upcominglength, setupcominglength] = useState([]);
  const [duelength, setduelength] = useState([]);

  const fetchAllTasks = async (forceRefresh = false) => {
    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      const cachedData = getCachedTasks();
      if (cachedData) {
        console.log("Using cached tasks data");
        setallTasks(cachedData);
        updateTaskLengths(cachedData);
        return;
      }
    }

    try {
      const result = await axiosInstance.get("/api/Todos");

      // Validate response structure
      if (result?.data?.data !== undefined) {
        const tasksData = Array.isArray(result.data.data)
          ? result.data.data
          : [];
        console.log("Fetched Tasks:", tasksData);

        setallTasks(tasksData);

        // Cache the data with timestamp
        setCachedTasks(tasksData);

        updateTaskLengths(tasksData);

        // Optional: Show success toast
        // showCustomToast("Success", "Tasks loaded successfully");
      } else {
        console.warn("Unexpected response structure:", result);
        showCustomToast("Failed", "Invalid response format from server");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);

      let errorMessage = "Error fetching tasks";
      let errorStatus = "Failed";

      if (error.response) {
        const status = error.response.status;
        const message =
          error.response.data?.message || error.response.statusText;

        errorStatus = status.toString();
        errorMessage = message || `Server error: ${status}`;

        if (status === 401) {
          errorMessage = "Please log in to view tasks";
        } else if (status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message || "Unknown error occurred";
      }

      showCustomToast(errorStatus, errorMessage);

      // Try to use expired cache as fallback
      const expiredCache = getCachedTasks(true);
      if (expiredCache) {
        setallTasks(expiredCache);
        updateTaskLengths(expiredCache);
        showCustomToast("Warning", "Using cached data - connection issue");
      }
    }
  };

  // Cache helper functions
  const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for tasks data

  const getCachedTasks = (allowExpired = false) => {
    try {
      const cached = localStorage.getItem("allTasks");
      if (!cached) return null;

      const cacheData = JSON.parse(cached);

      // Check if cache is still valid
      const isExpired = Date.now() - cacheData.timestamp > CACHE_DURATION;
      if (isExpired && !allowExpired) {
        localStorage.removeItem("allTasks"); // Clean up expired cache
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error("Error reading from cache:", error);
      return null;
    }
  };

  const setCachedTasks = (data) => {
    try {
      const cacheData = {
        data: data,
        timestamp: Date.now(),
      };
      localStorage.setItem("allTasks", JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error saving to cache:", error);
    }
  };

  const clearTasksCache = () => {
    try {
      localStorage.removeItem("allTasks");
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  };

  // Helper function to update all task lengths
  const updateTaskLengths = (tasksData) => {
    if (!Array.isArray(tasksData)) {
      tasksData = [];
    }

    const completedTasks = tasksData.filter((x) => x.isCompleted === true);
    const upcomingTasks = tasksData.filter((x) =>
      isAfter(new Date(x.dueDate), endOfToday())
    );
    const now = new Date();
    const dueTasks = tasksData.filter(
      (x) => isBefore(new Date(x.dueDate), now) && x.isCompleted !== true
    );

    setcompletedlength(completedTasks);
    setupcominglength(upcomingTasks);
    setduelength(dueTasks);

    console.log("Completed:", completedTasks.length);
    console.log("Upcoming:", upcomingTasks.length);
    console.log("Due:", dueTasks.length);
  };

  useEffect(() => {
    fetchAllTasks();
  }, []);

  // Tasks for the today component
  const [Tasks, setTasks] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [Error, setError] = useState(null);

  const fetchTasks = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cachedData = localStorage.getItem("TodayTasks");
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setTasks(parsedData);
        return;
      }
    }
    setisLoading(true);
    try {
      const result = await axiosInstance.get("/api/Todos/todayTasks");

      // Validate response structure
      if (result && result.data && result.data.data !== undefined) {
        console.log("Today Tasks:", result.data.data);
        setTasks(result.data.data);
        localStorage.setItem("TodayTasks", JSON.stringify(result.data.data));

        // Show success toast if needed
        // showCustomToast("Success", "Tasks fetched successfully");
      } else {
        console.warn("Unexpected response structure:", result);
        showCustomToast("Failed", "Invalid response format from server");
        setTasks([]); // Set empty array as fallback
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);

      // Handle different error scenarios
      let errorMessage = "Error fetching tasks";
      let errorStatus = "Failed";

      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message =
          error.response.data?.message || error.response.statusText;

        // errorStatus = status.toString();
        errorMessage = message || `Server error: ${status}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "No response from server. Please check your connection.";
      } else {
        // Something else happened
        errorMessage = error.message || "Unknown error occurred";
      }

      showCustomToast(errorStatus, errorMessage);
      setTasks([]); // Set empty array to prevent crashes
      setError(errorMessage);
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

  // Tasks for the Completed Component
  const [completedTasks, setcompletedTasks] = useState([]);
  const [fetcherror, setfetcherror] = useState(null);
  const [fetchLoader, setfetchloader] = useState(false);
  const fetchCompletedTasks = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cachedData = localStorage.getItem("CompletedTasks");
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setdueTasks(parsedData);
        return;
      }
    }
    try {
      setfetchloader(true);
      const response = await axiosInstance.get("/api/Todos/getCompletedTasks/");

      // Validate response structure
      if (response && response.data && response.data.data !== undefined) {
        console.log("Completed Tasks", response.data.data);
        setcompletedTasks(response.data.data);
        localStorage.setItem(
          "CompletedTasks",
          JSON.stringify(response.data.data)
        );

        // Optional: Show success toast
        // showCustomToast("Success", "Completed tasks loaded successfully");
      } else {
        console.warn("Unexpected response structure:", response);
        showCustomToast("Failed", "Invalid response format from server");
        setcompletedTasks([]); // Set empty array as fallback
      }
    } catch (error) {
      console.error("Error fetching completed tasks:", error);

      // Handle different error scenarios
      let errorMessage = "Error fetching completed tasks";
      let errorStatus = "Failed";

      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message =
          error.response.data?.message || error.response.statusText;

        // errorStatus = status.toString();
        errorMessage = message || `Server error: ${status}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "No response from server. Please check your connection.";
      } else {
        // Something else happened
        errorMessage = error.message || "Unknown error occurred";
      }

      showCustomToast(errorStatus, errorMessage);
      setcompletedTasks([]); // Set empty array to prevent crashes
      setfetcherror(errorMessage);
    } finally {
      setfetchloader(false);
    }
  };

  // Tasks for the upcoming page component
  const [upcomingTasks, setupcomingTasks] = useState([]);
  const [upcomingError, setupcomingError] = useState(null);
  const [upcomingLoader, setupcomingLoader] = useState(false);
  const FetchUpcomingTasks = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cachedData = localStorage.getItem("upcomingTasks");
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setupcomingTasks(parsedData);
        return;
      }
    }
    try {
      setupcomingLoader(true);
      setupcomingError(""); // Clear previous errors

      const response = await axiosInstance.get("/api/Todos/upcomingTasks");

      // Enhanced response validation
      if (response?.data?.success === false) {
        // Handle API-level error (if your API returns success flag)
        const errorMsg =
          response.data.message || "Failed to fetch upcoming tasks";
        showCustomToast("Failed", errorMsg);
        setupcomingTasks([]);
        return;
      }

      if (response?.data?.data !== undefined) {
        console.log("Upcoming Tasks:", response.data.data);
        // Ensure we're setting an array, even if the response is malformed
        const tasks = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setupcomingTasks(tasks);
        localStorage.setItem("upcomingTasks", JSON.stringify(tasks));

        // Optional: Show toast if no upcoming tasks
        // if (tasks.length === 0) {
        //     showCustomToast("Success", "No upcoming tasks found");
        // }
      } else {
        console.warn("Unexpected response structure:", response);
        showCustomToast("Failed", "Invalid response format from server");
        setupcomingTasks([]);
      }
    } catch (error) {
      console.error("Error fetching upcoming tasks:", error);

      let errorMessage = "Error fetching upcoming tasks";
      let errorStatus = "Failed";

      if (error.code === "NETWORK_ERROR" || error.code === "ECONNABORTED") {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.response) {
        const status = error.response.status;
        const message =
          error.response.data?.message || error.response.statusText;

        // errorStatus = status.toString();
        errorMessage = message || `Server error: ${status}`;

        // Handle specific status codes
        if (status === 404) {
          errorMessage = "Upcoming tasks endpoint not found";
        } else if (status === 401) {
          errorMessage = "Please log in to view upcoming tasks";
        } else if (status >= 500) {
          errorMessage =
            "Server is currently unavailable. Please try again later.";
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message || "Unknown error occurred";
      }

      showCustomToast(errorStatus, errorMessage);
      setupcomingTasks([]);
      setupcomingError(errorMessage);
    } finally {
      setupcomingLoader(false);
    }
  };

  // Tasks for the due page component
  const [dueTasks, setdueTasks] = useState([]);
  const [dueError, setdueError] = useState(null);
  const [dueLoader, setdueLoader] = useState(false);
  const fetchDueTasks = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cachedData = localStorage.getItem("dueTasks");
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          setdueTasks(parsedData);
          return;
        }
      }

      setdueLoader(true);
      setdueError(""); // Clear previous errors

      const response = await axiosInstance.get("/api/Todos/DueTasks/");

      // Enhanced response validation
      if (response?.data?.success === false) {
        // Handle API-level error (if your API returns success flag)
        const errorMsg = response.data.message || "Failed to fetch due tasks";
        showCustomToast("Failed", errorMsg);
        setdueTasks([]);
        return;
      }

      if (response?.data?.data !== undefined) {
        console.log("Due Tasks:", response.data.data);
        // Ensure we're setting an array, even if the response is malformed
        const tasks = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setdueTasks(tasks);
        localStorage.setItem("dueTasks", JSON.stringify(tasks));

        // Optional: Show toast if no due tasks
        // if (tasks.length === 0) {
        //     showCustomToast("Success", "No due tasks found");
        // }
      } else {
        console.warn("Unexpected response structure:", response);
        showCustomToast("Failed", "Invalid response format from server");
        setdueTasks([]);
      }
    } catch (error) {
      console.error("Error fetching due tasks:", error);

      let errorMessage = "Error fetching due tasks";
      let errorStatus = "Failed";

      if (error.code === "NETWORK_ERROR" || error.code === "ECONNABORTED") {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.response) {
        const status = error.response.status;
        const message =
          error.response.data?.message || error.response.statusText;

        // errorStatus = status.toString();
        errorMessage = message || `Server error: ${status}`;

        // Handle specific status codes
        if (status === 404) {
          errorMessage = "Due tasks endpoint not found";
        } else if (status === 401) {
          errorMessage = "Please log in to view due tasks";
        } else if (status >= 500) {
          errorMessage =
            "Server is currently unavailable. Please try again later.";
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message || "Unknown error occurred";
      }

      showCustomToast(errorStatus, errorMessage);
      setdueTasks([]);
      setdueError(errorMessage);
    } finally {
      setdueLoader(false);
    }
  };

  // fetch tasks for the category page
  const [CategoryTasks, setCategoryTasks] = useState([]);
  const [CisLoading, setCisLoading] = useState(false);
  const [CError, setCError] = useState(null);
  const [taskCounts, setTaskCounts] = useState({});
  const fetchCategoryTasks = async (categoryId, forceRefresh = false) => {
    if (!forceRefresh) {
      const cachedData = localStorage.getItem(`category ${categoryId}`);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setCategoryTasks(parsedData);
        return;
      }
    }
    setCisLoading(true);
    setCError(null);

    try {
      const result = await axiosInstance.get(
        `/api/Todos/getcategory/${categoryId}`
      );

      // Validate response structure
      if (
        result.status === 200 &&
        result.data &&
        result.data.data !== undefined
      ) {
        console.log("Category Tasks:", result.data.data);
        setCategoryTasks(result.data.data);
        localStorage.setItem(
          `category ${categoryId}`,
          JSON.stringify(result.data.data)
        );

        setTaskCounts((prevCounts) => ({
          ...prevCounts,
          [categoryId]: Array.isArray(result.data.data)
            ? result.data.data.length
            : 0,
        }));

        // Optional: Show success toast
        // showCustomToast("Success", "Category tasks loaded successfully");
      } else {
        console.warn("Unexpected response structure:", result);
        showCustomToast("Failed", "Invalid response format from server");
        setCategoryTasks([]);
        setTaskCounts((prevCounts) => ({
          ...prevCounts,
          [categoryId]: 0,
        }));
      }
    } catch (error) {
      console.error("Error Fetching:", error);

      // Handle different error scenarios
      let errorMessage = "Error fetching category tasks";
      let errorStatus = "Failed";

      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message =
          error.response.data?.message || error.response.statusText;

        errorStatus = status.toString();
        errorMessage = message || `Server error: ${status}`;

        // Handle specific status codes
        if (status === 404) {
          errorMessage = "Category not found";
        } else if (status === 401) {
          errorMessage = "Please log in to view category tasks";
        } else if (status === 403) {
          errorMessage = "You don't have permission to view this category";
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "No response from server. Please check your connection.";
      } else {
        // Something else happened
        errorMessage = error.message || "Unknown error occurred";
      }

      showCustomToast(errorStatus, errorMessage);
      setCError(errorMessage);
      setCategoryTasks([]);
      setTaskCounts((prevCounts) => ({
        ...prevCounts,
        [categoryId]: 0,
      }));
    } finally {
      setCisLoading(false);
    }
  };

  const [menuOpen, setmenuOpen] = useState(true);
  const toggleMenu = () => {
    setmenuOpen(!menuOpen);
  };

  return (
    <div className="relative flex h-screen bg-gray-50">
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
        fetchlength={fetchAllTasks}
      />

      {!menuOpen && (
        <div className="m-2 cursor-pointer p-2 opacity-70 transition-opacity duration-300 ease-in-out hover:opacity-100 sm:m-3 sm:p-3 md:m-3 md:p-3">
          <FiMenu
            onClick={toggleMenu}
            className="h-6 w-6 sm:h-6 sm:w-6 md:h-7 md:w-7"
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
          className={`fixed inset-0 z-50 bg-black/30 transition-opacity md:hidden ${
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
                menuopen={TaskMenu}
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
          className={`fixed inset-0 z-50 bg-black/30 transition-opacity md:hidden ${
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
