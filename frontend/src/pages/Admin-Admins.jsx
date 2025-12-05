import React, { useEffect, useState } from "react";
import { BASE_URL } from "../config.js";
import useFetchData from "../hooks/useFetchData.jsx";
import { getToken } from "../utils/tokenManager.js";
import defaultImg from "../assets/images/default.avif";
import { BiEditAlt } from "react-icons/bi";
import { MdDelete, MdAdd } from "react-icons/md";
import { MdOutlinePersonPin } from "react-icons/md";
import { FaUser, FaShieldAlt } from "react-icons/fa";
import { MdMarkEmailUnread } from "react-icons/md";
import { Link } from "react-router-dom";
import Loading from "../components/Loader/Loading.jsx";
import Error from "../components/Error/Error.jsx";
import { toast } from "react-toastify";

const AdminAdmins = () => {
  const {
    data: admins,
    loading,
    error,
    refetch,
  } = useFetchData(`${BASE_URL}/admin/admins`);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    permissions: ["manage_users", "manage_doctors", "manage_bookings", "view_analytics"]
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/admin/admins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success("Admin created successfully!");
        setShowCreateForm(false);
        setFormData({
          name: "",
          email: "",
          password: "",
          phone: "",
          permissions: ["manage_users", "manage_doctors", "manage_bookings", "view_analytics"]
        });
        refetch();
      } else {
        toast.error(result.message || "Failed to create admin");
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      toast.error("Error creating admin");
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (window.confirm("Are you sure you want to delete this admin?")) {
      try {
        const token = getToken();
        const response = await fetch(`${BASE_URL}/admin/admins/delete/${adminId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();
        
        if (result.success) {
          toast.success("Admin deleted successfully!");
          refetch();
        } else {
          toast.error(result.message || "Failed to delete admin");
        }
      } catch (error) {
        console.error("Error deleting admin:", error);
        toast.error("Error deleting admin");
      }
    }
  };

  const availablePermissions = [
    "manage_users",
    "manage_doctors", 
    "manage_bookings",
    "view_analytics"
  ];

  return (
    <>
      {loading && <Loading />}
      {error && <Error />}
      {!loading && !error && (
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Admin Management</h1>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
            >
              <MdAdd /> Create New Admin
            </button>
          </div>

          {/* Create Admin Form Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Create New Admin</h2>
                <form onSubmit={handleCreateAdmin}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Permissions</label>
                    {availablePermissions.map(permission => (
                      <label key={permission} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission)}
                          onChange={() => handlePermissionChange(permission)}
                          className="mr-2"
                        />
                        {permission.replace('_', ' ').toUpperCase()}
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Create Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Admins Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {admins?.map((admin, index) => (
              <div
                key={index}
                className="border-2 border-gray-500 rounded-lg px-4 py-2 m-4 relative hover:shadow-xl"
              >
                <div className="flex justify-between mb-3">
                  <BiEditAlt className="text-blue-500 cursor-pointer" />
                  <button onClick={() => handleDeleteAdmin(admin._id)}>
                    <MdDelete className="cursor-pointer text-red-500" />
                  </button>
                </div>
                <div className="top-1 w-full">
                  <img
                    className="w-full h-[250px] object-fill rounded-lg"
                    src={admin.photo || defaultImg}
                    alt={admin._id}
                  />
                </div>
                <div className="flex justify-start items-center gap-x-2">
                  <FaUser className="text-2xl" />
                  <h2 className="my-1">{admin.name}</h2>
                </div>
                <div className="flex justify-start items-center gap-x-2">
                  <MdMarkEmailUnread className="text-2xl" />
                  <h2 className="my-1">{admin.email}</h2>
                </div>
                <div className="flex justify-start items-center gap-x-2">
                  <FaShieldAlt className="text-2xl" />
                  <h2 className="my-1">Role: {admin.role}</h2>
                </div>
                <div className="flex justify-start items-center gap-x-2">
                  <MdOutlinePersonPin className="text-2xl" />
                  <h2 className="my-1">
                    Status: {admin.isActive ? "Active" : "Inactive"}
                  </h2>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Permissions:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {admin.permissions?.map(permission => (
                      <span
                        key={permission}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {permission.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
                {admin.lastLogin && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      Last Login: {new Date(admin.lastLogin).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminAdmins;