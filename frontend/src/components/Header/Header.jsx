import "../../App.css";
import { useEffect, useRef } from "react";
import logo from "../../assets/images/Logo1.png";
import { NavLink, Link } from "react-router-dom";
import { BiMenu } from "react-icons/bi";
import { AiOutlineClose } from "react-icons/ai";
import { useAuth } from "../../context/AuthContext.jsx";
import SessionStatus from "../SessionStatus/SessionStatus.jsx";

// Navigation links for different user types
const getNavLinks = (role) => {
  const baseLinks = [
    {
      path: "/home",
      display: "Home",
    },
    {
      path: "/symptomchk",
      display: "HealthPredict",
    },
    {
      path: "/services",
      display: "Future Services",
    },
    {
      path: "/contact",
      display: "Contact",
    },
  ];

  if (role === "doctor") {
    // Doctor navigation - includes everything except "Find a Doctor"
    return [
      ...baseLinks,
      {
        path: "/doctors/profile/me",
        display: "My Dashboard",
      },
    ];
  } else if (role === "admin") {
    // Admin users will see admin layout, so minimal navigation here
    return [
      {
        path: "/home",
        display: "Home",
      },
      {
        path: "/contact",
        display: "Contact",
      },
    ];
  } else {
    // Patient/guest navigation - includes "Find a Doctor"
    const patientLinks = [
      ...baseLinks,
      {
        path: "/doctors",
        display: "Find a Doctor",
      },
    ];

    // Add dashboard link only for authenticated patients
    if (role === "patient") {
      patientLinks.push({
        path: "/users/profile/me",
        display: "My Dashboard",
      });
    }

    return patientLinks;
  }
};

const Header = () => {
  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const { user, role, isAuthenticated, logout } = useAuth();

  const handleStickyHeader = () => {
    const scrollHandler = () => {
      if (headerRef.current) {
        if (
          document.body.scrollTop > 80 ||
          document.documentElement.scrollTop > 80
        ) {
          headerRef.current.classList.add("sticky__header");
        } else {
          headerRef.current.classList.remove("sticky__header");
        }
      }
    };
    
    window.addEventListener("scroll", scrollHandler);
    return scrollHandler;
  };

  useEffect(() => {
    const scrollHandler = handleStickyHeader();
    return () => window.removeEventListener("scroll", scrollHandler);
  }, []);

  const toggleMenu = () => {
    if (menuRef.current) {
      menuRef.current.classList.toggle("show__menu");
    }
  };

  return (
    <header className="header flex items-center" ref={headerRef}>
      <div className="container">
        <div className="flex items-center justify-between">
          {/* ===========Logo ==========*/}
          <div>
            <img className="w-28 h-20 object-fill" src={logo} alt="Logo" />
          </div>
          {/* =========== Menu ==========*/}
          <div className="navigation" ref={menuRef}>
            <div className="close-menu-icon md:hidden" onClick={toggleMenu}>
              <AiOutlineClose className="w-8 h-8 cursor-pointer text-black text-2xl absolute top-4 right-4" />
            </div>
            <ul className="menu flex items-center gap-[2.7rem]">
              {getNavLinks(role).map((link, index) => (
                <li key={index}>
                  <NavLink
                    to={link.path}
                    className={(navClass) =>
                      navClass.isActive
                        ? "text-primaryColor text-[16px] leading-7 font-[600]"
                        : "text-textColor text-[16px] leading-7 font-[500] hover:text-primaryColor"
                    }
                    onClick={toggleMenu}
                  >
                    {link.display}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* ========== nav right ========== */}
          <div className="flex items-center gap-4">
            {/* Session Status */}
            {isAuthenticated && <SessionStatus />}
            
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={`${
                    role === "doctor"
                      ? "/doctors/profile/me"
                      : role === "admin"
                      ? "/home"
                      : "/users/profile/me"
                  }`}
                >
                  <figure className="w-[35px] h-[35px] rounded-full cursor-pointer">
                    <img
                      src={user?.photo || "/default-avatar.png"}
                      alt="User"
                      className="w-full rounded-full"
                    />
                  </figure>
                </Link>
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login">
                <button className="bg-primaryColor py-2 px-6 text-white font-[600] h-[44px] flex items-center justify-center rounded-[50px]">
                  Login
                </button>
              </Link>
            )}

            <span className="md:hidden" onClick={toggleMenu}>
              <BiMenu className="w-6 h-6 cursor-pointer" />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
