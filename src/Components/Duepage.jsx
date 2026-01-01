import React, { useState } from "react";
import emptyicon from "../Images/Caticon.png";
import Error from "../Images/error.png";
import { format, isBefore } from "date-fns";
import Loader from "./Loader";
import { LuCalendarCheck, LuCalendarClock } from "react-icons/lu";
import Completed from "../Images/Completed.png";
import { FiChevronRight } from "react-icons/fi";
import axiosInstance from "../helpers/useAxiosPrivate";
import { ToastContainer, Slide, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showCustomToast } from "../helpers/ToastContext";

const Duepage = ({
  duetasks,
  activesection,
  isloading,
  error,
  open,
  fetchduetasks,
  fetchlength,
}) => {
  const [tasks, setTasks] = useState(duetasks);

  const UpdateTask = async (taskId, isCompleted) => {
    // Validate inputs
    if (!taskId) {
      showCustomToast("Failed", "Invalid task ID");
      return;
    }

    if (typeof isCompleted !== "boolean") {
      showCustomToast("Failed", "Invalid completion status");
      return;
    }

    try {
      const response = await axiosInstance.put("/api/Todos/CompleteTask", {
        taskId,
        isCompleted,
      });

      if (response.status === 200) {
        // Update local state immediately for better UX
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.taskId === taskId ? { ...task, isCompleted } : task
          )
        );

        // Show success toast
        const action = isCompleted ? "completed" : "marked as incomplete";
        showCustomToast("Success", `Task ${action} successfully`);

        // Refresh data if functions exist
        if (typeof fetchduetasks === "function") {
          fetchduetasks();
        }
        if (typeof fetchlength === "function") {
          fetchlength();
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
          errorMessage = "Invalid task data";
        } else if (status === 401) {
          errorMessage = "Please log in to update tasks";
        } else if (status === 403) {
          errorMessage = "You don't have permission to update this task";
        } else if (status === 404) {
          errorMessage = "Task not found";
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message || "Unknown error occurred";
      }

      showCustomToast(errorStatus, errorMessage);
    }
  };

  const handleCompleted = async (taskId, currentStatus) => {
    const newStatus = !currentStatus;
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.taskId === taskId ? { ...task, isCompleted: newStatus } : task
      )
    );
    await UpdateTask(taskId, newStatus);
  };

  const isDue = (dueDate) => {
    return dueDate && isBefore(new Date(dueDate), new Date());
  };

  return (
    <div className="flex flex-1 flex-col">
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
      <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex items-center">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <h1 className="text-2xl font-semibold text-gray-800 sm:text-3xl lg:text-4xl">
              {activesection}
            </h1>
            <span className="rounded-full bg-gray-100 px-2 py-1 text-sm font-medium text-gray-600 sm:text-lg lg:text-xl">
              {duetasks.length}
            </span>
          </div>
        </div>
      </div>
      {isloading === false && error === "Error fetching Due tasks:" && (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-3 px-4">
          <img src={Error} alt="Error" className="size-16 sm:size-20" />
          <h2 className="text-center text-base font-medium text-gray-500 sm:text-lg">
            Error Fetching Data...
          </h2>
        </div>
      )}
      {isloading === true && (
        <div className="flex h-screen w-full items-center justify-center gap-2 px-4">
          <h2 className="text-base font-medium text-gray-500 sm:text-lg">
            Fetching Tasks...
          </h2>
          <Loader />
        </div>
      )}
      {duetasks.length <= 0 &&
        error !== "Error fetching Due tasks:" &&
        isloading === false && (
          <div className="flex h-screen w-full flex-col items-center justify-center gap-3 px-4">
            <img
              src={Completed}
              alt="empty"
              className="size-32 opacity-70 sm:size-40"
            />
            <h2 className="max-w-md text-center text-sm font-medium text-gray-500 sm:text-lg">
              Due Tasks Will Appear Here.
            </h2>
          </div>
        )}
      {isloading === false &&
        duetasks.length > 0 &&
        error !== "Error fetching Due tasks:" && (
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="space-y-2 p-4 sm:space-y-3 sm:p-6 lg:p-8">
              {duetasks.map((task) => (
                <div
                  key={task.taskId}
                  className="rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-center justify-between p-3 sm:p-4">
                    <div className="flex min-w-0 flex-1 items-start space-x-3 sm:items-center sm:space-x-4">
                      <input
                        type="checkbox"
                        onChange={() =>
                          handleCompleted(task.taskId, task.isCompleted)
                        }
                        checked={task.isCompleted}
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500 mt-0.5 sm:mt-0 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                          <span
                            className={`text-sm sm:text-base text-gray-800 break-words ${
                              task.isCompleted
                                ? "line-through text-gray-500"
                                : ""
                            }`}
                          >
                            {task.title}
                          </span>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs sm:mt-0 sm:text-sm">
                            {task.dueDate && (
                              <span className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs text-gray-500 sm:gap-2">
                                {task.isCompleted ? (
                                  <LuCalendarCheck
                                    color="#10B981"
                                    className="size-3 flex-shrink-0 sm:size-4"
                                  />
                                ) : (
                                  <LuCalendarClock
                                    color={
                                      isDue(task.dueDate)
                                        ? "#D84315"
                                        : "#10B981"
                                    }
                                    className="size-3 flex-shrink-0 sm:size-4"
                                  />
                                )}
                                <span className="hidden sm:inline">
                                  {format(
                                    new Date(task.dueDate),
                                    "MMMM dd, yyyy h:mm a"
                                  )}
                                </span>
                                <span className="sm:hidden">
                                  {format(
                                    new Date(task.dueDate),
                                    "MMM dd, h:mm a"
                                  )}
                                </span>
                              </span>
                            )}
                            {task.list && (
                              <div className="flex items-center space-x-1">
                                <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                                <span className="text-xs text-gray-500">
                                  {task.list}
                                </span>
                              </div>
                            )}
                            {task.categoryName && (
                              <div className="flex items-center space-x-1 sm:space-x-2">
                                <div
                                  style={{ backgroundColor: task.colorCode }}
                                  className="size-3 flex-shrink-0 rounded-lg sm:size-4"
                                ></div>
                                <span className="truncate text-xs text-gray-500">
                                  {task.categoryName}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      onClick={() => open(task.taskId)}
                      className="cursor-pointer hover:bg-gray-100 rounded-full transition-all duration-150 p-1 sm:p-1.5 ml-2 flex-shrink-0"
                    >
                      <FiChevronRight className="size-4 text-gray-400 sm:size-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};

export default Duepage;
