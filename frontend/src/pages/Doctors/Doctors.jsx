import React, { useEffect, useState } from "react";
import DoctorCard from "./../../components/Doctors/DoctorCard";
import Testimonial from "./../../components/Testimonial/Testimonial";
import { BASE_URL } from "../../config";
import useFetchData from "../../hooks/useFetchData";
import Loader from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";
import { BsSearch, BsGrid3X3Gap, BsList } from "react-icons/bs";
import { FaUserMd, FaStethoscope, FaBrain, FaHeartbeat } from "react-icons/fa";

const Doctors = () => {
  const [query, setQuery] = useState("");
  const [debounceQuery, setDebounceQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list


  // Debounce typing
  useEffect(() => {
    const t = setTimeout(() => setDebounceQuery(query.trim()), 500);
    return () => clearTimeout(t);
  }, [query]);

  // Build search URL with filters
  const buildSearchUrl = () => {
    const params = new URLSearchParams();
    if (debounceQuery) params.append('query', debounceQuery);
    if (selectedSpecialization) params.append('specialization', selectedSpecialization);
    return `${BASE_URL}/doctors?${params.toString()}`;
  };

  const {
    data: results,
    loading,
    error,
  } = useFetchData(buildSearchUrl());

  // Use results directly without sorting
  const sortedResults = results || [];

  const specializations = [
    { value: "", label: "All Specializations", icon: FaUserMd },
    { value: "General Doctor", label: "General Doctor", icon: FaUserMd },
    { value: "Surgeon", label: "Surgeon", icon: FaStethoscope },
    { value: "Neurologist", label: "Neurologist", icon: FaBrain },
    { value: "Dermatologist", label: "Dermatologist", icon: FaHeartbeat },
    { value: "Cardiologist", label: "Cardiologist", icon: FaHeartbeat },
    { value: "Pediatrician", label: "Pediatrician", icon: FaUserMd },
    { value: "Orthopedic", label: "Orthopedic", icon: FaStethoscope },
    { value: "Gynecologist", label: "Gynecologist", icon: FaUserMd },
    { value: "Psychiatrist", label: "Psychiatrist", icon: FaBrain },
    { value: "Ophthalmologist", label: "Ophthalmologist", icon: FaUserMd },
    { value: "ENT Specialist", label: "ENT Specialist", icon: FaStethoscope },
    { value: "Radiologist", label: "Radiologist", icon: FaUserMd },
    { value: "Anesthesiologist", label: "Anesthesiologist", icon: FaStethoscope },
  ];

  return (
    <>
      {/* Hero Section with Enhanced Search */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-headingColor mb-4">
              Find Your Perfect Doctor
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with experienced healthcare professionals. Search by name, specialization, or location to find the right doctor for you.
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <BsSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primaryColor focus:border-transparent"
                    placeholder="Search by doctor name or specialization..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                {/* Specialization Filter */}
                <div className="md:w-64">
                  <select
                    value={selectedSpecialization}
                    onChange={(e) => setSelectedSpecialization(e.target.value)}
                    className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primaryColor focus:border-transparent"
                  >
                    {specializations.map((spec) => (
                      <option key={spec.value} value={spec.value}>
                        {spec.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Button */}
                <button 
                  onClick={() => setDebounceQuery(query.trim())}
                  className="bg-primaryColor text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center gap-2"
                >
                  <BsSearch />
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading && <Loader />}
          {error && <Error />}

          {!loading && !error && (
            <>
              {/* Results Header */}
              <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-headingColor mb-2">
                    {sortedResults.length > 0 ? `${sortedResults.length} Doctors Found` : 'No Doctors Found'}
                  </h2>
                  {debounceQuery && (
                    <p className="text-gray-600">
                      Search results for "{debounceQuery}"
                      {selectedSpecialization && ` in ${selectedSpecialization}`}
                    </p>
                  )}
                </div>

                {sortedResults.length > 0 && (
                  <div className="flex items-center gap-4 mt-4 md:mt-0">
                    {/* View Mode Toggle */}
                    <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 ${viewMode === "grid" ? "bg-primaryColor text-white" : "bg-white text-gray-600"}`}
                      >
                        <BsGrid3X3Gap />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 ${viewMode === "list" ? "bg-primaryColor text-white" : "bg-white text-gray-600"}`}
                      >
                        <BsList />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Results Grid/List */}
              {sortedResults.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No doctors found</h3>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your search criteria or browse all available doctors.
                  </p>
                  <button
                    onClick={() => {
                      setQuery("");
                      setSelectedSpecialization("");
                      setDebounceQuery("");
                    }}
                    className="bg-primaryColor text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View All Doctors
                  </button>
                </div>
              ) : (
                <div className={
                  viewMode === "grid" 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }>
                  {sortedResults.map((doctor) => (
                    <DoctorCard key={doctor._id} doctor={doctor} viewMode={viewMode} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-headingColor mb-4">What Our Patients Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              World-class care for everyone. Our health system offers unmatched, expert health care from experienced professionals.
            </p>
          </div>
          <Testimonial />
        </div>
      </section>
    </>
  );
};

export default Doctors;
