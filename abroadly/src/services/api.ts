// Contributors:
// Gordon Song - Setup (1.5 hrs)
// Tae Kim - Setup (1.5 hrs)

import axios from "axios";

// Use environment variable for API URL, fallback to empty string for development
// Empty string uses relative URLs which go through Vite's proxy (avoiding CORS issues)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include cookies for auth
  headers: {
    "Content-Type": "application/json",
  },
});

// Types
export interface User {
  id: number;
  email: string;
  created_at?: string;
  first_name?: string | null;
  last_name?: string | null;
  age?: number | null;
  institution?: string | null;
  majors?: string[];
  minors?: string[];
  profile_completed?: boolean;
  // Study abroad status fields
  study_abroad_status?: "prospective" | "current" | "former" | null;
  program_name?: string | null;
  program_city?: string | null;
  program_country?: string | null;
  program_term?: string | null;
  onboarding_completed?: boolean;
}

export interface ProfileUpdate {
  first_name?: string;
  last_name?: string;
  age?: number;
  institution?: string;
  majors?: string[];
  minors?: string[];
  profile_completed?: boolean;
  // Study abroad status fields
  study_abroad_status?: "prospective" | "current" | "former";
  program_name?: string;
  program_city?: string;
  program_country?: string;
  program_term?: string;
  onboarding_completed?: boolean;
}

export interface MyReviews {
  program_reviews: Array<{
    id: number;
    program_id: number;
    rating: number;
    review_text: string;
    date: string;
  }>;
  course_reviews: Array<{
    id: number;
    program_id: number;
    course_name: string;
    instructor_name?: string;
    rating: number;
    review_text: string;
    date: string;
  }>;
  housing_reviews: Array<{
    id: number;
    program_id: number;
    housing_description: string;
    rating: number;
    review_text: string;
    date: string;
  }>;
  place_reviews: Array<{
    id: number;
    place_id: number;
    rating: number;
    review_text: string;
    date: string;
  }>;
  trip_reviews: Array<{
    id: number;
    trip_id: number;
    rating: number;
    review_text: string;
    date: string;
  }>;
}

export interface StudyAbroadProgram {
  id: number;
  program_name: string;
  institution: string;
  city: string;
  country: string;
  cost?: number;
  housing_type?: string;
  location?: string;
  duration?: string;
  description?: string;
  created_at: string;
  average_rating?: number | null;
  review_count?: number;
}

export interface ReviewerInfo {
  id: number | null;
  first_name: string | null;
  last_name: string | null;
  institution: string | null;
  study_abroad_status: "prospective" | "current" | "former" | null;
  program_name: string | null;
  program_city: string | null;
  program_country: string | null;
  program_term: string | null;
}

export interface ProgramReview {
  id: number;
  user_id: number;
  program_id: number;
  rating: number;
  review_text: string;
  date: string;
  reviewer?: ReviewerInfo | null;
}

export interface CourseReview {
  id: number;
  user_id: number;
  program_id: number;
  course_name: string;
  instructor_name?: string;
  rating: number;
  review_text: string;
  date: string;
  reviewer?: ReviewerInfo | null;
}

export interface ProgramHousingReview {
  id: number;
  user_id: number;
  program_id: number;
  housing_description: string;
  rating: number;
  review_text: string;
  date: string;
  reviewer?: ReviewerInfo | null;
}

export interface Place {
  id: number;
  name: string;
  category: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  description?: string;
  price_range?: string;
  created_at: string;
  average_rating?: number | null;
  review_count?: number;
}

export interface PlaceReview {
  id: number;
  user_id: number;
  place_id: number;
  rating: number;
  review_text: string;
  reviewer?: ReviewerInfo | null;
  date: string;
}

export interface Trip {
  id: number;
  destination: string;
  country: string;
  description?: string;
  trip_type?: string;
  created_at: string;
  average_rating?: number | null;
  review_count?: number;
}

export interface TripReview {
  id: number;
  user_id: number;
  trip_id: number;
  rating: number;
  review_text: string;
  date: string;
  reviewer?: ReviewerInfo | null;
}

