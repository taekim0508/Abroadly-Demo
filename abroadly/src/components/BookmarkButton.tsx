// Contributors:
// Cursor AI Assistant - Bookmarks feature implementation

import React, { useState, useEffect } from 'react';
import { bookmarksApi } from '../services/api';

interface BookmarkButtonProps {
  type: 'program' | 'place' | 'trip';
  itemId: number;
  initialBookmarked?: boolean;
  onToggle?: (bookmarked: boolean) => void;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  type,
  itemId,
  initialBookmarked = false,
  onToggle,
}) => {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with initialBookmarked when it changes (e.g., after bookmarks are fetched)
  useEffect(() => {
    setIsBookmarked(initialBookmarked);
  }, [initialBookmarked]);

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if button is inside a link
    e.stopPropagation();

    setIsLoading(true);
    try {
      if (isBookmarked) {
        // Unbookmark
        if (type === 'program') {
          await bookmarksApi.unbookmarkProgram(itemId);
        } else if (type === 'place') {
          await bookmarksApi.unbookmarkPlace(itemId);
        } else {
          await bookmarksApi.unbookmarkTrip(itemId);
        }
        setIsBookmarked(false);
        onToggle?.(false);
      } else {
        // Bookmark
        if (type === 'program') {
          await bookmarksApi.bookmarkProgram(itemId);
        } else if (type === 'place') {
          await bookmarksApi.bookmarkPlace(itemId);
        } else {
          await bookmarksApi.bookmarkTrip(itemId);
        }
        setIsBookmarked(true);
        onToggle?.(true);
      }
    } catch (error: any) {
      console.error('Error toggling bookmark:', error);
      // Show error message if not authenticated
      if (error.response?.status === 401) {
        alert('Please log in to bookmark items');
      } else {
        alert(error.response?.data?.detail || 'Failed to update bookmark');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleBookmark}
      disabled={isLoading}
      className={`p-2 rounded-full transition-all ${
        isBookmarked
          ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
      aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
    >
      {isBookmarked ? (
        // Filled bookmark icon
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
        </svg>
      ) : (
        // Outlined bookmark icon
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      )}
    </button>
  );
};

export default BookmarkButton;

