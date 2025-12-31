/* eslint-disable testing-library/no-container */
/* eslint-disable testing-library/no-node-access */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StarRating from '../../../components/StarRating';

describe('StarRating Component', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<StarRating rating={3} />);
      expect(screen.getByText('3.0')).toBeInTheDocument();
    });

    it('renders correct number of stars', () => {
      const { container } = render(<StarRating rating={4} />);
      const stars = container.querySelectorAll('button');
      expect(stars).toHaveLength(5); // Default maxRating is 5
    });

    it('renders custom maxRating', () => {
      const { container } = render(<StarRating rating={3} maxRating={10} />);
      const stars = container.querySelectorAll('button');
      expect(stars).toHaveLength(10);
    });

    it('displays rating value', () => {
      render(<StarRating rating={4.5} />);
      expect(screen.getByText('4.5')).toBeInTheDocument();
    });
  });

  describe('Visual States', () => {
    it('fills stars based on rating', () => {
      const { container } = render(<StarRating rating={3} />);
      const stars = container.querySelectorAll('svg');

      // First 3 stars should be filled (yellow)
      expect(stars[0]).toHaveClass('text-yellow-400');
      expect(stars[1]).toHaveClass('text-yellow-400');
      expect(stars[2]).toHaveClass('text-yellow-400');

      // Last 2 stars should be empty (gray)
      expect(stars[3]).toHaveClass('text-gray-300');
      expect(stars[4]).toHaveClass('text-gray-300');
    });

    it('handles zero rating', () => {
      const { container } = render(<StarRating rating={0} />);
      const stars = container.querySelectorAll('svg');

      // All stars should be empty
      stars.forEach(star => {
        expect(star).toHaveClass('text-gray-300');
      });
    });

    it('handles full rating', () => {
      const { container } = render(<StarRating rating={5} />);
      const stars = container.querySelectorAll('svg');

      // All stars should be filled
      stars.forEach(star => {
        expect(star).toHaveClass('text-yellow-400');
      });
    });
  });

  describe('Size Variants', () => {
    it('renders small size', () => {
      const { container } = render(<StarRating rating={3} size="sm" />);
      const star = container.querySelector('svg');
      expect(star).toHaveClass('w-4', 'h-4');
    });

    it('renders medium size', () => {
      const { container } = render(<StarRating rating={3} size="md" />);
      const star = container.querySelector('svg');
      expect(star).toHaveClass('w-5', 'h-5');
    });

    it('renders large size', () => {
      const { container } = render(<StarRating rating={3} size="lg" />);
      const star = container.querySelector('svg');
      expect(star).toHaveClass('w-6', 'h-6');
    });
  });

  describe('Interactive Mode', () => {
    it('calls onRatingChange when star is clicked in interactive mode', () => {
      const handleRatingChange = jest.fn();
      const { container } = render(
        <StarRating
          rating={2}
          interactive={true}
          onRatingChange={handleRatingChange}
        />
      );

      const stars = container.querySelectorAll('button');
      fireEvent.click(stars[3]); // Click 4th star

      expect(handleRatingChange).toHaveBeenCalledWith(4);
      expect(handleRatingChange).toHaveBeenCalledTimes(1);
    });

    it('does not call onRatingChange when not interactive', () => {
      const handleRatingChange = jest.fn();
      const { container } = render(
        <StarRating
          rating={2}
          interactive={false}
          onRatingChange={handleRatingChange}
        />
      );

      const stars = container.querySelectorAll('button');
      fireEvent.click(stars[3]);

      expect(handleRatingChange).not.toHaveBeenCalled();
    });

    it('has correct cursor class in interactive mode', () => {
      const { container } = render(
        <StarRating rating={3} interactive={true} onRatingChange={() => {}} />
      );
      const button = container.querySelector('button');
      expect(button).toHaveClass('cursor-pointer');
    });

    it('has correct cursor class in non-interactive mode', () => {
      const { container } = render(<StarRating rating={3} interactive={false} />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('cursor-default');
    });

    it('disables buttons when not interactive', () => {
      const { container } = render(<StarRating rating={3} interactive={false} />);
      const buttons = container.querySelectorAll('button');

      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    it('enables buttons when interactive', () => {
      const { container } = render(
        <StarRating rating={3} interactive={true} onRatingChange={() => {}} />
      );
      const buttons = container.querySelectorAll('button');

      buttons.forEach(button => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles fractional ratings', () => {
      render(<StarRating rating={3.7} />);
      expect(screen.getByText('3.7')).toBeInTheDocument();
    });

    it('handles rating exceeding maxRating', () => {
      const { container } = render(<StarRating rating={7} maxRating={5} />);
      const stars = container.querySelectorAll('svg');

      // All stars should be filled
      stars.forEach(star => {
        expect(star).toHaveClass('text-yellow-400');
      });
    });

    it('handles negative rating', () => {
      const { container } = render(<StarRating rating={-1} />);
      const stars = container.querySelectorAll('svg');

      // All stars should be empty
      stars.forEach(star => {
        expect(star).toHaveClass('text-gray-300');
      });
    });
  });
});
