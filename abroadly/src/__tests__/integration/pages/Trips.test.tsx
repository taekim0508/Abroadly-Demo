/* eslint-disable testing-library/no-wait-for-multiple-assertions */
/* eslint-disable testing-library/no-node-access */
// Contributors:
// Gordon Song - Trips page tests (0.5 hrs)

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import Trips from "../../../pages/Trips";
import { tripsApi } from "../../../services/api";

// Mock the API module
jest.mock("../../../services/api", () => ({
  tripsApi: {
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    listReviews: jest.fn(),
    createReview: jest.fn(),
  },
  bookmarksApi: {
    getAllBookmarks: jest
      .fn()
      .mockResolvedValue({ programs: [], places: [], trips: [] }),
    bookmarkTrip: jest.fn(),
    unbookmarkTrip: jest.fn(),
  },
}));

// Mock the AuthContext
jest.mock("../../../context/AuthContext", () => ({
  useAuth: jest.fn().mockReturnValue({
    user: { id: 1, email: "test@vanderbilt.edu" },
    login: jest.fn(),
    logout: jest.fn(),
    refreshUser: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const mockedTripsApi = tripsApi as jest.Mocked<typeof tripsApi>;

const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <BrowserRouter>{children}</BrowserRouter>;

describe("Trips Page", () => {
  const mockTrips = [
    {
      id: 1,
      destination: "Paris",
      country: "France",
      trip_type: "weekend",
      description: "Amazing weekend trip to Paris",
      created_at: "2024-01-01",
    },
    {
      id: 2,
      destination: "Barcelona",
      country: "Spain",
      trip_type: "spring break",
      description: "Spring break adventure",
      created_at: "2024-01-02",
    },
    {
      id: 3,
      destination: "Rome",
      country: "Italy",
      trip_type: "summer",
      description: "Summer exploration",
      created_at: "2024-01-03",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial Render", () => {
    it("renders page title and description", async () => {
      mockedTripsApi.list.mockResolvedValue([]);

      render(<Trips />, { wrapper: RouterWrapper });

      expect(screen.getByText(/Plan Your Trips/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Discover weekend getaways/i)
      ).toBeInTheDocument();
    });

    it("shows loading state initially", () => {
      mockedTripsApi.list.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 1000))
      );

      render(<Trips />, { wrapper: RouterWrapper });

      // Check for loading spinner by class
      expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    });

    it("fetches and displays trips on mount", async () => {
      mockedTripsApi.list.mockResolvedValue(mockTrips);

      render(<Trips />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText("Paris")).toBeInTheDocument();
        expect(screen.getByText("Barcelona")).toBeInTheDocument();
        expect(screen.getByText("Rome")).toBeInTheDocument();
      });
    });
  });

  describe("Filtering", () => {
    beforeEach(() => {
      mockedTripsApi.list.mockResolvedValue(mockTrips);
    });

    it("renders trip type filter dropdown", async () => {
      render(<Trips />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByLabelText(/Trip Type/i)).toBeInTheDocument();
      });
    });

    it("renders country filter dropdown", async () => {
      render(<Trips />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByLabelText(/Country/i)).toBeInTheDocument();
      });
    });

    it("filters trips by trip type", async () => {
      render(<Trips />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText("Paris")).toBeInTheDocument();
      });

      const tripTypeFilter = screen.getByLabelText(/Trip Type/i);
      fireEvent.change(tripTypeFilter, { target: { value: "weekend" } });

      await waitFor(() => {
        expect(mockedTripsApi.list).toHaveBeenCalledWith({
          trip_type: "weekend",
        });
      });
    });

    it("filters trips by country", async () => {
      render(<Trips />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText("Paris")).toBeInTheDocument();
      });

      const countryFilter = screen.getByLabelText(/Country/i);
      fireEvent.change(countryFilter, { target: { value: "France" } });

      await waitFor(() => {
        expect(mockedTripsApi.list).toHaveBeenCalledWith({ country: "France" });
      });
    });

    it("clears filters when clear button is clicked", async () => {
      render(<Trips />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText("Paris")).toBeInTheDocument();
      });

      // Set filters
      const tripTypeFilter = screen.getByLabelText(/Trip Type/i);
      const countryFilter = screen.getByLabelText(/Country/i);

      fireEvent.change(tripTypeFilter, { target: { value: "weekend" } });
      fireEvent.change(countryFilter, { target: { value: "France" } });

      // Clear filters
      const clearButton = screen.getByRole("button", {
        name: /Clear Filters/i,
      });
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(tripTypeFilter).toHaveValue("");
        expect(countryFilter).toHaveValue("");
      });
    });
  });

  describe("Trip Display", () => {
    it("displays trip cards with correct information", async () => {
      mockedTripsApi.list.mockResolvedValue([mockTrips[0]]);

      render(<Trips />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText("Paris")).toBeInTheDocument();
        expect(screen.getAllByText("France").length).toBeGreaterThan(0);
        expect(screen.getAllByText(/weekend/i).length).toBeGreaterThan(0);
        expect(
          screen.getByText(/Amazing weekend trip to Paris/i)
        ).toBeInTheDocument();
      });
    });

    it('displays "View Details" links for each trip', async () => {
      mockedTripsApi.list.mockResolvedValue(mockTrips);

      render(<Trips />, { wrapper: RouterWrapper });

      await waitFor(() => {
        const detailButtons = screen.getAllByText(/View Details/i);
        expect(detailButtons).toHaveLength(3);
      });
    });

    it("displays trip count", async () => {
      mockedTripsApi.list.mockResolvedValue(mockTrips);

      render(<Trips />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText(/Found 3 trips/i)).toBeInTheDocument();
      });
    });

    it("shows singular trip text for single trip", async () => {
      mockedTripsApi.list.mockResolvedValue([mockTrips[0]]);

      render(<Trips />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText(/Found 1 trip$/i)).toBeInTheDocument();
      });
    });
  });

  describe("Empty States", () => {
    it('shows "No Trips Found" message when no trips match filters', async () => {
      mockedTripsApi.list.mockResolvedValue([]);

      render(<Trips />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText(/No Trips Found/i)).toBeInTheDocument();
      });
    });

    it("displays helpful message in empty state", async () => {
      mockedTripsApi.list.mockResolvedValue([]);

      render(<Trips />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(
          screen.getByText(/Try adjusting your filters/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("displays error message when API call fails", async () => {
      mockedTripsApi.list.mockRejectedValue(new Error("Failed to fetch trips"));

      render(<Trips />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(
          screen.getByText(/More Trips Coming Soon!/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Future Features Section", () => {
    it('displays "Travel Companions" feature preview', async () => {
      mockedTripsApi.list.mockResolvedValue([]);

      render(<Trips />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText(/Travel Companions/i)).toBeInTheDocument();
      });
    });

    it('displays "Trip Planning Tools" feature preview', async () => {
      mockedTripsApi.list.mockResolvedValue([]);

      render(<Trips />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText(/Trip Planning Tools/i)).toBeInTheDocument();
      });
    });

    it('shows "Coming Soon" badges', async () => {
      mockedTripsApi.list.mockResolvedValue([]);

      render(<Trips />, { wrapper: RouterWrapper });

      await waitFor(() => {
        const comingSoonBadges = screen.getAllByText(/Coming Soon/i);
        expect(comingSoonBadges.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe.skip("Post Trip Modal", () => {
    beforeEach(() => {
      mockedTripsApi.list.mockResolvedValue([]);
    });

    it('opens modal when "Post a Trip" button is clicked', async () => {
      render(<Trips />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Post a Trip/i })
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: /Post a Trip/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/Post a Trip/i, { selector: "h2" })
        ).toBeInTheDocument();
      });
    });

    it("closes modal when close button is clicked", async () => {
      render(<Trips />, { wrapper: RouterWrapper });

      await waitFor(() => {
        fireEvent.click(screen.getByRole("button", { name: /Post a Trip/i }));
      });

      await waitFor(() => {
        expect(
          screen.getByText(/Post a Trip/i, { selector: "h2" })
        ).toBeInTheDocument();
      });

      // Click the X button to close
      const closeButtons = screen.getAllByRole("button");
      const closeButton = closeButtons.find((btn) => {
        const svg = btn.querySelector("svg");
        return svg && svg.querySelector('path[d="M6 18L18 6M6 6l12 12"]');
      });

      if (closeButton) {
        fireEvent.click(closeButton);
      }

      await waitFor(() => {
        expect(
          screen.queryByText(/Post a Trip/i, { selector: "h2" })
        ).not.toBeInTheDocument();
      });
    });

    it("submits trip creation form successfully", async () => {
      mockedTripsApi.create.mockResolvedValue({
        id: 4,
        destination: "Amsterdam",
        country: "Netherlands",
        trip_type: "weekend",
        description: "Weekend in Amsterdam",
        created_at: "2024-01-04",
      });

      render(<Trips />, { wrapper: RouterWrapper });

      await waitFor(() => {
        fireEvent.click(screen.getByRole("button", { name: /Post a Trip/i }));
      });

      await waitFor(() => {
        expect(
          screen.getByText(/Post a Trip/i, { selector: "h2" })
        ).toBeInTheDocument();
      });

      // Fill out the form
      fireEvent.change(screen.getByLabelText(/Destination \*/i), {
        target: { value: "Amsterdam" },
      });
      fireEvent.change(screen.getByLabelText(/Country \*/i), {
        target: { value: "Netherlands" },
      });
      fireEvent.change(screen.getByLabelText(/Description/i), {
        target: { value: "Weekend in Amsterdam" },
      });

      // Submit
      const submitButton = screen.getByRole("button", { name: /^Post Trip$/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedTripsApi.create).toHaveBeenCalledWith({
          destination: "Amsterdam",
          country: "Netherlands",
          description: "Weekend in Amsterdam",
          trip_type: "weekend",
        });
      });
    });

    it("allows changing trip type in modal", async () => {
      render(<Trips />, { wrapper: RouterWrapper });

      await waitFor(() => {
        fireEvent.click(screen.getByRole("button", { name: /Post a Trip/i }));
      });

      await waitFor(() => {
        expect(
          screen.getByText(/Post a Trip/i, { selector: "h2" })
        ).toBeInTheDocument();
      });

      const tripTypeSelect = screen.getByLabelText(/Trip Type \*/i);
      fireEvent.change(tripTypeSelect, { target: { value: "summer" } });

      expect(tripTypeSelect).toHaveValue("summer");
    });

    it("shows cancel button in modal", async () => {
      render(<Trips />, { wrapper: RouterWrapper });

      await waitFor(() => {
        fireEvent.click(screen.getByRole("button", { name: /Post a Trip/i }));
      });

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Cancel/i })
        ).toBeInTheDocument();
      });
    });

    it("closes modal when cancel button is clicked", async () => {
      render(<Trips />, { wrapper: RouterWrapper });

      await waitFor(() => {
        fireEvent.click(screen.getByRole("button", { name: /Post a Trip/i }));
      });

      await waitFor(() => {
        expect(
          screen.getByText(/Post a Trip/i, { selector: "h2" })
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

      await waitFor(() => {
        expect(
          screen.queryByText(/Post a Trip/i, { selector: "h2" })
        ).not.toBeInTheDocument();
      });
    });

    it("handles trip creation error", async () => {
      mockedTripsApi.create.mockRejectedValue({
        response: { data: { detail: "Trip creation failed" } },
      });

      render(<Trips />, { wrapper: RouterWrapper });

      await waitFor(() => {
        fireEvent.click(screen.getByRole("button", { name: /Post a Trip/i }));
      });

      await waitFor(() => {
        expect(
          screen.getByText(/Post a Trip/i, { selector: "h2" })
        ).toBeInTheDocument();
      });

      // Fill minimal required fields
      fireEvent.change(screen.getByLabelText(/Destination \*/i), {
        target: { value: "Test" },
      });
      fireEvent.change(screen.getByLabelText(/Country \*/i), {
        target: { value: "Test" },
      });

      // Submit
      const submitButton = screen.getByRole("button", { name: /^Post Trip$/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Trip creation failed/i)).toBeInTheDocument();
      });
    });

    it("handles generic error during trip creation", async () => {
      mockedTripsApi.create.mockRejectedValue(new Error("Network error"));

      render(<Trips />, { wrapper: RouterWrapper });

      await waitFor(() => {
        fireEvent.click(screen.getByRole("button", { name: /Post a Trip/i }));
      });

      await waitFor(() => {
        expect(
          screen.getByText(/Post a Trip/i, { selector: "h2" })
        ).toBeInTheDocument();
      });

      // Fill minimal required fields
      fireEvent.change(screen.getByLabelText(/Destination \*/i), {
        target: { value: "Test" },
      });
      fireEvent.change(screen.getByLabelText(/Country \*/i), {
        target: { value: "Test" },
      });

      // Submit
      const submitButton = screen.getByRole("button", { name: /^Post Trip$/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to post trip/i)).toBeInTheDocument();
      });
    });
  });
});
