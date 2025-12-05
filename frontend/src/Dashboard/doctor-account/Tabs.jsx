import { useState } from "react";
import { BiMenu } from "react-icons/bi";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Tabs = ({ tab, setTab }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <div>
      <span className="lg:hidden" onClick={toggleMobileMenu}>
        <BiMenu className="w-6 h-6 cursor-pointer" />
      </span>
      
      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden flex flex-col p-[20px] bg-white shadow-panelShadow mb-5 rounded-md">
          <button
            onClick={() => {setTab("dashboard"); setShowMobileMenu(false);}}
            className={`${
              tab === "dashboard"
                ? "bg-indigo-100 text-primaryColor"
                : "bg-transparent text-headingColor"
            } w-full btn mt-0 rounded-md mb-2`}
          >
            📊 Dashboard
          </button>

          <button
            onClick={() => {setTab("overview"); setShowMobileMenu(false);}}
            className={`${
              tab === "overview"
                ? "bg-indigo-100 text-primaryColor"
                : "bg-transparent text-headingColor"
            } w-full btn mt-0 rounded-md mb-2`}
          >
            👤 Overview
          </button>

          <button
            onClick={() => {setTab("appointments"); setShowMobileMenu(false);}}
            className={`${
              tab === "appointments"
                ? "bg-indigo-100 text-primaryColor"
                : "bg-transparent text-headingColor"
            } w-full btn mt-0 rounded-md mb-2`}
          >
            📅 Appointments
          </button>

          <button
            onClick={() => {setTab("settings"); setShowMobileMenu(false);}}
            className={`${
              tab === "settings"
                ? "bg-indigo-100 text-primaryColor"
                : "bg-transparent text-headingColor"
            } w-full btn mt-0 rounded-md mb-2`}
          >
            ⚙️ Settings
          </button>



          <button
            onClick={handleLogout}
            className="w-full bg-[#181A1E] p-3 text-[16px] leading-7 rounded-md text-white mb-2"
          >
            Logout
          </button>
          <button className="w-full bg-red-600 p-3 text-[16px] leading-7 rounded-md text-white">
            Delete Account
          </button>
        </div>
      )}

      {/* Desktop Menu */}
      <div className="hidden lg:flex flex-col p-[30px] bg-white shadow-panelShadow items-center h-max rounded-md">
        <button
          onClick={() => setTab("dashboard")}
          className={`${
            tab === "dashboard"
              ? "bg-indigo-100 text-primaryColor"
              : "bg-transparent text-headingColor"
          } w-full btn mt-0 rounded-md`}
        >
          📊 Dashboard
        </button>

        <button
          onClick={() => setTab("overview")}
          className={`${
            tab === "overview"
              ? "bg-indigo-100 text-primaryColor"
              : "bg-transparent text-headingColor"
          } w-full btn mt-0 rounded-md`}
        >
          👤 Overview
        </button>

        <button
          onClick={() => setTab("appointments")}
          className={`${
            tab === "appointments"
              ? "bg-indigo-100 text-primaryColor"
              : "bg-transparent text-headingColor"
          } w-full btn mt-0 rounded-md`}
        >
          📅 Appointments
        </button>

        <button
          onClick={() => setTab("settings")}
          className={`${
            tab === "settings"
              ? "bg-indigo-100 text-primaryColor"
              : "bg-transparent text-headingColor"
          } w-full btn mt-0 rounded-md`}
        >
          ⚙️ Settings
        </button>



        <div className="mt-[100px] w-full">
          <button
            onClick={handleLogout}
            className="w-full bg-[#181A1E] p-3 text-[16px] leading-7 rounded-md text-white"
          >
            Logout
          </button>
          <button className="mt-4 w-full bg-red-600 p-3 text-[16px] leading-7 rounded-md text-white">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tabs;