// Auth API
export const authApi = {
  requestMagicLink: async (email: string) => {
    const response = await api.post("/auth/request-link", { email });
    return response.data;
  },

  verifyMagicToken: async (token: string) => {
    const response = await api.get("/auth/callback", { params: { token } });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  getPublicProfile: async (userId: number): Promise<User> => {
    const response = await api.get(`/auth/users/${userId}/profile`);
    return response.data;
  },

  getUserReviews: async (userId: number) => {
    const response = await api.get(`/auth/users/${userId}/reviews`);
    return response.data;
  },

  updateProfile: async (profile: ProfileUpdate): Promise<User> => {
    const response = await api.put("/auth/profile", profile);
    return response.data;
  },

  getMyReviews: async (): Promise<MyReviews> => {
    const response = await api.get("/auth/my-reviews");
    return response.data;
  },

  deleteReview: async (reviewType: string, reviewId: number) => {
    const response = await api.delete(
      `/auth/my-reviews/${reviewType}/${reviewId}`
    );
    return response.data;
  },

  getMyTrips: async (): Promise<Trip[]> => {
    const response = await api.get("/auth/my-trips");
    return response.data;
  },

  getMyPrograms: async (): Promise<StudyAbroadProgram[]> => {
    const response = await api.get("/auth/my-programs");
    return response.data;
  },

  getMyPlaces: async (): Promise<Place[]> => {
    const response = await api.get("/auth/my-places");
    return response.data;
  },
};

// Programs API
export const programsApi = {
  list: async (filters?: {
    city?: string;
    country?: string;
    search?: string;
    skip?: number;
    limit?: number;
  }) => {
    const response = await api.get<StudyAbroadProgram[]>("/api/programs/", {
      params: filters,
    });
    return response.data;
  },

  get: async (id: number) => {
    const response = await api.get<StudyAbroadProgram>(`/api/programs/${id}`);
    return response.data;
  },

  create: async (program: Omit<StudyAbroadProgram, "id" | "created_at">) => {
    const response = await api.post<StudyAbroadProgram>(
      "/api/programs/",
      program
    );
    return response.data;
  },

  update: async (id: number, program: Partial<StudyAbroadProgram>) => {
    const response = await api.put<StudyAbroadProgram>(
      `/api/programs/${id}`,
      program
    );
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/api/programs/${id}`);
  },

  // Reviews
  listReviews: async (
    programId: number,
    params?: { skip?: number; limit?: number }
  ) => {
    const response = await api.get<ProgramReview[]>(
      `/api/programs/${programId}/reviews`,
      { params }
    );
    return response.data;
  },

  createReview: async (
    programId: number,
    review: { rating: number; review_text: string }
  ) => {
    const response = await api.post<ProgramReview>(
      `/api/programs/${programId}/reviews`,
      review
    );
    return response.data;
  },

  // Course Reviews
  listCourseReviews: async (
    programId: number,
    params?: { skip?: number; limit?: number }
  ) => {
    const response = await api.get<CourseReview[]>(
      `/api/programs/${programId}/courses/reviews`,
      { params }
    );
    return response.data;
  },

  createCourseReview: async (
    programId: number,
    review: {
      course_name: string;
      instructor_name?: string;
      rating: number;
      review_text: string;
    }
  ) => {
    const response = await api.post<CourseReview>(
      `/api/programs/${programId}/courses/reviews`,
      review
    );
    return response.data;
  },

  // Housing Reviews
  listHousingReviews: async (
    programId: number,
    params?: { skip?: number; limit?: number }
  ) => {
    const response = await api.get<ProgramHousingReview[]>(
      `/api/programs/${programId}/housing/reviews`,
      { params }
    );
    return response.data;
  },

  createHousingReview: async (
    programId: number,
    review: { housing_description: string; rating: number; review_text: string }
  ) => {
    const response = await api.post<ProgramHousingReview>(
      `/api/programs/${programId}/housing/reviews`,
      review
    );
    return response.data;
  },
};

// Places API
export const placesApi = {
  list: async (filters?: {
    city?: string;
    country?: string;
    category?: string;
    search?: string;
    skip?: number;
    limit?: number;
  }) => {
    const response = await api.get<Place[]>("/api/places/", {
      params: filters,
    });
    return response.data;
  },

  get: async (id: number) => {
    const response = await api.get<Place>(`/api/places/${id}`);
    return response.data;
  },

  create: async (place: Omit<Place, "id" | "created_at">) => {
    const response = await api.post<Place>("/api/places/", place);
    return response.data;
  },

  update: async (id: number, place: Partial<Place>) => {
    const response = await api.put<Place>(`/api/places/${id}`, place);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/api/places/${id}`);
  },

  // Reviews
  listReviews: async (
    placeId: number,
    params?: { skip?: number; limit?: number }
  ) => {
    const response = await api.get<PlaceReview[]>(
      `/api/places/${placeId}/reviews`,
      { params }
    );
    return response.data;
  },

  createReview: async (
    placeId: number,
    review: { rating: number; review_text: string }
  ) => {
    const response = await api.post<PlaceReview>(
      `/api/places/${placeId}/reviews`,
      review
    );
    return response.data;
  },
};

