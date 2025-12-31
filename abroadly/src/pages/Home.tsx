// Contributors:
// Gordon Song - Setup (1 hr)
// Tae Kim - Transitioning Gradient Background (1 hr)

import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden dynamic-gradient text-white py-20">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Your Journey Abroad Starts Here
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto">
              Discover study abroad programs through authentic student reviews.
              Explore local recommendations and plan unforgettable trips.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/programs"
                className="bg-white text-gray-900 px-8 py-4 rounded-sm font-semibold text-lg hover:bg-gray-100 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl"
              >
                Browse Programs
              </Link>
              <Link
                to="/places"
                className="bg-gray-800 text-white px-8 py-4 rounded-sm font-semibold text-lg hover:bg-gray-700 hover:-translate-y-2 transition-all duration-300 border-2 border-white shadow-lg hover:shadow-2xl"
              >
                Explore Places
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Everything You Need to Study Abroad
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Programs Feature */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                Research Programs
              </h3>
              <p className="text-gray-600 mb-4">
                Browse verified study abroad programs with detailed reviews of
                academics, housing, and overall experience from real students.
              </p>
              <Link
                to="/programs"
                className="text-gray-900 font-semibold hover:text-gray-600 underline"
              >
                View Programs →
              </Link>
            </div>

            {/* Places Feature */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                Discover Places
              </h3>
              <p className="text-gray-600 mb-4">
                Find the best restaurants, activities, and local gems through
                crowdsourced recommendations from fellow students.
              </p>
              <Link
                to="/places"
                className="text-gray-900 font-semibold hover:text-gray-600 underline"
              >
                Explore Places →
              </Link>
            </div>

            {/* Trips Feature */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                Plan Trips
              </h3>
              <p className="text-gray-600 mb-4">
                Get inspired by student travel stories and plan your own weekend
                getaways during your time abroad.
              </p>
              <Link
                to="/trips"
                className="text-gray-900 font-semibold hover:text-gray-600 underline"
              >
                Plan Your Trip →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            How Abroadly Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-gray-900">1</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Sign Up</h3>
              <p className="text-gray-600 text-sm">
                Create your account with your university email
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-gray-900">2</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Explore</h3>
              <p className="text-gray-600 text-sm">
                Browse programs and places with authentic reviews
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-gray-900">3</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Contribute</h3>
              <p className="text-gray-600 text-sm">
                Share your experiences to help future students
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-gray-900">4</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Connect</h3>
              <p className="text-gray-600 text-sm">
                Join a community of students studying abroad
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Join thousands of students exploring the world through study abroad
            programs.
          </p>
          <Link
            to="/auth"
            className="bg-white text-gray-900 px-8 py-4 rounded-none font-semibold text-lg hover:bg-gray-100 hover:-translate-y-2 transition-all duration-300 inline-block shadow-lg hover:shadow-2xl"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
