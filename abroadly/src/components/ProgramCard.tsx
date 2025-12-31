// Contributors:
// Gordon Song - Setup (.5 hr)
// Tae Kim - Enhancements (.5 hr)

import React from 'react';
import { Link } from 'react-router-dom';
import { StudyAbroadProgram } from '../services/api';
import BookmarkButton from './BookmarkButton';

interface ProgramCardProps {
  program: StudyAbroadProgram;
  isBookmarked?: boolean;
  onToggleBookmark?: (bookmarked: boolean) => void;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program, isBookmarked = false, onToggleBookmark }) => {
  return (
    <div className="relative bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Bookmark button in top right */}
      <div className="absolute top-3 right-3 z-10">
        <BookmarkButton 
          type="program" 
          itemId={program.id} 
          initialBookmarked={isBookmarked}
          onToggle={onToggleBookmark}
        />
      </div>
      
      <Link
        to={`/programs/${program.id}`}
        className="block p-6 pr-14"
      >
      <div>
        <div className="flex justify-between items-start mb-3 gap-2">
          <h3 className="text-xl font-bold text-gray-900 hover:text-gray-600 transition flex-1">
            {program.program_name}
          </h3>
          {program.cost !== undefined && program.cost !== null && (
            <span className="bg-gray-200 text-gray-900 text-sm font-semibold px-3 py-1 rounded-full shrink-0">
              ${program.cost.toLocaleString()}
            </span>
          )}
        </div>

        <p className="text-gray-700 font-medium mb-2">{program.institution}</p>

        {/* Rating Display */}
        <div className="flex items-center mb-3">
          {program.average_rating ? (
            <div className="flex items-center">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-700">
                {program.average_rating.toFixed(1)}
              </span>
              <span className="ml-1 text-sm text-gray-500">
                ({program.review_count} {program.review_count === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-400 italic">No reviews yet</span>
          )}
        </div>

        <div className="flex items-center text-gray-600 text-sm mb-4">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{program.city}, {program.country}</span>
        </div>

        {program.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {program.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {program.duration && (
            <span className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {program.duration}
            </span>
          )}
          {program.housing_type && (
            <span className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {program.housing_type}
            </span>
          )}
        </div>
      </div>
      </Link>
    </div>
  );
};

export default ProgramCard;

