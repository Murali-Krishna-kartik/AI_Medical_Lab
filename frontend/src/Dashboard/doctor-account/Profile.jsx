import { useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";
import { BASE_URL } from "../../config.js";
import { toast } from "react-toastify";
import { getToken } from "../../utils/tokenManager";

const Profile = ({ doctorData }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    bio: "",
    gender: "",
    specialization: "",
    ticketPrice: 0,
    qualifications: [],
    experiences: [],
    about: "",
    photo: "" || null,
  });

  useEffect(() => {
    setFormData({
      name: doctorData?.name,
      email: doctorData?.email,
      phone: doctorData?.phone,
      bio: doctorData?.bio,
      gender: doctorData?.gender,
      specialization: doctorData?.specialization,
      ticketPrice: doctorData?.ticketPrice,
      qualifications: doctorData?.qualifications,
      experiences: doctorData?.experiences,
      about: doctorData?.about,
      photo: doctorData?.photo,
    });
  }, [doctorData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number
    if (name === "phone") {
      // Remove any non-digit characters
      const numericValue = value.replace(/\D/g, '');
      
      // Limit to 10 digits
      if (numericValue.length <= 10) {
        setFormData({ ...formData, [name]: numericValue });
      }
      return;
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleFileInputChange = async (e) => {
    const file = e.target.files[0];
    const data = await uploadImageToCloudinary(file);

    setFormData({ ...formData, photo: data?.url });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    // Validate phone number before submission
    if (!formData.phone || formData.phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    // Validate that phone number contains only digits
    if (!/^\d{10}$/.test(formData.phone)) {
      toast.error("Phone number must contain only digits");
      return;
    }

    try {
      const token = getToken();
      
      if (!token) {
        throw new Error("No authentication token available");
      }
      
      console.log("🔍 Making update request to:", `${BASE_URL}/doctors/${doctorData._id}`);
      console.log("🔍 Token exists:", !!token);
      
      const res = await fetch(`${BASE_URL}/doctors/${doctorData._id}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) {
        throw Error(result.message);
      }

      // If the update was successful, show a toast message
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  //reuseable function for adding item
  const addItem = (key, item) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [key]: [...prevFormData[key], item],
    }));
  };

  //reuseable input change function
  const handleReuseableInputChange = (key, index, event) => {
    const { name, value } = event.target;

    setFormData((prevFormData) => {
      const updateItems = [...prevFormData[key]];

      updateItems[index][name] = value;

      return {
        ...prevFormData,
        [key]: updateItems,
      };
    });
  };

  //reuseable function for deleting item
  const deleteItem = (key, index) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [key]: prevFormData[key].filter((_, i) => i !== index),
    }));
  };

  const addQualification = (e) => {
    e.preventDefault();

    addItem("qualifications", {
      startingDate: "",
      endingDate: "",
      degree: "BS-CS",
      university: "University of Gujrat",
    });
  };

  const handleQualificationChange = (event, index) => {
    handleReuseableInputChange("qualifications", index, event);
  };

  const deleteQualification = (e, index) => {
    e.preventDefault();
    deleteItem("qualifications", index);
  };

  const addExperience = (e) => {
    e.preventDefault();

    addItem("experiences", {
      startingDate: "",
      endingDate: "",
      position: "Senior Surgeon",
      hospital: "City Hospital",
    });
  };

  const handleExperienceChange = (event, index) => {
    handleReuseableInputChange("experiences", index, event);
  };

  const deleteExperience = (e, index) => {
    e.preventDefault();
    deleteItem("experiences", index);
  };



  return (
    <div>
      <h2 className="text-headingColor font-bold text-[24px] leading-9 mb-10">
        Profile Information
      </h2>

      <form>
        <div className="mb-5">
          <p className="form__label">Name*</p>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Full Name"
            className="form__input"
          />
        </div>

        <div className="mb-5">
          <p className="form__label">Email*</p>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
            className="form__input"
            readOnly
            aria-readonly
            disabled={true}
          />
        </div>

        <div className="mb-5">
          <p className="form__label">Phone* (10 digits only)</p>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="1234567890"
            className="form__input"
            pattern="[0-9]{10}"
            maxLength="10"
            minLength="10"
            title="Please enter exactly 10 digits"
          />
          {formData.phone && formData.phone.length < 10 && (
            <p className="text-red-500 text-sm mt-1">
              Phone number must be exactly 10 digits ({formData.phone.length}/10)
            </p>
          )}
        </div>

        <div className="mb-5">
          <p className="form__label">Bio*</p>
          <input
            type="text"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Bio"
            className="form__input"
            maxLength={100}
          />
        </div>

        <div className="mb-5">
          <div className="grid grid-cols-3 gap-5 mb-[30px]">
            <div>
              <p className="form__label">Gender*</p>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="form__input py-3.5"
              >
                <option value="select">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <p className="form__label">Specialization*</p>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                className="form__input py-3.5"
              >
                <option value="select">Select</option>
                <option value="General Doctor">General Doctor</option>
                <option value="Surgeon">Surgeon</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Orthopedic">Orthopedic</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Psychiatrist">Psychiatrist</option>
                <option value="Ophthalmologist">Ophthalmologist</option>
                <option value="ENT Specialist">ENT Specialist</option>
                <option value="Radiologist">Radiologist</option>
                <option value="Anesthesiologist">Anesthesiologist</option>
              </select>
            </div>

            <div>
              <p className="form__label">Ticket Price</p>
              <input
                type="number"
                placeholder="100"
                name="ticketPrice"
                value={formData.ticketPrice}
                onChange={handleInputChange}
                className="form__input"
              />
            </div>
          </div>
        </div>

        <div className="mb-5">
          <p className="form__label">Qualification*</p>
          {formData.qualifications?.map((item, index) => (
            <div key={index}>
              <div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <p className="form__label">Starting Date*</p>
                    <input
                      type="date"
                      name="startingDate"
                      value={item.startingDate}
                      max={new Date().toISOString().split('T')[0]}
                      className="form__input"
                      onChange={(e) => handleQualificationChange(e, index)}
                    />
                  </div>

                  <div>
                    <p className="form__label">Ending Date*</p>
                    <input
                      type="date"
                      name="endingDate"
                      value={item.endingDate}
                      max={new Date().toISOString().split('T')[0]}
                      className="form__input"
                      onChange={(e) => handleQualificationChange(e, index)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 mt-5">
                  <div>
                    <p className="form__label">Degree*</p>
                    <input
                      type="text"
                      name="degree"
                      value={item.degree}
                      className="form__input"
                      onChange={(e) => handleQualificationChange(e, index)}
                    />
                  </div>

                  <div>
                    <p className="form__label">University*</p>
                    <input
                      type="text"
                      name="university"
                      value={item.university}
                      className="form__input"
                      onChange={(e) => handleQualificationChange(e, index)}
                    />
                  </div>
                </div>

                <button
                  onClick={(e) => deleteQualification(e, index)}
                  className="bg-red-500 p-2 rounded-full text-white text-[18px] mt-2 mb-[30px]"
                >
                  <AiOutlineDelete />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addQualification}
            className="bg-[#000] py-2 px-5 rounded text-white h-fit cursor-pointer"
          >
            Add Qualification
          </button>
        </div>

        <div className="mb-5">
          <p className="form__label">Experience*</p>
          {formData.experiences?.map((item, index) => (
            <div key={index}>
              <div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <p className="form__label">Starting Date*</p>
                    <input
                      type="date"
                      name="startingDate"
                      value={item.startingDate}
                      max={new Date().toISOString().split('T')[0]}
                      className="form__input"
                      onChange={(e) => handleExperienceChange(e, index)}
                    />
                  </div>

                  <div>
                    <p className="form__label">Ending Date*</p>
                    <input
                      type="date"
                      name="endingDate"
                      value={item.endingDate}
                      max={new Date().toISOString().split('T')[0]}
                      className="form__input"
                      onChange={(e) => handleExperienceChange(e, index)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 mt-5">
                  <div>
                    <p className="form__label">Position*</p>
                    <input
                      type="text"
                      name="position"
                      value={item.position}
                      className="form__input"
                      onChange={(e) => handleExperienceChange(e, index)}
                    />
                  </div>

                  <div>
                    <p className="form__label">Hospital*</p>
                    <input
                      type="text"
                      name="hospital"
                      value={item.hospital}
                      className="form__input"
                      onChange={(e) => handleExperienceChange(e, index)}
                    />
                  </div>
                </div>

                <button
                  onClick={(e) => deleteExperience(e, index)}
                  className="bg-red-500 p-2 rounded-full text-white text-[18px] mt-2 mb-[30px]"
                >
                  <AiOutlineDelete />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addExperience}
            className="bg-[#000] py-2 px-5 rounded text-white h-fit cursor-pointer"
          >
            Add Experience
          </button>
        </div>



        <div className="mb-5">
          <p className="form__label">About*</p>
          <textarea
            name="about"
            rows={5}
            value={formData.about}
            placeholder="write about yourself..."
            onChange={handleInputChange}
            className="form__input"
          ></textarea>
        </div>

        <div className="mb-5 flex items-center gap-3">
          {formData.photo && (
            <figure className="w-[60px] h-[60px] rounded-full border-2 border-solid border-primaryColor flex items-center justify-center">
              <img
                src={formData.photo}
                className="w-full rounded-full"
                alt=""
              />
            </figure>
          )}

          <div className="relative w-[130px] h-[50px]">
            <input
              type="file"
              name="photo"
              id="customFile"
              accept=".jpg,.png"
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileInputChange}
            />
            <label
              htmlFor="customFile"
              className="absolute top-0 left-0 w-full h-full flex items-center px-[0.75rem] py-[0.375rem] text-[15px] leading-6 overflow-hidden bg-[#0066ff46] text-headingColor font-semibold rounded-lg truncate cursor-pointer"
            >
              Upload Photo
            </label>
          </div>
        </div>

        <div className="mt-7">
          <button
            type="submit"
            onClick={handleUpdateProfile}
            className="bg-primaryColor text-white text-[18px] leading-[30px] w-full py-3 px-4 rounded-lg"
          >
            Update Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
