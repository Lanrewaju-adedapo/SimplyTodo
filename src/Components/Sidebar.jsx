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

  const addCategory = async () => {
    try {
      const response = await axiosInstance.post("/api/Todos/AddNewCategory", {
        CategoryName: categoryData.categoryName,
        ColorCode: categoryData.colorCode,
      });
      if (response.status === 200) {
        console.log(response.data);
        showCustomToast(`${response.data.status}`, `${response.data.message}`);
        await fetchCategories();
      }
    } catch (e) {
      if (e.response) {
        showCustomToast(
          `${e.response.data.status}`,
          `${e.response.data.message}`
        );
      } else {
        console.error("Error adding category:", error);
        showCustomToast("Error", "Something went wrong while adding category");
      }
    }
  };

  const deleteCategoryURL = "/api/Todos/DeleteCategory";
  const DeleteCategory = async (categoryId) => {
    try {
      const response = await axiosInstance.delete(
        `${deleteCategoryURL}/${categoryId}`
      );
      if (response.status === 200) {
        console.log("Deleted Category", response.data);
        showCustomToast(`${response.data.status}`, `${response.data.message}`);
        await fetchCategories();
        await setactivesection("Today");
      }
    } catch (e) {
      if (e.response) {
        showCustomToast(
          `${e.response.data.status}`,
          `${e.response.data.message}`
        );
      } else {
        console.error("Error adding category:", error);
        showCustomToast("Error", "Something went wrong while adding category");
      }
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closesidebar}
        ></div>
      )}
      <div
        className={
          `fixed lg:relative inset-y-0 left-0 z-50 w-80 sm:w-72 lg:w-80 xl:w-[18%] bg-[#f4f4f4] border-r border-gray-200 lg:m-4 lg:rounded-lg flex flex-col overflow-hiddentransition-transform duration-300 ease-in-out${
            menuopen ? "translate-x-0" : "-translate-x-full"
          }` + (menuopen ? " block" : " hidden")
        }
      >
        <div className="p-4 lg:p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xl font-semibold text-gray-700">Menu</span>
            <FiMenu
              className="size-6 transition-opacity duration-300 ease-in-out opacity-50 hover:opacity-100 cursor-pointer lg:opacity-50"
              onClick={togglemenu}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="py-3 px-2 lg:px-2">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider mb-3 px-2">
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
                  <BsCalendar2Week className="size-5 text-gray-800 flex-shrink-0" />
                  <span className="text-sm text-gray-800 font-semibold">
                    Today
                  </span>
                </div>
                <span className="text-[14px] text-gray-800 font-medium flex-shrink-0">
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
                  <CalendarClock className="size-6 text-gray-900 stroke-[1.4px] flex-shrink-0" />
                  <span className="text-sm text-gray-800 font-semibold">
                    Upcoming
                  </span>
                </div>
                <span className="text-[14px] text-gray-800 font-medium flex-shrink-0">
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
                  <BsCalendar2Check className="size-5 text-gray-800 flex-shrink-0" />
                  <span className="text-sm text-gray-800 font-semibold">
                    Completed
                  </span>
                </div>
                <span className="text-[14px] text-gray-800 font-medium flex-shrink-0">
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
                  <BsCalendar2X className="size-5 text-gray-800 flex-shrink-0" />
                  <span className="text-sm text-gray-800 font-semibold">
                    Due
                  </span>
                </div>
                <span className="text-[14px] text-gray-800 font-medium flex-shrink-0">
                  {DueTasks.length}
                </span>
              </div>
            </div>
          </div>
          <div className="border-b border-gray-200 mx-4"></div>
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider mb-3">
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
                    <div className="flex items-center space-x-3 min-w-0">
                      <div
                        style={{ backgroundColor: category.colorCode }}
                        className="size-3 rounded-lg flex-shrink-0"
                      ></div>
                      <span className="text-sm text-gray-800 font-semibold truncate">
                        {category.categoryName}
                      </span>
                    </div>
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                      onClick={() => DeleteCategory(category.categoryId)}
                    >
                      <MdDeleteForever className="size-5 text-gray-500 hover:text-red-500" />
                    </button>
                    {/* <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {categoriesLength[category.categoryId]}
                    </span> */}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No categories found.</p>
            )}
            {newCategoryPopup && (
              <div className="absolute bottom-35 right-0 z-50 p-4 bg-white shadow-xl rounded-2xl w-64 m-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  New Category
                </h3>
                <input
                  type="text"
                  placeholder="Category Name"
                  name="categoryName"
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 mb-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-300"
                />
                <div className="flex items-center justify-between bg-gray-100 rounded-xl px-3 py-2">
                  <input
                    type="color"
                    onChange={handleChange}
                    value={color}
                    className="w-10 h-10 p-1 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-600">
                    {color}
                  </span>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    className="px-3 py-1.5 text-sm font-mono rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                    onClick={() => setnewCategoryPopup(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-3 py-1.5 text-sm font-mono rounded-lg bg-amber-400 hover:bg-amber-500 transition"
                    onClick={() => addCategory()}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
            {deleteCategoryPopup && (
              <div className="p-4 absolute bottom-35 right-0 z-50 bg-white shadow-xl rounded-2xl w-64 m-2">
                <h3 className="text-base font-semibold text-center text-gray-700 mb-3">
                  All Tasks In This Category Will Be Deleted
                </h3>

                <div className="flex justify-center gap-4 mt-4">
                  <button
                    className="px-3 py-1.5 text-sm font-mono rounded-lg bg-gray-200 hover:bg-gray-300 transition cursor-pointer"
                    onClick={() => setdeleteCategoryPopup(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-3 py-1.5 text-sm font-mono rounded-lg bg-amber-400 hover:bg-amber-500 transition cursor-pointer"
                    onClick={() => DeleteCategory(category.categoryId)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
            <button
              className="flex items-center space-x-2 px-3 py-2 mt-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg w-full transition-colors"
              onClick={() => setnewCategoryPopup(!newCategoryPopup)}
            >
              <FiPlus className="w-4 h-4 flex-shrink-0" />
              <span>Add New Category</span>
            </button>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 space-y-1 flex-shrink-0">
          <button className="flex items-center gap-5 p-3 rounded-lg cursor-pointer hover:bg-gray-200 w-full transition-colors">
            <FiLogOut className="size-5 text-gray-800 flex-shrink-0" />
            <span className="text-sm text-gray-800 font-semibold">
              Sign out
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
