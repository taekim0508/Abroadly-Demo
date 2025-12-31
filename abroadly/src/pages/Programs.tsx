// Contributors:
// Gordon Song - Program Setup (1 hr)
// Tae Kim - Program Page Enhancements (1 hr)

import React, { useState, useEffect } from 'react';
import { programsApi, StudyAbroadProgram } from '../services/api';
import ProgramCard from '../components/ProgramCard';
import { useBookmarks } from '../hooks/useBookmarks';

const Programs: React.FC = () => {
  const [programs, setPrograms] = useState<StudyAbroadProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const { isBookmarked, toggleBookmark } = useBookmarks();
  
  // Post Program Modal State
  const [showPostModal, setShowPostModal] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');
  const [newProgram, setNewProgram] = useState({
    program_name: '',
    institution: '',
    city: '',
    country: '',
    cost: '',
    housing_type: '',
    location: '',
    duration: '',
    description: '',
  });

  useEffect(() => {
    fetchPrograms();
  }, [cityFilter, countryFilter]);

  const fetchPrograms = async () => {
    setLoading(true);
    setError('');
    try {
      const filters: any = {};
      if (cityFilter) filters.city = cityFilter;
      if (countryFilter) filters.country = countryFilter;
      
      const data = await programsApi.list(filters);
      setPrograms(data);
    } catch (err: any) {
      setError('More Countries Coming Soon!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const uniqueCities = Array.from(new Set(programs.map(p => p.city))).sort();
  const uniqueCountries = Array.from(new Set(programs.map(p => p.country))).sort();

  const handlePostProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    setPostError('');
    
    try {
      const programData = {
        ...newProgram,
        cost: newProgram.cost ? parseFloat(newProgram.cost) : undefined,
      };
      await programsApi.create(programData);
      setShowPostModal(false);
      setNewProgram({
        program_name: '',
        institution: '',
        city: '',
        country: '',
        cost: '',
        housing_type: '',
        location: '',
        duration: '',
        description: '',
      });
      fetchPrograms();
    } catch (err: any) {
      setPostError(err.response?.data?.detail || 'Failed to post program. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Study Abroad Programs</h1>
            <p className="text-gray-600 text-lg">
              Discover programs worldwide with authentic student reviews
            </p>
          </div>
          <button
            onClick={() => setShowPostModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition flex items-center gap-2 shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Post a Program</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                id="country"
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="">All Countries</option>
                {uniqueCountries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <select
                id="city"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="">All Cities</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setCityFilter('');
                  setCountryFilter('');
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        ) : programs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Programs Found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or check back later for new programs.
            </p>
            <button
              onClick={() => {
                setCityFilter('');
                setCountryFilter('');
              }}
              className="bg-gray-900 hover:bg-black text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              Found {programs.length} program{programs.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => (
                <ProgramCard 
                  key={program.id} 
                  program={program} 
                  isBookmarked={isBookmarked('program', program.id)}
                  onToggleBookmark={(bookmarked) => toggleBookmark('program', program.id, bookmarked)}
                />
              ))}
            </div>
          </>
        )}

        {/* Post Program Modal */}
        {showPostModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Post a Program</h2>
                  <button
                    onClick={() => setShowPostModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handlePostProgram}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Program Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newProgram.program_name}
                        onChange={(e) => setNewProgram({ ...newProgram, program_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Oxford Summer Program"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Institution *
                        </label>
                        <input
                          type="text"
                          required
                          value={newProgram.institution}
                          onChange={(e) => setNewProgram({ ...newProgram, institution: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., University of Oxford"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={newProgram.city}
                          onChange={(e) => setNewProgram({ ...newProgram, city: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Oxford"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country *
                        </label>
                        <input
                          type="text"
                          required
                          value={newProgram.country}
                          onChange={(e) => setNewProgram({ ...newProgram, country: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., United Kingdom"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cost (USD)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={newProgram.cost}
                          onChange={(e) => setNewProgram({ ...newProgram, cost: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 8500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={newProgram.duration}
                          onChange={(e) => setNewProgram({ ...newProgram, duration: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 8 weeks, 1 semester"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Housing Type
                        </label>
                        <input
                          type="text"
                          value={newProgram.housing_type}
                          onChange={(e) => setNewProgram({ ...newProgram, housing_type: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Dormitory, Apartment"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={newProgram.location}
                        onChange={(e) => setNewProgram({ ...newProgram, location: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., City center, Near campus"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        value={newProgram.description}
                        onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Share details about the program..."
                      />
                    </div>

                    {postError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {postError}
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowPostModal(false)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={posting}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
                      >
                        {posting ? "Posting..." : "Post Program"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Programs;

