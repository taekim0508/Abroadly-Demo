import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, ProfileUpdate } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [status, setStatus] = useState<'prospective' | 'current' | 'former' | ''>('');
  const [programName, setProgramName] = useState('');
  const [programCity, setProgramCity] = useState('');
  const [programCountry, setProgramCountry] = useState('');
  const [programTerm, setProgramTerm] = useState('');

  const handleStatusSelect = (selectedStatus: 'prospective' | 'current' | 'former') => {
    setStatus(selectedStatus);
    if (selectedStatus === 'prospective') {
      // Prospective students skip to completion
      handleComplete(selectedStatus);
    } else {
      // Current and former students need to provide program info
      setStep(2);
    }
  };

  const handleComplete = async (finalStatus?: string) => {
    setSaving(true);
    setError('');

    const statusToSave = finalStatus || status;

    try {
      const profileData: ProfileUpdate = {
        study_abroad_status: statusToSave as 'prospective' | 'current' | 'former',
        onboarding_completed: true,
      };

      // Add program info for current/former students
      if (statusToSave === 'current' || statusToSave === 'former') {
        profileData.program_name = programName;
        profileData.program_city = programCity;
        profileData.program_country = programCountry;
        profileData.program_term = programTerm;
      }

      await authApi.updateProfile(profileData);
      await refreshUser();

      // If former student, redirect to write a review
      if (statusToSave === 'former') {
        setStep(3);
      } else {
        onComplete();
      }
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setError(err.response?.data?.detail || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleWriteReview = () => {
    onComplete();
    navigate('/programs');
  };

  const handleSkipReview = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-hidden bg-slate-800">
      {/* Impressionist background image */}
      <div 
        className="absolute inset-0 bg-center bg-no-repeat bg-slate-800"
        style={{ 
          backgroundImage: 'url(/images/onboarding-bg.png)',
          backgroundSize: '100%',
        }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />
      
      <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Progress indicator */}
        <div className="bg-gray-100 px-6 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Welcome to Abroadly!</span>
            <span>Step {step} of {status === 'former' ? 3 : status === 'prospective' ? 1 : 2}</span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(step / (status === 'former' ? 3 : status === 'prospective' ? 1 : 2)) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-8">
          {/* Step 1: Status Selection */}
          {step === 1 && (
            <div>
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">🌍</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  What's your study abroad journey?
                </h2>
                <p className="text-gray-600">
                  This helps us personalize your experience
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => handleStatusSelect('prospective')}
                  className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition text-left group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">🔍</span>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600">
                        I'm planning to study abroad
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Explore programs, read reviews, and connect with students
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleStatusSelect('current')}
                  className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition text-left group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">✈️</span>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-green-600">
                        I'm currently studying abroad
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Share places, plan trips, and connect with fellow students
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleStatusSelect('former')}
                  className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition text-left group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">🎓</span>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-600">
                        I've studied abroad before
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Share your experience and help future students
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Program Information */}
          {step === 2 && (
            <div>
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">
                  {status === 'current' ? '✈️' : '🎓'}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Tell us about your program
                </h2>
                <p className="text-gray-600">
                  {status === 'current' 
                    ? "Where are you studying right now?"
                    : "Where did you study abroad?"}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Program Name *
                  </label>
                  <input
                    type="text"
                    value={programName}
                    onChange={(e) => setProgramName(e.target.value)}
                    placeholder="e.g., Vanderbilt in Spain"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={programCity}
                      onChange={(e) => setProgramCity(e.target.value)}
                      placeholder="e.g., Barcelona"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      value={programCountry}
                      onChange={(e) => setProgramCountry(e.target.value)}
                      placeholder="e.g., Spain"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Term/Semester *
                  </label>
                  <select
                    value={programTerm}
                    onChange={(e) => setProgramTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select term...</option>
                    <option value="Fall 2025">Fall 2025</option>
                    <option value="Spring 2025">Spring 2025</option>
                    <option value="Summer 2025">Summer 2025</option>
                    <option value="Fall 2024">Fall 2024</option>
                    <option value="Spring 2024">Spring 2024</option>
                    <option value="Summer 2024">Summer 2024</option>
                    <option value="Fall 2023">Fall 2023</option>
                    <option value="Spring 2023">Spring 2023</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={() => handleComplete()}
                  disabled={!programName || !programCity || !programCountry || !programTerm || saving}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Continue'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Write Review (Former students only) */}
          {step === 3 && (
            <div>
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">✍️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Share your experience!
                </h2>
                <p className="text-gray-600">
                  Your review helps future students make informed decisions
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">💡</span>
                  <div>
                    <h3 className="font-bold text-purple-900 mb-1">Why write a review?</h3>
                    <ul className="text-purple-800 text-sm space-y-1">
                      <li>• Help students find the right program</li>
                      <li>• Share tips you wish you'd known</li>
                      <li>• Build your profile and connect with others</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleWriteReview}
                  className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  <span>Write a Program Review</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>

                <button
                  onClick={handleSkipReview}
                  className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition"
                >
                  I'll do this later
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
