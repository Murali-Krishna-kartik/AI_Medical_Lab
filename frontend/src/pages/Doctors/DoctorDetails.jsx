import { useState } from "react";
import starIcon from "../../assets/images/Star.png";
import DoctorAbout from "./DoctorAbout";
import Feedback from "./Feedback";
import SidePanel from "./SidePanel";

import { BASE_URL } from "../../config";
import useFetchData from "../../hooks/useFetchData";
import Loader from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";
import { useParams, Link } from "react-router-dom";
import { BsArrowLeft, BsCalendarCheck, BsClock, BsShield, BsAward } from "react-icons/bs";
import { FaUserMd, FaGraduationCap, FaStethoscope } from "react-icons/fa";

const DoctorDetails = () => {
  const [tab, setTab] = useState("about");
  const { id } = useParams();
  const {
    data: doctor,
    loading,
    error,
  } = useFetchData(`${BASE_URL}/doctors/${id}`);

  const {
    name,
    timeSlots,
    averageRating,
    totalRating,
    photo,
    bio,
    about,
    specialization,
    experiences,
    ticketPrice,
    reviews,
    qualifications,
  } = doctor;

  const yearsOfExperience = experiences?.length || 0;
  const hospital = experiences?.[0]?.hospital || "Medical Center";

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <Link 
            to="/doctors" 
            className="flex items-center gap-2 text-primaryColor hover:text-blue-700 transition-colors"
          >
            <BsArrowLeft />
            <span>Back to Doctors</span>
          </Link>
        </div>
      </div>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {loading && <Loader />}
          {error && <Error />}
          {!loading && !error && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Doctor Header Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
                  <div className="bg-gradient-to-r from-primaryColor to-blue-600 p-6 text-white">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                      {/* Doctor Image */}
                      <div className="relative">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-white/20 shadow-xl">
                          <img 
                            src={photo} 
                            alt={name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/300x300/CCF0F3/0066FF?text=Doctor";
                            }}
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                          Available
                        </div>
                      </div>

                      {/* Doctor Info */}
                      <div className="flex-1">
                        <div className="mb-3">
                          <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            Dr. {name}
                          </h1>
                          <div className="flex items-center gap-2 mb-3">
                            <FaUserMd className="text-white/80" />
                            <span className="text-xl font-semibold text-white/90">
                              {specialization}
                            </span>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                            <img src={starIcon} alt="rating" className="w-5 h-5" />
                            <span className="font-bold text-lg">{averageRating?.toFixed(1) || '0.0'}</span>
                            <span className="text-white/80">({totalRating || 0} reviews)</span>
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-3 h-3 rounded-full mr-1 ${
                                  i < Math.floor(averageRating || 0) ? 'bg-yellow-400' : 'bg-white/30'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {yearsOfExperience > 0 && (
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <BsClock className="text-white/80" />
                                <span className="text-sm text-white/80">Experience</span>
                              </div>
                              <p className="font-semibold text-sm">{yearsOfExperience}+ years</p>
                            </div>
                          )}
                          
                          {ticketPrice && (
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm text-white/80">Consultation</span>
                              </div>
                              <p className="font-semibold text-lg">${ticketPrice}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio Section */}
                  {bio && (
                    <div className="p-6 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-headingColor mb-3 flex items-center gap-2">
                        <FaStethoscope className="text-primaryColor" />
                        Professional Summary
                      </h3>
                      <p className="text-gray-600 leading-relaxed">{bio}</p>
                    </div>
                  )}


                </div>

                {/* Navigation Tabs */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-8">
                  <div className="flex border-b border-gray-200">
                    <button
                      onClick={() => setTab("about")}
                      className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                        tab === "about"
                          ? "text-primaryColor border-b-2 border-primaryColor bg-blue-50"
                          : "text-gray-600 hover:text-primaryColor hover:bg-gray-50"
                      }`}
                    >
                      About Doctor
                    </button>
                    <button
                      onClick={() => setTab("feedback")}
                      className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                        tab === "feedback"
                          ? "text-primaryColor border-b-2 border-primaryColor bg-blue-50"
                          : "text-gray-600 hover:text-primaryColor hover:bg-gray-50"
                      }`}
                    >
                      Reviews & Feedback
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {tab === "about" && (
                      <DoctorAbout
                        name={name}
                        about={about}
                        qualifications={qualifications}
                        experiences={experiences}
                      />
                    )}
                    {tab === "feedback" && (
                      <Feedback reviews={reviews} totalRating={totalRating} />
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <SidePanel
                    doctorId={doctor._id}
                    ticketPrice={ticketPrice}
                    timeSlots={timeSlots}
                  />
                  
                  {/* Additional Info Cards */}
                  <div className="mt-6 space-y-4">
                    {/* Verification Badge */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <BsShield className="text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-800">Verified Doctor</h4>
                          <p className="text-sm text-green-600">Licensed & Board Certified</p>
                        </div>
                      </div>
                    </div>

                    {/* Awards */}
                    {qualifications?.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <BsAward className="text-blue-600 text-xl" />
                          <h4 className="font-semibold text-blue-800">Qualifications</h4>
                        </div>
                        <div className="space-y-2">
                          {qualifications.slice(0, 2).map((qual, index) => (
                            <div key={index} className="text-sm text-blue-700">
                              <p className="font-medium">{qual.degree}</p>
                              <p className="text-blue-600">{qual.university}</p>
                            </div>
                          ))}
                          {qualifications.length > 2 && (
                            <p className="text-sm text-blue-600">+{qualifications.length - 2} more</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default DoctorDetails;
