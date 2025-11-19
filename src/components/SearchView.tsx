import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';

interface SearchViewProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchView: React.FC<SearchViewProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const exampleQueries = [
    'API returns 500 error in production',
    'How to request parental leave',
    'Database migration best practices',
    'React component not re-rendering',
    'How to setup CI/CD pipeline',
    'Benefits enrollment deadline',
  ];

  const handleExampleClick = (example: string) => {
    setQuery(example);
    onSearch(example);
  };

  return (
    <div className="search-view">
      <div className="search-hero">
        <div className="search-icon-wrapper">
          <Sparkles size={48} className="sparkle-icon" />
        </div>
        <h2>What can we help you with today?</h2>
        <p>Search for solutions, find experts, or explore our knowledge base</p>
      </div>

      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <Search className="search-input-icon" size={20} />
          <input
            type="text"
            className="search-input"
            placeholder="Ask a question or describe your problem..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            autoFocus
          />
        </div>
        <button 
          type="submit" 
          className="search-submit-btn"
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className="examples-section">
        <h3>Popular searches:</h3>
        <div className="examples-grid">
          {exampleQueries.map((example, index) => (
            <button
              key={index}
              className="example-chip"
              onClick={() => handleExampleClick(example)}
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <span className="feature-icon">🔍</span>
          <h4>Smart Search</h4>
          <p>AI-powered search understands your intent and finds relevant solutions</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">👥</span>
          <h4>Find Experts</h4>
          <p>Connect with team members who have solved similar problems</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">📚</span>
          <h4>Knowledge Base</h4>
          <p>Access documented solutions from past conversations</p>
        </div>
      </div>
    </div>
  );
};

export default SearchView;

