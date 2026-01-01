import React, { useEffect, useState, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { BiSolidFlag } from "react-icons/bi";
import { LuCalendarCheck, LuCalendarClock } from "react-icons/lu";
import { BsHourglassSplit, BsCalendar3 } from "react-icons/bs";
import { IoFolderOpenOutline } from "react-icons/io5";
import { FiCheckCircle } from "react-icons/fi";
import { format, isBefore } from "date-fns";
import Calendar from "./Calendar";
import { FaRegBell } from "react-icons/fa6";
import axiosInstance from "../helpers/useAxiosPrivate";
import { ToastContainer, Slide, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showCustomToast } from "../helpers/ToastContext";

const Taskmenu = ({
  onclose,
  taskdetails,
  onTaskdeleted,
  refetch,
  fetchlength,
}) => {
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
    title: taskdetails.title ? taskdetails.title : "",
    description: taskdetails.description ? taskdetails.description : "",
    priority: taskdetails.priority,
    dueDate: taskdetails.dueDate ? new Date(taskdetails.dueDate) : null,
    categoryId: taskdetails.categoryId,
  });

  useEffect(() => {
    setFormData({
      taskId: taskdetails.taskId,
      title: taskdetails.title ? taskdetails.title : "",
      description: taskdetails.description ? taskdetails.description : "",
      priority: taskdetails.priority,
      dueDate: taskdetails.dueDate ? new Date(taskdetails.dueDate) : null,
      categoryId: taskdetails.categoryId,
    });
    setOpenCalendar(false);
  }, [taskdetails]);

  const togglePriorityDropdown = () => {
    setPriorityDropdown(!priorityDropdown);
  };

  const DeleteTask = async (taskId) => {
    // Validate inputs
    if (!taskId) {
      showCustomToast("Failed", "Invalid task ID");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.delete(`/api/Todos/${taskId}`);

      if (response.status === 200) {
        // Call the deletion callback
        onTaskdeleted(taskId);

        // Show success toast
        showCustomToast("Success", "Task deleted successfully");

        // Refresh data if functions exist
        if (typeof refetch === "function") {
          refetch();
        }
        if (typeof fetchlength === "function") {
          fetchlength();
        }

        // Close modal/dialog
        if (typeof onclose === "function") {
          onclose();
        }
      } else {
        console.error("Failed to delete task:", response.status);
        showCustomToast("Failed", "Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);

      let errorMessage = "Error deleting task";
      let errorStatus = "Failed";

      if (error.response) {
        const status = error.response.status;
        const message =
          error.response.data?.message || error.response.statusText;

        // errorStatus = status.toString();
        errorMessage = message || `Server error: ${status}`;

        // Handle specific status codes
        if (status === 401) {
          errorMessage = "Please log in to delete tasks";
        } else if (status === 403) {
          errorMessage = "You don't have permission to delete this task";
        } else if (status === 404) {
          errorMessage = "Task not found";
        } else if (status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message || "Unknown error occurred";
      }

      showCustomToast(errorStatus, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const UpdateTask = async () => {
    // Validate form data
    if (!formData.title || formData.title.trim() === "") {
      showCustomToast("Failed", "Task title is required");
      return;
    }

    if (!formData.dueDate) {
      showCustomToast("Failed", "Due date is required");
      return;
    }

    setIsSaving(true);
    try {
      const response = await axiosInstance.put("/api/Todos", {
        ...formData,
        title: formData.title.trim(), // Sanitize title
      });

      if (response.status === 200) {
        // Show success toast
        showCustomToast("Success", "Task updated successfully");

        // Refresh data if functions exist
        if (typeof refetch === "function") {
          refetch();
        }
        if (typeof fetchlength === "function") {
          fetchlength();
        }

        // Close modal/dialog
        if (typeof onclose === "function") {
          onclose();
        }
      } else {
        console.error("Failed to update task:", response.status);
        showCustomToast("Failed", "Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task:", error);

      let errorMessage = "Error updating task";
      let errorStatus = "Failed";

      if (error.response) {
        const status = error.response.status;
        const message =
          error.response.data?.message || error.response.statusText;

        // errorStatus = status.toString();
        errorMessage = message || `Server error: ${status}`;

        // Handle specific status codes
        if (status === 400) {
          errorMessage = "Invalid task data. Please check your inputs.";
        } else if (status === 401) {
          errorMessage = "Please log in to update tasks";
        } else if (status === 403) {
          errorMessage = "You don't have permission to update this task";
        } else if (status === 404) {
          errorMessage = "Task not found";
        } else if (status === 409) {
          errorMessage = "A task with this title already exists";
        } else if (status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message || "Unknown error occurred";
      }

      showCustomToast(errorStatus, errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const isDue = (dueDate) => {
    return dueDate && isBefore(new Date(dueDate), new Date());
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCalendarClick = () => {
    setOpenCalendar(true);
  };

  const handleCalendarClose = () => {
    setOpenCalendar(false);
  };

  const handleDateSelected = (date) => {
    setFormData((prev) => ({ ...prev, dueDate: date }));
    setOpenCalendar(false);
  };

  const handlePriorityChange = (priority) => {
    setFormData((prev) => ({ ...prev, priority }));
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [selected, setSelected] = useState();
  const [allCategories, setallCategories] = useState(null);
  const [floading, setFLoading] = useState(false);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await axiosInstance.get("/api/Todos/categories");
        setFLoading(true);

        // Validate response structure
        if (result && result.data && result.data.data) {
          const data = result.data;
          console.log("Categories data:", data.data);
          setallCategories(data.data);

          // Find and set selected category if categoryId exists
          if (formData?.categoryId) {
            const taskcategory = data.data.find(
              (x) => x.categoryId === formData.categoryId
            );
            setSelected(taskcategory);
            console.log("Task category:", taskcategory);
          }
        } else {
          console.warn("Unexpected response structure:", result);
          showCustomToast("Failed", "Invalid response format from server");
          setallCategories([]); // Set empty array as fallback
        }
      } catch (error) {
        console.error("Error fetching categories:", error);

        let errorMessage = "Error fetching categories";
        let errorStatus = "Failed";

        if (error.response) {
          const status = error.response.status;
          const message =
            error.response.data?.message || error.response.statusText;

        //   errorStatus = status.toString();
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
          errorMessage =
            "No response from server. Please check your connection.";
        } else {
          errorMessage = error.message || "Unknown error occurred";
        }

        showCustomToast(errorStatus, errorMessage);
        setallCategories([]); // Set empty array on error
      } finally {
        setFLoading(false);
      }
    };

    fetchCategories();
  }, [formData.categoryId]);

  const [open, setOpen] = useState(false);
  const handleCategoryChange = (categoryId) => {
    setFormData((prev) => ({ ...prev, categoryId }));
    setOpen(false);
  };

  return (
    <div className={`w-full h-full flex flex-col`}>
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
      <div className="flex-1 overflow-y-auto">
        <div
          className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-300 bg-[#f4f4f4] p-6"
          onClick={handleClose}
        >
          <span
            className={`text-sm ${
              taskdetails.isCompleted
                ? "text-green-500 font-semibold text-[16px]"
                : "text-red-500 font-semibold text-[16px]"
            }`}
          >
            {taskdetails.isCompleted ? (
              <span className="flex items-center gap-2">
                <FiCheckCircle color="#10B981" />
                <h2>Completed</h2>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <BsHourglassSplit color="#D84315" />
                <h2>Pending..</h2>
              </span>
            )}
          </span>
          <IoClose
            className="size-6 cursor-pointer font-semibold text-gray-700"
            onClick={onclose}
          />
        </div>
        <div className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="title"
                  className="text-sm font-medium text-gray-800"
                >
                  Title
                </label>
                <div className="relative" ref={priorityRef}>
                  {formData.priority === 1 ? (
                    <div
                      onClick={togglePriorityDropdown}
                      className="flex cursor-pointer items-center gap-2 rounded-full p-2 text-gray-800 transition-all duration-200 hover:bg-gray-200"
                    >
                      <BiSolidFlag color="#FFA726" />
                    </div>
                  ) : formData.priority === 2 ? (
                    <div
                      onClick={togglePriorityDropdown}
                      className="flex cursor-pointer items-center gap-2 rounded-full p-2 text-gray-800 transition-all duration-200 hover:bg-gray-200"
                    >
                      <BiSolidFlag color="#D84315" />
                    </div>
                  ) : (
                    <div
                      onClick={togglePriorityDropdown}
                      className="flex cursor-pointer items-center gap-2 rounded-full p-2 text-gray-800 transition-all duration-200 hover:bg-gray-200"
                    >
                      <BiSolidFlag color="#9CCC65" />
                    </div>
                  )}
                  {priorityDropdown && (
                    <div className="absolute top-0 right-full z-50 mr-1 -translate-y-[10%]">
                      <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 shadow-xl">
                        <div
                          onClick={() => handlePriorityChange(0)}
                          className="flex items-center gap-2 hover:bg-gray-100 pl-4 pr-20 py-2 rounded-lg transition-all duration-200 cursor-pointer"
                        >
                          <BiSolidFlag color="#9CCC65" /> <span>Low</span>
                        </div>
                        <div
                          onClick={() => handlePriorityChange(1)}
                          className="flex items-center gap-2 hover:bg-gray-100 pl-4 pr-20 py-2 rounded-lg transition-all duration-200 cursor-pointer"
                        >
                          <BiSolidFlag color="#FFA726" /> <span>Medium</span>
                        </div>
                        <div
                          onClick={() => handlePriorityChange(2)}
                          className="flex items-center gap-2 hover:bg-gray-100 pl-4 pr-20 py-2 rounded-lg transition-all duration-200 cursor-pointer"
                        >
                          <BiSolidFlag color="#D84315" /> <span>High</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-300 p-3 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-gray-800"
              >
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="h-40 border border-gray-300 p-3 focus:outline-none"
              />
            </div>
            <div className="relative flex items-center justify-between">
              <span className="flex items-center gap-1 text-sm text-gray-500">
                {taskdetails.isCompleted ? (
                  <LuCalendarCheck color="#10B981" className="size-5" />
                ) : (
                  <LuCalendarClock
                    color={isDue(formData.dueDate) ? "#D84315" : "#10B981"}
                    className="size-5"
                  />
                )}
                <span className="font-medium text-gray-800">
                  Due:{" "}
                  {formData.dueDate
                    ? format(formData.dueDate, "h:mm a MMMM d, yyyy")
                    : "No Due Date"}
                </span>
              </span>
              <div className="relative">
                <div
                  className="cursor-pointer rounded-full p-3 hover:bg-gray-200"
                  onClick={handleCalendarClick}
                >
                  <FaRegBell className="size-5 text-gray-900" />
                </div>
                {openCalendar && (
                  <div
                    className="absolute top-0 right-full z-50 mr-2 -translate-y-[60%]"
                    ref={calendarRef}
                  >
                    <Calendar
                      onClose={handleCalendarClose}
                      onDateSelected={handleDateSelected}
                      initialDate={formData.dueDate}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div
          className="relative mr-3 ml-3 flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white px-6 py-4 backdrop-opacity-50 transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
          onClick={() => setOpen(!open)}
        >
          <div className="flex items-center space-x-2">
            {selected ? (
              <>
                <div
                  style={{ backgroundColor: selected.colorCode }}
                  className="size-3 rounded-lg"
                ></div>
                <span className="font-medium text-[14px] text-gray-500">
                  {selected.categoryName}
                </span>
              </>
            ) : (
              <span className="font-medium text-[14px] text-gray-500">
                Category
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <IoFolderOpenOutline className="text-lg text-gray-500" />
          </div>
          {open && (
            <div className="animate-in slide-in-from-top-2 absolute bottom-full left-0 z-20 mb-3 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-200/80 bg-white shadow-2xl backdrop-blur-sm duration-200">
              {allCategories?.length > 0 ? (
                allCategories.map((cat) => (
                  <div
                    key={cat.categoryId}
                    className={`flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 first:rounded-t-xl last:rounded-b-xl transition-all duration-150 ${
                      selected?.categoryId === cat.categoryId
                        ? "bg-blue-50 border-r-2 border-blue-500"
                        : ""
                    }`}
                    onClick={() => handleCategoryChange(cat.categoryId)}
                  >
                    <span
                      style={{ backgroundColor: cat.colorCode }}
                      className="h-4 w-4 rounded-full border border-white shadow-sm"
                    />
                    <span className="font-medium text-gray-800">
                      {cat.categoryName}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center px-4 py-6">
                  <span className="text-gray-500 text-sm font-medium">
                    No categories found
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="bg-[#f4f4f4] p-4">
        <div className="flex items-center justify-around gap-2 sm:gap-5">
          <button
            onClick={() => DeleteTask(taskdetails.taskId)}
            className="cursor-pointer px-7 font-semibold py-3 border-2 tracking-wide rounded-xl hover:shadow-sm transition-shadow border-gray-300"
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Task"}
          </button>
          <button
            onClick={UpdateTask}
            className={`${
              taskdetails.isCompleted ? "cursor-not-allowed" : "cursor-pointer"
            } px-7 font-semibold py-3 border-2 tracking-wide rounded-xl hover:shadow-sm transition-shadow bg-amber-300 border-amber-300`}
            disabled={taskdetails.isCompleted || isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Taskmenu;
