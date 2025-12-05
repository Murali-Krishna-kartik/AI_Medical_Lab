import React from "react";
import starIcon from "../../assets/images/Star.png";
import { Link } from "react-router-dom";
import { BsArrowRight, BsCalendarCheck, BsClock } from "react-icons/bs";
import { FaUserMd, FaGraduationCap } from "react-icons/fa";

const DoctorCard = ({ doctor, viewMode = "grid" }) => {
  const {
    _id,
    name,
    photo,
    specialization,
    experiences = [],
    qualifications = [],
    avgRating,
    averageRating,
    totalRating,
    ticketPrice,
    bio,
  } = doctor;

  const rating = avgRating ?? averageRating ?? 0;
  const hospital = experiences[0]?.hospital || "Medical Center";
  const yearsOfExperience = experiences.length;
  const latestQualification = qualifications[0]?.degree || "Medical Degree";

  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primaryColor/20">
        <div className="flex flex-col md:flex-row">
          {/* Doctor Image */}
          <div className="md:w-48 flex-shrink-0">
            <div className="relative h-48 md:h-full">
              <img 
                src={photo} 
                className="w-full h-full object-cover" 
                alt={name}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/300x200/CCF0F3/0066FF?text=Doctor";
                }}
              />
              <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                Available
              </div>
            </div>
          </div>

          {/* Doctor Info */}
          <div className="flex-1 p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
              <div className="flex-1">
                {/* Name & Specialization */}
                <div className="mb-3">
                  <h3 className="text-2xl font-bold text-headingColor mb-1">
                    Dr. {name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <FaUserMd className="text-primaryColor text-sm" />
                    <span className="bg-gradient-to-r from-primaryColor to-blue-600 bg-clip-text text-transparent font-semibold">
                      {specialization}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1">
                    <img src={starIcon} alt="rating" className="w-4 h-4" />
                    <span className="font-semibold text-headingColor">{rating.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-500 text-sm">({totalRating || 0} reviews)</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full mr-1 ${
                          i < Math.floor(rating) ? 'bg-yellow-400' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  {yearsOfExperience > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BsClock className="text-primaryColor" />
                      <span>{yearsOfExperience}+ years experience</span>
                    </div>
                  )}
                  
                  {latestQualification && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaGraduationCap className="text-primaryColor" />
                      <span>{latestQualification}</span>
                    </div>
                  )}

                  {ticketPrice && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-primaryColor font-semibold">${ticketPrice}</span>
                      <span>consultation fee</span>
                    </div>
                  )}
                </div>

                {/* Bio Preview */}
                {bio && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {bio}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 md:ml-6 mt-4 md:mt-0">
                <Link
                  to={`/doctors/${_id}`}
                  className="bg-primaryColor text-white py-2.5 px-6 rounded-lg font-medium text-center hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <BsCalendarCheck className="text-sm" />
                  Book Appointment
                </Link>
                <Link
                  to={`/doctors/${_id}`}
                  className="border-2 border-primaryColor text-primaryColor py-2.5 px-6 rounded-lg font-medium text-center hover:bg-primaryColor hover:text-white transition-all duration-200 whitespace-nowrap"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primaryColor/20">
      {/* Doctor Image & Status */}
      <div className="relative">
        <div className="aspect-w-4 aspect-h-3 bg-gradient-to-br from-blue-50 to-indigo-100">
          <img 
            src={photo} 
            className="w-full h-48 object-cover" 
            alt={name}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/300x200/CCF0F3/0066FF?text=Doctor";
            }}
          />
        </div>
        <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          Available
        </div>
        {ticketPrice && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-primaryColor px-3 py-1 rounded-full text-sm font-semibold">
            ${ticketPrice}
          </div>
        )}
      </div>

      {/* Doctor Info */}
      <div className="p-5">
        {/* Name & Specialization */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-headingColor mb-1 line-clamp-1">
            Dr. {name}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <FaUserMd className="text-primaryColor text-sm" />
            <span className="bg-gradient-to-r from-primaryColor to-blue-600 bg-clip-text text-transparent font-semibold text-sm">
              {specialization}
            </span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <img src={starIcon} alt="rating" className="w-4 h-4" />
            <span className="font-semibold text-headingColor">{rating.toFixed(1)}</span>
          </div>
          <span className="text-gray-500 text-sm">({totalRating || 0} reviews)</span>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full mr-1 ${
                  i < Math.floor(rating) ? 'bg-yellow-400' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Quick Info */}
        <div className="space-y-2 mb-4">
          {yearsOfExperience > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BsClock className="text-primaryColor" />
              <span>{yearsOfExperience}+ years experience</span>
            </div>
          )}
          
          {latestQualification && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaGraduationCap className="text-primaryColor" />
              <span className="line-clamp-1">{latestQualification}</span>
            </div>
          )}
        </div>

        {/* Bio Preview */}
        {bio && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {bio}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            to={`/doctors/${_id}`}
            className="flex-1 bg-primaryColor text-white py-2.5 px-4 rounded-lg font-medium text-center hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <BsCalendarCheck className="text-sm" />
            View Profile
          </Link>
          <Link
            to={`/doctors/${_id}`}
            className="w-12 h-10 rounded-lg border-2 border-primaryColor text-primaryColor flex items-center justify-center hover:bg-primaryColor hover:text-white transition-all duration-200 group"
          >
            <BsArrowRight className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
