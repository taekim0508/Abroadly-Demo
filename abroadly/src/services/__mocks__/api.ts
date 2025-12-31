// Mock API for testing
export const authApi = {
  requestMagicLink: jest.fn(),
  verifyMagicToken: jest.fn(),
  getCurrentUser: jest.fn(),
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
  getMyReviews: jest.fn(),
  deleteReview: jest.fn(),
  logout: jest.fn(),
};

export const programsApi = {
  list: jest.fn(),
  get: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  listReviews: jest.fn(),
  createReview: jest.fn(),
  listCourseReviews: jest.fn(),
  createCourseReview: jest.fn(),
  listHousingReviews: jest.fn(),
  createHousingReview: jest.fn(),
};

export const placesApi = {
  list: jest.fn(),
  get: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  listReviews: jest.fn(),
  createReview: jest.fn(),
};

export const tripsApi = {
  list: jest.fn(),
  get: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  listReviews: jest.fn(),
  createReview: jest.fn(),
};

export default {
  authApi,
  programsApi,
  placesApi,
  tripsApi,
};
