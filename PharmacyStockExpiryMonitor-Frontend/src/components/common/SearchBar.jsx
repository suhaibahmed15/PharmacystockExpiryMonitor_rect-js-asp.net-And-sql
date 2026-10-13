import React from "react";

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  onReset,
  extraFilters = null,
  className = ""
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} className={`search-box ${className}`}>
      <div className="search-input-wrapper">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="search-input"
        />
        {value && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => {
              onChange("");
              if (onReset) onReset();
            }}
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {extraFilters}

      <button type="submit" className="btn-secondary">
        Filter
      </button>

      {onReset && (
        <button type="button" className="btn-secondary" onClick={onReset}>
          Reset
        </button>
      )}
    </form>
  );
}
