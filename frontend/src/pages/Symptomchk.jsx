import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../config";

const Symptomchk = () => {
  const [symptoms, setSymptoms] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [description, setDescription] = useState("");
  const [precaution, setPrecaution] = useState("");
  const [medications, setMedications] = useState("");
  const [workout, setWorkout] = useState("");
  const [diets, setDiets] = useState("");
  const [disease, setDisease] = useState("");
  const [serverStatus, setServerStatus] = useState("checking");

  const [isDesVisible, setIsDesVisible] = useState(false);
  const [isPrecautionVisible, setIsPrecautionVisible] = useState(false);
  const [isMedicationsVisible, setIsMedicationsVisible] = useState(false);
  const [isWorkoutVisible, setIsWorkoutVisible] = useState(false);
  const [isDietsVisible, setIsDietsVisible] = useState(false);
  const [isDiseaseVisible, setIsDiseaseVisible] = useState(false);

  // Complete symptoms list from AI model (matches backend symptoms_dict)
  const allSymptoms = [
    'itching', 'skin_rash', 'nodal_skin_eruptions', 'continuous_sneezing', 'shivering', 
    'chills', 'joint_pain', 'stomach_pain', 'acidity', 'ulcers_on_tongue', 'muscle_wasting', 
    'vomiting', 'burning_micturition', 'spotting_ urination', 'fatigue', 'weight_gain', 
    'anxiety', 'cold_hands_and_feets', 'mood_swings', 'weight_loss', 'restlessness', 
    'lethargy', 'patches_in_throat', 'irregular_sugar_level', 'cough', 'high_fever', 
    'sunken_eyes', 'breathlessness', 'sweating', 'dehydration', 'indigestion', 'headache', 
    'yellowish_skin', 'dark_urine', 'nausea', 'loss_of_appetite', 'pain_behind_the_eyes', 
    'back_pain', 'constipation', 'abdominal_pain', 'diarrhoea', 'mild_fever', 'yellow_urine', 
    'yellowing_of_eyes', 'acute_liver_failure', 'fluid_overload', 'swelling_of_stomach', 
    'swelled_lymph_nodes', 'malaise', 'blurred_and_distorted_vision', 'phlegm', 
    'throat_irritation', 'redness_of_eyes', 'sinus_pressure', 'runny_nose', 'congestion', 
    'chest_pain', 'weakness_in_limbs', 'fast_heart_rate', 'pain_during_bowel_movements', 
    'pain_in_anal_region', 'bloody_stool', 'irritation_in_anus', 'neck_pain', 'dizziness', 
    'cramps', 'bruising', 'obesity', 'swollen_legs', 'swollen_blood_vessels', 
    'puffy_face_and_eyes', 'enlarged_thyroid', 'brittle_nails', 'swollen_extremeties', 
    'excessive_hunger', 'extra_marital_contacts', 'drying_and_tingling_lips', 'slurred_speech', 
    'knee_pain', 'hip_joint_pain', 'muscle_weakness', 'stiff_neck', 'swelling_joints', 
    'movement_stiffness', 'spinning_movements', 'loss_of_balance', 'unsteadiness', 
    'weakness_of_one_body_side', 'loss_of_smell', 'bladder_discomfort', 'foul_smell_of urine', 
    'continuous_feel_of_urine', 'passage_of_gases', 'internal_itching', 'toxic_look_(typhos)', 
    'depression', 'irritability', 'muscle_pain', 'altered_sensorium', 'red_spots_over_body', 
    'belly_pain', 'abnormal_menstruation', 'dischromic _patches', 'watering_from_eyes', 
    'increased_appetite', 'polyuria', 'family_history', 'mucoid_sputum', 'rusty_sputum', 
    'lack_of_concentration', 'visual_disturbances', 'receiving_blood_transfusion', 
    'receiving_unsterile_injections', 'coma', 'stomach_bleeding', 'distention_of_abdomen', 
    'history_of_alcohol_consumption', 'fluid_overload.1', 'blood_in_sputum', 
    'prominent_veins_on_calf', 'palpitations', 'painful_walking', 'pus_filled_pimples', 
    'blackheads', 'scurring', 'skin_peeling', 'silver_like_dusting', 'small_dents_in_nails', 
    'inflammatory_nails', 'blister', 'red_sore_around_nose', 'yellow_crust_ooze'
  ];

  // State for symptom search and filtering
  const [symptomSearch, setSymptomSearch] = useState("");
  const [filteredSymptoms, setFilteredSymptoms] = useState(allSymptoms.slice(0, 30)); // Show first 30 initially

  const toggleDescriptionVisibility = () => {
    setIsDesVisible(!isDesVisible);
  };

  const togglePrecautionVisibility = () => {
    setIsPrecautionVisible(!isPrecautionVisible);
  };
  const toggleMedicationVisibility = () => {
    setIsMedicationsVisible(!isMedicationsVisible);
  };
  const toggleWorkoutVisibility = () => {
    setIsWorkoutVisible(!isWorkoutVisible);
  };
  const toggleDietsVisibility = () => {
    setIsDietsVisible(!isDietsVisible);
  };
  const toggleDiseaseVisibility = () => {
    setIsDiseaseVisible(!isDiseaseVisible);
  };

  // Check server status on component mount
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        await axios.get(`${BASE_URL.replace('/api/v1', '')}/`);
        setServerStatus("online");
      } catch (error) {
        setServerStatus("offline");
        setErrorMessage("Backend server is not running. Please start the server first.");
      }
    };
    checkServerStatus();
  }, []);

  // Filter symptoms based on search
  useEffect(() => {
    if (symptomSearch.trim() === "") {
      setFilteredSymptoms(allSymptoms.slice(0, 30)); // Show first 30 initially
    } else {
      const filtered = allSymptoms.filter(symptom =>
        symptom.toLowerCase().includes(symptomSearch.toLowerCase())
      );
      setFilteredSymptoms(filtered.slice(0, 50)); // Show up to 50 matches
    }
  }, [symptomSearch]);

  // Handle symptom selection from dropdown
  const handleSymptomSelect = (symptom) => {
    if (!selectedSymptoms.includes(symptom)) {
      const newSymptoms = [...selectedSymptoms, symptom];
      setSelectedSymptoms(newSymptoms);
      setSymptoms(newSymptoms.join(', '));
      setSymptomSearch(""); // Clear search after selection
    }
  };

  // Remove selected symptom
  const removeSymptom = (symptom) => {
    const newSymptoms = selectedSymptoms.filter(s => s !== symptom);
    setSelectedSymptoms(newSymptoms);
    setSymptoms(newSymptoms.join(', '));
  };

  // Clear all results
  const clearResults = () => {
    setDescription("");
    setPrecaution("");
    setMedications("");
    setWorkout("");
    setDiets("");
    setDisease("");
    setIsDesVisible(false);
    setIsPrecautionVisible(false);
    setIsMedicationsVisible(false);
    setIsWorkoutVisible(false);
    setIsDietsVisible(false);
    setIsDiseaseVisible(false);
  };

  const handlePrediction = async (e) => {
    e.preventDefault();
    
    if (!symptoms.trim()) {
      setErrorMessage("Please enter at least one symptom.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    clearResults();

    try {
      console.log("Sending symptoms:", symptoms);
      const response = await axios.post(`${BASE_URL}/symptoms`, {
        data: symptoms,
      });
      
      console.log("Response:", response.data);
      
      if (response.data && response.data.data) {
        setDescription(response.data.data.dis_des || "No description available");
        setPrecaution(response.data.data.my_precautions || "No precautions available");
        setMedications(response.data.data.medications || "No medications available");
        setWorkout(response.data.data.workout || "No workout recommendations available");
        setDiets(response.data.data.rec_diet || "No diet recommendations available");
        setDisease(response.data.data.predicted_disease || "Unknown");
        
        // Auto-show disease result
        setIsDiseaseVisible(true);
      } else {
        setErrorMessage("Invalid response from server. Please try again.");
      }
    } catch (error) {
      console.error("Prediction error:", error);
      if (error.code === 'ERR_NETWORK' || error.message.includes('ERR_CONNECTION_REFUSED')) {
        setErrorMessage("Cannot connect to server. Please make sure the backend server is running on port 5000.");
        setServerStatus("offline");
      } else if (error.response) {
        setErrorMessage(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
      } else {
        setErrorMessage("Failed to fetch prediction. Please check your connection and try again.");
      }
    }

    setIsLoading(false);
  };

  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <div className="px-4 mx-auto max-w-screen-lg">
        <h2 className="heading text-center mb-8">AI Health Symptom Checker</h2>
        
        {/* Server Status Indicator */}
        <div className="mb-6 text-center">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            serverStatus === 'online' ? 'bg-green-100 text-green-800' :
            serverStatus === 'offline' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              serverStatus === 'online' ? 'bg-green-500' :
              serverStatus === 'offline' ? 'bg-red-500' :
              'bg-yellow-500'
            }`}></div>
            Server Status: {serverStatus === 'online' ? 'Connected' : 
                           serverStatus === 'offline' ? 'Disconnected' : 'Checking...'}
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errorMessage}
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <form onSubmit={handlePrediction} className="space-y-6">
            
            {/* Symptom Input Section */}
            <div>
              <label htmlFor="symptoms" className="block text-xl font-bold text-gray-700 mb-4">
                Enter Your Symptoms:
              </label>
              
              {/* Symptom Search */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Search and select symptoms (only predefined symptoms are allowed):</p>
                <input
                  type="text"
                  placeholder="Search symptoms... (e.g., headache, fever, cough)"
                  value={symptomSearch}
                  onChange={(e) => setSymptomSearch(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Available Symptoms */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Available symptoms ({filteredSymptoms.length} {symptomSearch ? 'found' : 'showing'}):
                </p>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 border rounded-lg bg-gray-50">
                  {filteredSymptoms.map((symptom) => (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => handleSymptomSelect(symptom)}
                      disabled={selectedSymptoms.includes(symptom)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        selectedSymptoms.includes(symptom)
                          ? 'bg-blue-500 text-white border-blue-500 cursor-not-allowed'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                      }`}
                    >
                      {symptom.replace(/_/g, ' ')}
                    </button>
                  ))}
                  {filteredSymptoms.length === 0 && symptomSearch && (
                    <p className="text-gray-500 italic">No symptoms found matching "{symptomSearch}"</p>
                  )}
                </div>
              </div>

              {/* Selected Symptoms Display */}
              {selectedSymptoms.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Selected symptoms:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map((symptom) => (
                      <span
                        key={symptom}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {symptom.replace(/_/g, ' ')}
                        <button
                          type="button"
                          onClick={() => removeSymptom(symptom)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Read-only Selected Symptoms Display */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Symptoms for Analysis:
                </label>
                <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 min-h-[100px] text-lg">
                  {symptoms || (
                    <span className="text-gray-500 italic">
                      No symptoms selected. Please use the search and select buttons above to choose symptoms.
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Only predefined symptoms from our medical database are accepted for accurate AI diagnosis.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isLoading || serverStatus === 'offline' || !symptoms.trim()}
                className={`px-8 py-3 text-lg font-semibold rounded-lg transition-colors ${
                  isLoading || serverStatus === 'offline' || !symptoms.trim()
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing Symptoms...
                  </div>
                ) : (
                  'Get AI Diagnosis'
                )}
              </button>
            </div>
          </form>
        </div>
        {/* Results Section */}
        {description && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
              🤖 AI Diagnosis Results
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Disease Card */}
              <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg p-4 text-white">
                <button
                  onClick={toggleDiseaseVisibility}
                  className="w-full text-left font-bold text-lg flex items-center justify-between hover:opacity-90 transition-opacity"
                >
                  🏥 Predicted Disease
                  <span className="text-2xl">{isDiseaseVisible ? '−' : '+'}</span>
                </button>
                {isDiseaseVisible && (
                  <div className="mt-3 p-3 bg-white bg-opacity-20 rounded text-white font-medium">
                    {disease}
                  </div>
                )}
              </div>

              {/* Description Card */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                <button
                  onClick={toggleDescriptionVisibility}
                  className="w-full text-left font-bold text-lg flex items-center justify-between hover:opacity-90 transition-opacity"
                >
                  📋 Description
                  <span className="text-2xl">{isDesVisible ? '−' : '+'}</span>
                </button>
                {isDesVisible && (
                  <div className="mt-3 p-3 bg-white bg-opacity-20 rounded text-white text-sm">
                    {description}
                  </div>
                )}
              </div>

              {/* Precautions Card */}
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                <button
                  onClick={togglePrecautionVisibility}
                  className="w-full text-left font-bold text-lg flex items-center justify-between hover:opacity-90 transition-opacity"
                >
                  ⚠️ Precautions
                  <span className="text-2xl">{isPrecautionVisible ? '−' : '+'}</span>
                </button>
                {isPrecautionVisible && (
                  <div className="mt-3 p-3 bg-white bg-opacity-20 rounded text-white text-sm">
                    {precaution}
                  </div>
                )}
              </div>

              {/* Medications Card */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
                <button
                  onClick={toggleMedicationVisibility}
                  className="w-full text-left font-bold text-lg flex items-center justify-between hover:opacity-90 transition-opacity"
                >
                  💊 Medications
                  <span className="text-2xl">{isMedicationsVisible ? '−' : '+'}</span>
                </button>
                {isMedicationsVisible && (
                  <div className="mt-3 p-3 bg-white bg-opacity-20 rounded text-white text-sm">
                    {medications}
                  </div>
                )}
              </div>

              {/* Workouts Card */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                <button
                  onClick={toggleWorkoutVisibility}
                  className="w-full text-left font-bold text-lg flex items-center justify-between hover:opacity-90 transition-opacity"
                >
                  🏃‍♂️ Workouts
                  <span className="text-2xl">{isWorkoutVisible ? '−' : '+'}</span>
                </button>
                {isWorkoutVisible && (
                  <div className="mt-3 p-3 bg-white bg-opacity-20 rounded text-white text-sm">
                    {workout}
                  </div>
                )}
              </div>

              {/* Diets Card */}
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
                <button
                  onClick={toggleDietsVisibility}
                  className="w-full text-left font-bold text-lg flex items-center justify-between hover:opacity-90 transition-opacity"
                >
                  🥗 Diet Plan
                  <span className="text-2xl">{isDietsVisible ? '−' : '+'}</span>
                </button>
                {isDietsVisible && (
                  <div className="mt-3 p-3 bg-white bg-opacity-20 rounded text-white text-sm">
                    {diets}
                  </div>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-yellow-800 font-medium">Medical Disclaimer</h4>
                  <p className="text-yellow-700 text-sm mt-1">
                    This AI diagnosis is for informational purposes only and should not replace professional medical advice. 
                    Please consult with a qualified healthcare provider for proper diagnosis and treatment.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={clearResults}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                🔄 New Diagnosis
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                🖨️ Print Results
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Symptomchk;
