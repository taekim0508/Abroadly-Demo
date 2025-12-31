// Contributors:
// Cursor AI Assistant - Bookmarks hook for tracking bookmarked items

import { useState, useEffect } from 'react';
import { bookmarksApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface BookmarkedItems {
  programIds: Set<number>;
  placeIds: Set<number>;
  tripIds: Set<number>;
}

export const useBookmarks = () => {
  const { user } = useAuth();
  const [bookmarkedItems, setBookmarkedItems] = useState<BookmarkedItems>({
    programIds: new Set(),
    placeIds: new Set(),
    tripIds: new Set(),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) {
        setBookmarkedItems({
          programIds: new Set(),
          placeIds: new Set(),
          tripIds: new Set(),
        });
        setLoading(false);
        return;
      }

      try {
        const data = await bookmarksApi.getAllBookmarks();
        setBookmarkedItems({
          programIds: new Set((data.programs || []).map((p: any) => p.id)),
          placeIds: new Set((data.places || []).map((p: any) => p.id)),
          tripIds: new Set((data.trips || []).map((t: any) => t.id)),
        });
      } catch (error) {
        console.error('Failed to fetch bookmarks:', error);
        setBookmarkedItems({
          programIds: new Set(),
          placeIds: new Set(),
          tripIds: new Set(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [user]);

  const isBookmarked = (type: 'program' | 'place' | 'trip', id: number): boolean => {
    if (type === 'program') return bookmarkedItems.programIds.has(id);
    if (type === 'place') return bookmarkedItems.placeIds.has(id);
    return bookmarkedItems.tripIds.has(id);
  };

  const toggleBookmark = (type: 'program' | 'place' | 'trip', id: number, bookmarked: boolean) => {
    setBookmarkedItems(prev => {
      const newState = { ...prev };
      if (type === 'program') {
        const newSet = new Set(prev.programIds);
        if (bookmarked) {
          newSet.add(id);
        } else {
          newSet.delete(id);
        }
        newState.programIds = newSet;
      } else if (type === 'place') {
        const newSet = new Set(prev.placeIds);
        if (bookmarked) {
          newSet.add(id);
        } else {
          newSet.delete(id);
        }
        newState.placeIds = newSet;
      } else {
        const newSet = new Set(prev.tripIds);
        if (bookmarked) {
          newSet.add(id);
        } else {
          newSet.delete(id);
        }
        newState.tripIds = newSet;
      }
      return newState;
    });
  };

  return { isBookmarked, toggleBookmark, loading };
};

