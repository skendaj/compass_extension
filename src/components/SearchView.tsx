import React, { useState } from "react";
import { Search } from "lucide-react";

interface SearchViewProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchView: React.FC<SearchViewProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const exampleQueries = [
    "How to migrate a project to Vapor 3",
    "How do I request medical leave?",
    "Who manages performance reviews?",
    "I cannot connect to Cisco VPN",
    "How to create a new project with Vapor",
  ];

  const handleExampleClick = (example: string) => {
    setQuery(example);
    onSearch(example);
  };

  return (
    <div className="search-view">
      <div className="search-hero">
        <div className="search-icon-wrapper">
          <img
            src={chrome.runtime.getURL("assets/logo512.png")}
            alt="Navify Logo"
            className="logo-icon"
          />
        </div>
        <h2>What can we help you with today?</h2>
        <p>Search for solutions, find experts, or explore our knowledge base        </p>
      </div>

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
          {isLoading ? "Searching..." : "Search"}
        </button>
      </form>

    
    </div>
  );
};

export default SearchView;
