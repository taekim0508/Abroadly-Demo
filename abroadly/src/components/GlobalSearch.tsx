// Contributors:
// AI Assistant - Global search component

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { programsApi, placesApi, tripsApi, StudyAbroadProgram, Place, Trip } from '../services/api';

interface SearchResults {
  programs: StudyAbroadProgram[];
  places: Place[];
  trips: Trip[];
}

interface GlobalSearchProps {
  isMobile?: boolean;
  onClose?: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isMobile = false, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ programs: [], places: [], trips: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mobile overlay
  useEffect(() => {
    if (isMobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMobile]);

  // Close dropdown when clicking outside (only for desktop)
  useEffect(() => {
    if (isMobile) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults({ programs: [], places: [], trips: [] });
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const [programsData, placesData, tripsData] = await Promise.all([
        programsApi.list({ search: searchQuery, limit: 3 }),
        placesApi.list({ search: searchQuery, limit: 3 }),
        tripsApi.list({ search: searchQuery, limit: 3 }),
      ]);

      setResults({
        programs: programsData.slice(0, 3),
        places: placesData.slice(0, 3),
        trips: tripsData.slice(0, 3),
      });
      
      const hasResults = programsData.length > 0 || placesData.length > 0 || tripsData.length > 0;
      setIsOpen(hasResults || searchQuery.length >= 2);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, performSearch]);

  const handleResultClick = (type: 'programs' | 'places' | 'trips', id: number) => {
    setQuery('');
    setIsOpen(false);
    onClose?.();
    navigate(`/${type}/${id}`);
  };

  const hasResults = results.programs.length > 0 || results.places.length > 0 || results.trips.length > 0;

  return (
    <div ref={searchRef} className={`relative ${isMobile ? 'w-full' : ''}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className={`w-4 h-4 ${isLoading ? 'text-gray-400 animate-pulse' : 'text-gray-400'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Search programs, places, trips..."
          className={`
            ${isMobile ? 'w-full' : 'w-64'}
            pl-9 pr-4 py-2 
            bg-gray-50 border border-gray-200 
            rounded-lg text-sm text-gray-700
            placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent
            transition-all duration-200
          `}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className={`
          absolute ${isMobile ? 'left-0 right-0' : 'right-0'} 
          mt-2 ${isMobile ? 'w-full' : 'w-80'} 
          bg-white rounded-lg shadow-xl border border-gray-100 
          max-h-96 overflow-y-auto z-50
        `}>
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
              <span className="ml-2">Searching...</span>
            </div>
          ) : !hasResults && query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              No results found for "{query}"
            </div>
          ) : (
            <div className="py-2">
              {/* Programs Section */}
              {results.programs.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    Programs
                  </div>
                  {results.programs.map((program) => (
                    <button
                      key={program.id}
                      onClick={() => handleResultClick('programs', program.id)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{program.program_name}</div>
                        <div className="text-xs text-gray-500 truncate">{program.city}, {program.country}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Places Section */}
              {results.places.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    Places
                  </div>
                  {results.places.map((place) => (
                    <button
                      key={place.id}
                      onClick={() => handleResultClick('places', place.id)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{place.name}</div>
                        <div className="text-xs text-gray-500 truncate">{place.category} • {place.city}, {place.country}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Trips Section */}
              {results.trips.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    Trips
                  </div>
                  {results.trips.map((trip) => (
                    <button
                      key={trip.id}
                      onClick={() => handleResultClick('trips', trip.id)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{trip.destination}</div>
                        <div className="text-xs text-gray-500 truncate">{trip.trip_type ? `${trip.trip_type} • ` : ''}{trip.country}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;

