/* eslint-disable testing-library/no-container */
/* eslint-disable testing-library/no-node-access */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ProgramCard from '../../../components/ProgramCard';

// Mock the api module to avoid import.meta.env issues
jest.mock('../../../services/api', () => ({
  bookmarksApi: {
    bookmarkProgram: jest.fn(),
    unbookmarkProgram: jest.fn(),
  },
}));

interface StudyAbroadProgram {
  id: number;
  program_name: string;
  institution: string;
  city: string;
  country: string;
  cost?: number;
  housing_type?: string;
  duration?: string;
  description?: string;
  created_at: string;
}

// Wrapper component for React Router
const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('ProgramCard Component', () => {
  const mockProgram: StudyAbroadProgram = {
    id: 1,
    program_name: 'Study Abroad in Paris',
    institution: 'Paris University',
    city: 'Paris',
    country: 'France',
    cost: 15000,
    housing_type: 'Student Apartments',
    duration: 'Semester',
    description: 'A wonderful program in the heart of Paris',
    created_at: '2024-01-01T00:00:00Z',
  };

  describe('Basic Rendering', () => {
    it('renders program name', () => {
      render(<ProgramCard program={mockProgram} />, { wrapper: RouterWrapper });
      expect(screen.getByText('Study Abroad in Paris')).toBeInTheDocument();
    });

    it('renders institution', () => {
      render(<ProgramCard program={mockProgram} />, { wrapper: RouterWrapper });
      expect(screen.getByText('Paris University')).toBeInTheDocument();
    });

    it('renders city and country', () => {
      render(<ProgramCard program={mockProgram} />, { wrapper: RouterWrapper });
      expect(screen.getByText('Paris, France')).toBeInTheDocument();
    });

    it('renders description', () => {
      render(<ProgramCard program={mockProgram} />, { wrapper: RouterWrapper });
      expect(screen.getByText('A wonderful program in the heart of Paris')).toBeInTheDocument();
    });
  });

  describe('Optional Fields', () => {
    it('renders cost when provided', () => {
      render(<ProgramCard program={mockProgram} />, { wrapper: RouterWrapper });
      expect(screen.getByText('$15,000')).toBeInTheDocument();
    });

    it('does not render cost when not provided', () => {
      const programWithoutCost = { ...mockProgram, cost: undefined };
      render(<ProgramCard program={programWithoutCost} />, { wrapper: RouterWrapper });
      expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
    });

    it('renders duration when provided', () => {
      render(<ProgramCard program={mockProgram} />, { wrapper: RouterWrapper });
      expect(screen.getByText('Semester')).toBeInTheDocument();
    });

    it('does not render duration when not provided', () => {
      const programWithoutDuration = { ...mockProgram, duration: undefined };
      render(<ProgramCard program={programWithoutDuration} />, { wrapper: RouterWrapper });
      expect(screen.queryByText('Semester')).not.toBeInTheDocument();
    });

    it('renders housing type when provided', () => {
      render(<ProgramCard program={mockProgram} />, { wrapper: RouterWrapper });
      expect(screen.getByText('Student Apartments')).toBeInTheDocument();
    });

    it('does not render housing type when not provided', () => {
      const programWithoutHousing = { ...mockProgram, housing_type: undefined };
      render(<ProgramCard program={programWithoutHousing} />, { wrapper: RouterWrapper });
      expect(screen.queryByText('Student Apartments')).not.toBeInTheDocument();
    });

    it('does not render description when not provided', () => {
      const programWithoutDescription = { ...mockProgram, description: undefined };
      render(<ProgramCard program={programWithoutDescription} />, { wrapper: RouterWrapper });
      expect(screen.queryByText('A wonderful program')).not.toBeInTheDocument();
    });
  });

  describe('Link Functionality', () => {
    it('renders as a link to program detail page', () => {
      const { container } = render(<ProgramCard program={mockProgram} />, {
        wrapper: RouterWrapper
      });
      const link = container.querySelector('a');
      expect(link).toHaveAttribute('href', '/programs/1');
    });

    it('has correct link styling classes', () => {
      const { container } = render(<ProgramCard program={mockProgram} />, {
        wrapper: RouterWrapper
      });
      const link = container.querySelector('a');
      expect(link).toHaveClass('block');
    });
  });

  describe('Cost Formatting', () => {
    it('formats large numbers with commas', () => {
      const expensiveProgram = { ...mockProgram, cost: 50000 };
      render(<ProgramCard program={expensiveProgram} />, { wrapper: RouterWrapper });
      expect(screen.getByText('$50,000')).toBeInTheDocument();
    });

    it('formats numbers without decimals', () => {
      render(<ProgramCard program={mockProgram} />, { wrapper: RouterWrapper });
      const costElement = screen.getByText('$15,000');
      expect(costElement).toBeInTheDocument();
      expect(costElement.textContent).not.toContain('.');
    });
  });

  describe('SVG Icons', () => {
    it('renders location icon for city/country', () => {
      const { container } = render(<ProgramCard program={mockProgram} />, {
        wrapper: RouterWrapper
      });
      const locationIcon = container.querySelector('svg');
      expect(locationIcon).toBeInTheDocument();
    });

    it('renders duration icon when duration is present', () => {
      const { container } = render(<ProgramCard program={mockProgram} />, {
        wrapper: RouterWrapper
      });
      const icons = container.querySelectorAll('svg');
      // Should have at least location icon + duration icon
      expect(icons.length).toBeGreaterThanOrEqual(2);
    });

    it('renders housing icon when housing type is present', () => {
      const { container } = render(<ProgramCard program={mockProgram} />, {
        wrapper: RouterWrapper
      });
      const icons = container.querySelectorAll('svg');
      // Should have location + duration + housing icons
      expect(icons.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty strings gracefully', () => {
      const programWithEmptyStrings = {
        ...mockProgram,
        description: '',
        housing_type: '',
        duration: '',
      };
      const { container } = render(
        <ProgramCard program={programWithEmptyStrings} />,
        { wrapper: RouterWrapper }
      );
      expect(container).toBeInTheDocument();
    });

    it('handles very long program names', () => {
      const programWithLongName = {
        ...mockProgram,
        program_name: 'A Very Long Program Name That Goes On And On And Should Still Display Correctly'
      };
      render(<ProgramCard program={programWithLongName} />, { wrapper: RouterWrapper });
      expect(screen.getByText(programWithLongName.program_name)).toBeInTheDocument();
    });

    it('handles zero cost', () => {
      const freeProgram = { ...mockProgram, cost: 0 };
      render(<ProgramCard program={freeProgram} />, { wrapper: RouterWrapper });
      expect(screen.getByText('$0')).toBeInTheDocument();
    });

    it('truncates long descriptions', () => {
      const programWithLongDescription = {
        ...mockProgram,
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.'
      };
      const { container } = render(
        <ProgramCard program={programWithLongDescription} />,
        { wrapper: RouterWrapper }
      );
      // Check for line-clamp-2 class which limits to 2 lines
      const descriptionElement = container.querySelector('.line-clamp-2');
      expect(descriptionElement).toBeInTheDocument();
    });
  });
});
