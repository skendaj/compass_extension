import React, { useEffect, useState } from "react";
import { Clock, Search } from "lucide-react";
import { storageService } from "../services/storageService";

interface HistoryViewProps {
  onSearch: (query: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ onSearch }) => {
  const [history, setHistory] = useState<{ query: string; timestamp: Date }[]>(
    [],
  );

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await storageService.getSearchHistory();
    const historyWithDates = data.map((item) => ({
      query: item.query,
      timestamp: new Date(item.timestamp),
    }));
    setHistory(historyWithDates);
  };

  const formatDate = (date: Date) => {
    try {
      const now = new Date();
      const timestamp = new Date(date);

      if (Number.isNaN(timestamp.getTime())) {
        return new Date("2025/11/19").toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }

      const diff = now.getTime() - timestamp.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;

      return timestamp.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      return new Date("2025/11/19").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  return (
    <div className="history-view">
      <div className="history-header">
        <h2>Search History</h2>
        <p>Your recent searches</p>
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Clock size={48} />
          </div>
          <h3>No search history yet</h3>
          <p>Your searches will appear here</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item, index) => (
            <div
              key={index}
              className="history-item"
              onClick={() => onSearch(item.query)}
            >
              <div className="history-item-icon">
                <Search size={18} />
              </div>
              <div className="history-item-content">
                <div className="history-query">{item.query}</div>
                <div className="history-timestamp">
                  {formatDate(item.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
