// Contributors:
// Cursor AI Assistant - AI Trip Planner component

import React, { useState, useEffect, useRef } from 'react';
import { aiApi, TripPlanRequest } from '../services/api';

interface TripPlannerProps {
  hasBookmarks: boolean;
}

const TripPlanner: React.FC<TripPlannerProps> = ({ hasBookmarks }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState('');
  const [quickSuggestion, setQuickSuggestion] = useState('');
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [error, setError] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState<TripPlanRequest>({
    travel_start_date: '',
    travel_end_date: '',
    budget: undefined,
    travel_style: undefined,
    priorities: [],
    additional_notes: '',
  });

  const priorityOptions = [
    { id: 'food', label: '🍽️ Food & Dining', icon: '🍽️' },
    { id: 'sightseeing', label: '📸 Sightseeing', icon: '📸' },
    { id: 'nightlife', label: '🎉 Nightlife', icon: '🎉' },
    { id: 'culture', label: '🏛️ Culture & History', icon: '🏛️' },
    { id: 'nature', label: '🌿 Nature & Outdoors', icon: '🌿' },
    { id: 'shopping', label: '🛍️ Shopping', icon: '🛍️' },
    { id: 'relaxation', label: '🧘 Relaxation', icon: '🧘' },
    { id: 'adventure', label: '🏔️ Adventure', icon: '🏔️' },
  ];

  const budgetOptions = [
    { value: 'low', label: '💰 Budget-Friendly', description: 'Hostels, street food, public transport' },
    { value: 'medium', label: '💰💰 Mid-Range', description: 'Hotels, nice restaurants, some tours' },
    { value: 'high', label: '💰💰💰 Luxury', description: 'Premium stays, fine dining, private tours' },
  ];

  const styleOptions = [
    { value: 'adventure', label: '🏔️ Adventure', description: 'Active & exciting' },
    { value: 'relaxed', label: '🌴 Relaxed', description: 'Slow-paced & chill' },
    { value: 'cultural', label: '🏛️ Cultural', description: 'Museums & history' },
    { value: 'foodie', label: '🍜 Foodie', description: 'Culinary focused' },
    { value: 'party', label: '🎉 Social', description: 'Nightlife & meeting people' },
  ];

  // Load quick suggestion on mount
  useEffect(() => {
    if (hasBookmarks) {
      loadQuickSuggestion();
    }
  }, [hasBookmarks]);

  const loadQuickSuggestion = async () => {
    setLoadingSuggestion(true);
    try {
      const data = await aiApi.getQuickSuggestion();
      setQuickSuggestion(data.suggestion);
    } catch (err) {
      console.error('Failed to get quick suggestion:', err);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const togglePriority = (priority: string) => {
    setFormData(prev => ({
      ...prev,
      priorities: prev.priorities?.includes(priority)
        ? prev.priorities.filter(p => p !== priority)
        : [...(prev.priorities || []), priority],
    }));
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setGeneratedPlan('');
    setError('');

    try {
      const response = await aiApi.planTrip(formData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate trip plan');
      }

      // Stream the response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Failed to read response');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setGeneratedPlan(prev => prev + chunk);

        // Scroll to bottom as content streams in
        if (resultRef.current) {
          resultRef.current.scrollTop = resultRef.current.scrollHeight;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate trip plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatPlanText = (text: string) => {
    // Convert markdown-style formatting to HTML-like structure
    return text
      .split('\n')
      .map((line, index) => {
        // Headers
        if (line.startsWith('# ')) {
          return <h2 key={index} className="text-2xl font-bold text-gray-900 mt-6 mb-3">{line.slice(2)}</h2>;
        }
        if (line.startsWith('## ')) {
          return <h3 key={index} className="text-xl font-semibold text-gray-800 mt-5 mb-2">{line.slice(3)}</h3>;
        }
        if (line.startsWith('### ')) {
          return <h4 key={index} className="text-lg font-medium text-gray-700 mt-4 mb-2">{line.slice(4)}</h4>;
        }
        // Bold text
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={index} className="font-semibold text-gray-800 mt-2">{line.slice(2, -2)}</p>;
        }
        // List items
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <li key={index} className="ml-4 text-gray-700 mb-1 flex items-start">
              <span className="mr-2 text-blue-500">•</span>
              <span>{line.slice(2)}</span>
            </li>
          );
        }
        // Numbered lists
        if (/^\d+\.\s/.test(line)) {
          return <li key={index} className="ml-4 text-gray-700 mb-1">{line}</li>;
        }
        // Empty lines
        if (line.trim() === '') {
          return <br key={index} />;
        }
        // Regular paragraphs
        return <p key={index} className="text-gray-700 mb-2">{line}</p>;
      });
  };

  if (!hasBookmarks) {
    return (
      <div className="relative rounded-2xl p-8 text-white mb-8 shadow-xl overflow-hidden" style={{ backgroundImage: 'url(/trip-planner-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-5xl">🤖✨</div>
          <div>
            <h2 className="text-2xl font-bold">AI Trip Planner</h2>
            <p className="text-white/80">Your personal travel assistant</p>
          </div>
        </div>
        <p className="text-lg mb-4">
          Start bookmarking programs, places, and trips to unlock AI-powered trip planning! 
          I'll help you create personalized itineraries based on your saved destinations and real student reviews.
        </p>
        <div className="flex items-center gap-2 text-white/70">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Bookmark at least one item to get started</span>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden mb-8 shadow-xl">
      {/* Header - Always visible with background image */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative w-full p-6 flex items-center justify-between text-white hover:brightness-110 transition"
        style={{ backgroundImage: 'url(/trip-planner-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Overlay for readability - only on header */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
        
        {/* Header content - above overlay */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="text-4xl animate-pulse">🤖✨</div>
          <div className="text-left">
            <h2 className="text-2xl font-bold">AI Trip Planner</h2>
            {loadingSuggestion ? (
              <p className="text-white/70 text-sm">Loading suggestion...</p>
            ) : quickSuggestion ? (
              <p className="text-white/90 text-sm max-w-2xl">{quickSuggestion}</p>
            ) : (
              <p className="text-white/80">Plan your perfect trip from your bookmarks</p>
            )}
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
            {isExpanded ? 'Collapse' : 'Plan a Trip'}
          </span>
          <svg
            className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="bg-white p-6 space-y-6">
          {/* Travel Dates */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">📅 When are you traveling?</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.travel_start_date || ''}
                  onChange={(e) => setFormData({ ...formData, travel_start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.travel_end_date || ''}
                  onChange={(e) => setFormData({ ...formData, travel_end_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">💵 What's your budget?</label>
            <div className="grid grid-cols-3 gap-3">
              {budgetOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData({ ...formData, budget: option.value as any })}
                  className={`p-3 rounded-lg border-2 text-left transition ${
                    formData.budget === option.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Travel Style */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">🎨 What's your travel style?</label>
            <div className="flex flex-wrap gap-2">
              {styleOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData({ ...formData, travel_style: option.value as any })}
                  className={`px-4 py-2 rounded-full border-2 transition ${
                    formData.travel_style === option.value
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-300 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priorities */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">⭐ What's important to you? (Select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {priorityOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => togglePriority(option.id)}
                  className={`px-4 py-2 rounded-full border-2 transition ${
                    formData.priorities?.includes(option.id)
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-300 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">📝 Anything else I should know?</label>
            <textarea
              value={formData.additional_notes || ''}
              onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
              placeholder="E.g., 'I'm traveling with a friend who loves art', 'I have dietary restrictions', 'I prefer morning activities'..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-lg rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating your personalized trip plan...
              </>
            ) : (
              <>
                ✨ Generate My Trip Plan
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Generated Plan */}
          {generatedPlan && (
            <div
              ref={resultRef}
              className="mt-6 bg-gray-50 rounded-xl p-6 max-h-[600px] overflow-y-auto border border-gray-200"
            >
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
                <span className="text-2xl">🗺️</span>
                <h3 className="text-xl font-bold text-gray-900">Your Personalized Trip Plan</h3>
              </div>
              <div className="prose prose-sm max-w-none">
                {formatPlanText(generatedPlan)}
              </div>
              {!isGenerating && (
                <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedPlan)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy to Clipboard
                  </button>
                  <button
                    onClick={handleGeneratePlan}
                    className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TripPlanner;

