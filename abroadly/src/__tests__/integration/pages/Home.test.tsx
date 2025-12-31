import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Home from '../../../pages/Home';

const renderHome = () => {
  return render(
    <BrowserRouter>
      <Home />
    </BrowserRouter>
  );
};

describe('Home Page', () => {
  describe('Hero Section', () => {
    it('renders the main heading', () => {
      renderHome();
      expect(screen.getByText(/Your Journey Abroad Starts Here/i)).toBeInTheDocument();
    });

    it('renders the tagline', () => {
      renderHome();
      expect(screen.getByText(/Discover study abroad programs through authentic student reviews/i)).toBeInTheDocument();
    });

    it('renders Browse Programs button', () => {
      renderHome();
      expect(screen.getByText('Browse Programs')).toBeInTheDocument();
    });

    it('renders Explore Places button', () => {
      renderHome();
      expect(screen.getByText('Explore Places')).toBeInTheDocument();
    });
  });

  describe('Features Section', () => {
    it('renders features section heading', () => {
      renderHome();
      expect(screen.getByText(/Everything You Need to Study Abroad/i)).toBeInTheDocument();
    });

    it('renders Research Programs feature', () => {
      renderHome();
      expect(screen.getByText('Research Programs')).toBeInTheDocument();
    });

    it('renders Discover Places feature', () => {
      renderHome();
      expect(screen.getByText('Discover Places')).toBeInTheDocument();
    });

    it('renders Plan Trips feature', () => {
      renderHome();
      expect(screen.getByText('Plan Trips')).toBeInTheDocument();
    });

    it('renders View Programs link', () => {
      renderHome();
      expect(screen.getByText('View Programs →')).toBeInTheDocument();
    });

    it('renders Explore Places link', () => {
      renderHome();
      expect(screen.getByText('Explore Places →')).toBeInTheDocument();
    });

    it('renders Plan Your Trip link', () => {
      renderHome();
      expect(screen.getByText('Plan Your Trip →')).toBeInTheDocument();
    });
  });

  describe('How It Works Section', () => {
    it('renders How Abroadly Works heading', () => {
      renderHome();
      expect(screen.getByText(/How Abroadly Works/i)).toBeInTheDocument();
    });

    it('renders Sign Up step', () => {
      renderHome();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
      expect(screen.getByText(/Create your account with your university email/i)).toBeInTheDocument();
    });

    it('renders Explore step', () => {
      renderHome();
      expect(screen.getByText('Explore')).toBeInTheDocument();
      expect(screen.getByText(/Browse programs and places with authentic reviews/i)).toBeInTheDocument();
    });

    it('renders Contribute step', () => {
      renderHome();
      expect(screen.getByText('Contribute')).toBeInTheDocument();
      expect(screen.getByText(/Share your experiences to help future students/i)).toBeInTheDocument();
    });

    it('renders Connect step', () => {
      renderHome();
      expect(screen.getByText('Connect')).toBeInTheDocument();
      expect(screen.getByText(/Join a community of students studying abroad/i)).toBeInTheDocument();
    });
  });

  describe('CTA Section', () => {
    it('renders CTA heading', () => {
      renderHome();
      expect(screen.getByText(/Ready to Start Your Adventure?/i)).toBeInTheDocument();
    });

    it('renders CTA description', () => {
      renderHome();
      expect(screen.getByText(/Join thousands of students exploring the world/i)).toBeInTheDocument();
    });

    it('renders Get Started Today button', () => {
      renderHome();
      expect(screen.getByText('Get Started Today')).toBeInTheDocument();
    });

    it('Get Started button links to /auth', () => {
      renderHome();
      const button = screen.getByRole('link', { name: 'Get Started Today' });
      expect(button).toHaveAttribute('href', '/auth');
    });
  });

  describe('Navigation Links', () => {
    it('Browse Programs button links to /programs', () => {
      renderHome();
      const link = screen.getByRole('link', { name: 'Browse Programs' });
      expect(link).toHaveAttribute('href', '/programs');
    });

    it('Explore Places button links to /places', () => {
      renderHome();
      const links = screen.getAllByRole('link', { name: 'Explore Places' });
      const heroButton = links[0];
      expect(heroButton).toHaveAttribute('href', '/places');
    });

    it('View Programs link points to /programs', () => {
      renderHome();
      const link = screen.getByRole('link', { name: 'View Programs →' });
      expect(link).toHaveAttribute('href', '/programs');
    });

    it('Plan Your Trip link points to /trips', () => {
      renderHome();
      const link = screen.getByRole('link', { name: 'Plan Your Trip →' });
      expect(link).toHaveAttribute('href', '/trips');
    });
  });
});