// Trips API
export const tripsApi = {
  list: async (filters?: {
    destination?: string;
    country?: string;
    trip_type?: string;
    search?: string;
    skip?: number;
    limit?: number;
  }) => {
    const response = await api.get<Trip[]>("/api/trips/", { params: filters });
    return response.data;
  },

  get: async (id: number) => {
    const response = await api.get<Trip>(`/api/trips/${id}`);
    return response.data;
  },

  create: async (trip: Omit<Trip, "id" | "created_at">) => {
    const response = await api.post<Trip>("/api/trips/", trip);
    return response.data;
  },

  update: async (id: number, trip: Partial<Trip>) => {
    const response = await api.put<Trip>(`/api/trips/${id}`, trip);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/api/trips/${id}`);
  },

  // Reviews
  listReviews: async (
    tripId: number,
    params?: { skip?: number; limit?: number }
  ) => {
    const response = await api.get<TripReview[]>(
      `/api/trips/${tripId}/reviews`,
      { params }
    );
    return response.data;
  },

  createReview: async (
    tripId: number,
    review: { rating: number; review_text: string }
  ) => {
    const response = await api.post<TripReview>(
      `/api/trips/${tripId}/reviews`,
      review
    );
    return response.data;
  },
};

// Bookmarks API
export const bookmarksApi = {
  // Programs
  bookmarkProgram: async (programId: number) => {
    const response = await api.post(`/bookmarks/programs/${programId}`);
    return response.data;
  },

  unbookmarkProgram: async (programId: number) => {
    const response = await api.delete(`/bookmarks/programs/${programId}`);
    return response.data;
  },

  getBookmarkedPrograms: async () => {
    const response = await api.get("/bookmarks/programs");
    return response.data;
  },

  // Places
  bookmarkPlace: async (placeId: number) => {
    const response = await api.post(`/bookmarks/places/${placeId}`);
    return response.data;
  },

  unbookmarkPlace: async (placeId: number) => {
    const response = await api.delete(`/bookmarks/places/${placeId}`);
    return response.data;
  },

  getBookmarkedPlaces: async () => {
    const response = await api.get("/bookmarks/places");
    return response.data;
  },

  // Trips
  bookmarkTrip: async (tripId: number) => {
    const response = await api.post(`/bookmarks/trips/${tripId}`);
    return response.data;
  },

  unbookmarkTrip: async (tripId: number) => {
    const response = await api.delete(`/bookmarks/trips/${tripId}`);
    return response.data;
  },

  getBookmarkedTrips: async () => {
    const response = await api.get("/bookmarks/trips");
    return response.data;
  },

  // Get all bookmarks
  getAllBookmarks: async () => {
    const response = await api.get("/bookmarks");
    return response.data;
  },
};

// Message interfaces
export interface MessageCreate {
  recipient_id: number;
  subject: string;
  content: string;
  related_program_id?: number;
  related_place_id?: number;
  related_trip_id?: number;
  parent_message_id?: number;
}

export interface Message {
  id: number;
  sender_id: number;
  sender_name: string | null;
  sender_email: string;
  recipient_id: number;
  recipient_name: string | null;
  recipient_email: string;
  subject: string;
  content: string;
  read: boolean;
  created_at: string;
  related_program_id?: number;
  related_program_name?: string;
  related_place_id?: number;
  related_place_name?: string;
  related_trip_id?: number;
  related_trip_name?: string;
  parent_message_id?: number;
}

// Messages API
export const messagesApi = {
  // Send a message
  sendMessage: async (message: MessageCreate) => {
    const response = await api.post("/messages", message);
    return response.data;
  },

  // Get inbox (received messages)
  getInbox: async (unreadOnly: boolean = false) => {
    const response = await api.get("/messages/inbox", {
      params: { unread_only: unreadOnly },
    });
    return response.data as Message[];
  },

  // Get sent messages
  getSentMessages: async () => {
    const response = await api.get("/messages/sent");
    return response.data as Message[];
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get("/messages/unread-count");
    return response.data as { unread_count: number };
  },

  // Get a specific message
  getMessage: async (messageId: number) => {
    const response = await api.get(`/messages/${messageId}`);
    return response.data as Message;
  },

  // Mark message as read
  markAsRead: async (messageId: number) => {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  },

  // Delete a message
  deleteMessage: async (messageId: number) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },

  // Get conversation with a specific user
  getConversation: async (otherUserId: number) => {
    const response = await api.get(`/messages/conversation/${otherUserId}`);
    return response.data as Message[];
  },
};

// ===== AI Trip Planner API =====

export interface TripPlanRequest {
  travel_start_date?: string;
  travel_end_date?: string;
  budget?: "low" | "medium" | "high";
  travel_style?: "adventure" | "relaxed" | "cultural" | "party" | "foodie";
  priorities?: string[];
  additional_notes?: string;
}

export const aiApi = {
  // Generate a trip plan (returns a streaming response)
  planTrip: async (request: TripPlanRequest): Promise<Response> => {
    const token = localStorage.getItem("access_token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add Authorization header if token exists (for production cross-origin requests)
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/ai/plan-trip`, {
      method: "POST",
      headers,
      credentials: "include", // CRITICAL: Include cookies for auth (works in both dev and production)
      body: JSON.stringify(request),
    });
    return response;
  },

  // Get a quick AI suggestion
  getQuickSuggestion: async (): Promise<{ suggestion: string }> => {
    const response = await api.post("/ai/quick-suggestion");
    return response.data;
  },
};

export default api;
