import React, { useEffect, useState } from "react";
import { FiPlus, FiCalendar, FiMenu, FiLogOut, FiX } from "react-icons/fi";
import { MdDeleteForever } from "react-icons/md";
import {
  BsCalendar2Check,
  BsCalendar2Week,
  BsCalendar2X,
} from "react-icons/bs";
import { CalendarClock } from "lucide-react";
import UseRefreshToken from "../helpers/UseRefreshToken";
import axiosInstance from "../helpers/useAxiosPrivate";
import { ToastContainer, Slide, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showCustomToast } from "../helpers/ToastContext";

const Sidebar = ({
  menuopen,
  togglemenu,
  setactivesection,
  closMenu,
  categories,
  activesection,
  TodayTask,
  fetchTodayTasks,
  fetchcompletedtasks,
  completedtasks,
  fetchupcomingtasks,
  upcomingtasks,
  fetchduetasks,
  DueTasks,
  closesidebar,
  fetchCategories,
  fetchlength,
}) => {
  const refresh = UseRefreshToken();
  const getcompletedtasks = () => {
    setactivesection("Completed"), fetchcompletedtasks();
    closMenu();
  };

  const getupcomingtasks = () => {
    setactivesection("Upcoming");
    fetchupcomingtasks();
    closMenu();
  };

  const getduetasks = () => {
    setactivesection("Due");
    fetchduetasks();
    closMenu();
  };

  const getToday = () => {
    setactivesection("Today"), fetchTodayTasks();
    closMenu();
  };

  const getcategory = (category) => {
    setactivesection(category);
    closMenu();
  };

  const [deleteCategoryPopup, setdeleteCategoryPopup] = useState(false);
  const [newCategoryPopup, setnewCategoryPopup] = useState(false);
  const [color, setColor] = useState("#000000");
  const handleChange = (e) => {
    setColor(e.target.value);
  };

  const [categoryData, setcategoryData] = useState({
    categoryName: "",
    colorCode: color,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setcategoryData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    setcategoryData((prev) => ({ ...prev, colorCode: color }));
  }, [color]);

  // Add new category
  const addCategory = async () => {
    // Validate category data before making the request
    if (!categoryData.categoryName || categoryData.categoryName.trim() === "") {
      showCustomToast("Failed", "Category name is required");
      return;
    }

    if (!categoryData.colorCode) {
      showCustomToast("Failed", "Color code is required");
      return;
    }

    try {
      const response = await axiosInstance.post("/api/Todos/AddNewCategory", {
        CategoryName: categoryData.categoryName.trim(),
        ColorCode: categoryData.colorCode,
      });

      // Enhanced response validation
      if (response.status === 200 && response.data) {
        console.log("Category added:", response.data);

        // Use consistent toast type based on status
        const statusType =
          response.data.status === "Success" ? "Success" : "Failed";
        showCustomToast(statusType, response.data.message);

        // Refresh categories
        await fetchCategories();

        // Reset form on success
        setCategoryData({
          categoryName: "",
          colorCode: "",
        });
      } else {
        console.warn("Unexpected response:", response);
        showCustomToast("Failed", "Unexpected response from server");
      }
    } catch (error) {
      console.error("Error adding category:", error);

      let errorMessage = "Something went wrong while adding category";
      let errorStatus = "Failed";

      if (error.response) {
        // Server responded with error status
        const responseData = error.response.data;

        // Handle different response structures
        if (responseData?.status && responseData?.message) {
          errorStatus = responseData.status;
          errorMessage = responseData.message;
        } else if (responseData?.message) {
          errorMessage = responseData.message;
        } else if (responseData?.error) {
          errorMessage = responseData.error;
        } else {
          errorStatus = error.response.status.toString();
          errorMessage =
            error.response.statusText ||
            `Server error: ${error.response.status}`;
        }

        // Handle specific status codes
        if (error.response.status === 400) {
          errorMessage = "Invalid category data. Please check your inputs.";
        } else if (error.response.status === 401) {
          errorMessage = "Please log in to add categories";
        } else if (error.response.status === 409) {
          errorMessage = "A category with this name already exists";
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "No response from server. Please check your connection.";
      } else {
        // Something else happened
        errorMessage = error.message || "Unknown error occurred";
      }

      // Ensure consistent toast type
      const toastType = errorStatus === "Success" ? "Success" : "Failed";
      showCustomToast(toastType, errorMessage);
    }
  };

  const deleteCategoryURL = "/api/Todos/DeleteCategory";
  const DeleteCategory = async (categoryId) => {
    // Validate categoryId before making the request
    if (!categoryId) {
      showCustomToast("Failed", "Invalid category ID");
      return;
    }

    try {
      const response = await axiosInstance.delete(
        `${deleteCategoryURL}/${categoryId}`
      );

      // Enhanced response validation
      if (response.status === 200 && response.data) {
        console.log("Deleted Category", response.data);

        // Use consistent toast type based on status
        const statusType =
          response.data.status === "Success" ? "Success" : "Failed";
        showCustomToast(statusType, response.data.message);

        // Refresh data
        await fetchCategories();
        await setactivesection("Today");
        await fetchlength();
      } else {
        console.warn("Unexpected response:", response);
        showCustomToast("Failed", "Unexpected response from server");
      }
    } catch (error) {
      console.error("Error deleting category:", error);

      let errorMessage = "Something went wrong while deleting category";
      let errorStatus = "Failed";

      if (error.response) {
        // Server responded with error status
        const responseData = error.response.data;

        // Handle different response structures
        if (responseData?.status && responseData?.message) {
          errorStatus = responseData.status;
          errorMessage = responseData.message;
        } else if (responseData?.message) {
          errorMessage = responseData.message;
        } else if (responseData?.error) {
          errorMessage = responseData.error;
        } else {
          errorStatus = error.response.status.toString();
          errorMessage =
            error.response.statusText ||
            `Server error: ${error.response.status}`;
        }

        // Handle specific status codes
        if (error.response.status === 400) {
          errorMessage = "Invalid category data";
        } else if (error.response.status === 401) {
          errorMessage = "Please log in to delete categories";
        } else if (error.response.status === 403) {
          errorMessage = "You don't have permission to delete this category";
        } else if (error.response.status === 404) {
          errorMessage = "Category not found";
        } else if (error.response.status === 409) {
          errorMessage = "Cannot delete category with existing tasks";
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "No response from server. Please check your connection.";
      } else {
        // Something else happened
        errorMessage = error.message || "Unknown error occurred";
      }

      // Ensure consistent toast type
      const toastType = errorStatus === "Success" ? "Success" : "Failed";
      showCustomToast(toastType, errorMessage);
    }
  };

  const onClick = () => {
    addCategory();
    setnewCategoryPopup(false);
  };

  return (
    <>
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
      {menuopen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closesidebar}
        ></div>
      )}
      <div
        className={
          `fixed lg:relative inset-y-0 left-0 z-50 w-80 sm:w-72 lg:w-80 xl:w-[18%] bg-[#f4f4f4] border-r border-gray-200 lg:m-4 lg:rounded-lg flex flex-col overflow-hidden transition-transform duration-300 ease-in-out${
            menuopen ? "translate-x-0" : "-translate-x-full"
          }` + (menuopen ? " block" : " hidden")
        }
      >
        <div className="flex-shrink-0 border-b border-gray-200 p-4 lg:p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xl font-semibold text-gray-700">Menu</span>
            <FiMenu
              className="size-6 cursor-pointer opacity-50 transition-opacity duration-300 ease-in-out hover:opacity-100 lg:opacity-50"
              onClick={togglemenu}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-2 py-3 lg:px-2">
            <h3 className="mb-3 px-2 text-sm font-semibold tracking-wider text-gray-900">
              TASKS
            </h3>
            <div className="space-y-1">
              <div
                className={`flex items-center justify-between p-3 mx-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors ${
                  activesection === "Today" ? "bg-gray-200" : ""
                }`}
                onClick={getToday}
              >
                <div className="flex items-center space-x-3">
                  <BsCalendar2Week className="size-5 flex-shrink-0 text-gray-800" />
                  <span className="text-sm font-semibold text-gray-800">
                    Today
                  </span>
                </div>
                <span className="flex-shrink-0 font-medium text-[14px] text-gray-800">
                  {TodayTask.length}
                </span>
              </div>
              <div
                className={`flex items-center justify-between p-3 mx-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors ${
                  activesection === "Upcoming" ? "bg-gray-200" : ""
                }`}
                onClick={getupcomingtasks}
              >
                <div className="flex items-center space-x-3">
                  <CalendarClock className="size-6 flex-shrink-0 stroke-[1.4px] text-gray-900" />
                  <span className="text-sm font-semibold text-gray-800">
                    Upcoming
                  </span>
                </div>
                <span className="flex-shrink-0 font-medium text-[14px] text-gray-800">
                  {upcomingtasks.length}
                </span>
              </div>
              <div
                className={`flex items-center justify-between p-3 mx-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors ${
                  activesection === "Completed" ? "bg-gray-200" : ""
                }`}
                onClick={getcompletedtasks}
              >
                <div className="flex items-center gap-3">
                  <BsCalendar2Check className="size-5 flex-shrink-0 text-gray-800" />
                  <span className="text-sm font-semibold text-gray-800">
                    Completed
                  </span>
                </div>
                <span className="flex-shrink-0 font-medium text-[14px] text-gray-800">
                  {completedtasks.length}
                </span>
              </div>
              <div
                className={`flex items-center justify-between p-3 mx-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors ${
                  activesection === "Due" ? "bg-gray-200" : ""
                }`}
                onClick={getduetasks}
              >
                <div className="flex items-center gap-3">
                  <BsCalendar2X className="size-5 flex-shrink-0 text-gray-800" />
                  <span className="text-sm font-semibold text-gray-800">
                    Due
                  </span>
                </div>
                <span className="flex-shrink-0 font-medium text-[14px] text-gray-800">
                  {DueTasks.length}
                </span>
              </div>
            </div>
          </div>
          <div className="mx-4 border-b border-gray-200"></div>
          <div className="p-4">
            <h3 className="mb-3 text-sm font-semibold tracking-wider text-gray-900">
              Categories
            </h3>
            {categories && categories.length > 0 ? (
              <div className="space-y-1">
                {categories.map((category) => (
                  <div
                    key={category.categoryId}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors group`}
                    onClick={() => getcategory(category.categoryName)}
                  >
                    <div className="flex min-w-0 items-center space-x-3">
                      <div
                        style={{ backgroundColor: category.colorCode }}
                        className="size-3 flex-shrink-0 rounded-lg"
                      ></div>
                      <span className="truncate text-sm font-semibold text-gray-800">
                        {category.categoryName}
                      </span>
                    </div>
                    <button
                      className="cursor-pointer opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      onClick={() => DeleteCategory(category.categoryId)}
                    >
                      <MdDeleteForever className="size-5 text-gray-500 hover:text-red-500" />
                    </button>
                    {/* <span className="ml-2 flex-shrink-0 text-xs text-gray-500">
                      {categoriesLength[category.categoryId]}
                    </span> */}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No categories found.</p>
            )}
            {newCategoryPopup && (
              <div className="absolute right-0 bottom-35 z-50 m-2 w-64 rounded-2xl bg-white p-4 shadow-xl">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">
                  New Category
                </h3>
                <input
                  type="text"
                  placeholder="Category Name"
                  name="categoryName"
                  onChange={handleInputChange}
                  className="mb-3 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-amber-300 focus:outline-none"
                />
                <div className="flex items-center justify-between rounded-xl bg-gray-100 px-3 py-2">
                  <input
                    type="color"
                    onChange={handleChange}
                    value={color}
                    className="h-10 w-10 cursor-pointer rounded-lg border border-gray-300 p-1"
                  />
                  <span className="text-sm font-medium text-gray-600">
                    {color}
                  </span>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    className="rounded-lg bg-gray-200 px-3 py-1.5 font-mono text-sm transition hover:bg-gray-300"
                    onClick={() => setnewCategoryPopup(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="rounded-lg bg-amber-400 px-3 py-1.5 font-mono text-sm transition hover:bg-amber-500"
                    onClick={() => addCategory()}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
            {deleteCategoryPopup && (
              <div className="absolute right-0 bottom-35 z-50 m-2 w-64 rounded-2xl bg-white p-4 shadow-xl">
                <h3 className="mb-3 text-center text-base font-semibold text-gray-700">
                  All Tasks In This Category Will Be Deleted
                </h3>

                <div className="mt-4 flex justify-center gap-4">
                  <button
                    className="cursor-pointer rounded-lg bg-gray-200 px-3 py-1.5 font-mono text-sm transition hover:bg-gray-300"
                    onClick={() => setdeleteCategoryPopup(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="cursor-pointer rounded-lg bg-amber-400 px-3 py-1.5 font-mono text-sm transition hover:bg-amber-500"
                    onClick={() => DeleteCategory(category.categoryId)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
            <button
              className="mt-2 flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-200"
              onClick={() => setnewCategoryPopup(!newCategoryPopup)}
            >
              <FiPlus className="h-4 w-4 flex-shrink-0" />
              <span>Add New Category</span>
            </button>
          </div>
        </div>
        <div className="flex-shrink-0 space-y-1 border-t border-gray-200 p-4">
          <button className="flex w-full cursor-pointer items-center gap-5 rounded-lg p-3 transition-colors hover:bg-gray-200">
            <FiLogOut className="size-5 flex-shrink-0 text-gray-800" />
            <span className="text-sm font-semibold text-gray-800">
              Sign out
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
