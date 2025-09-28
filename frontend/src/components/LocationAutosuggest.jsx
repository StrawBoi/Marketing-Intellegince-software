import React, { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { MapPin, Globe, Search, Star } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LocationAutosuggest = ({ 
  value, 
  onChange, 
  placeholder = "e.g., New York City, NY or London, UK",
  className = "",
  ...props 
}) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [popularLocations, setPopularLocations] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef(null);
  const suggestionRefs = useRef([]);
  const containerRef = useRef(null);

  // Load popular locations on mount
  useEffect(() => {
    loadPopularLocations();
  }, []);

  // Update query when value prop changes
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadPopularLocations = async () => {
    try {
      const response = await axios.get(`${API}/geo/popular?limit=10`);
      setPopularLocations(response.data.results || []);
    } catch (error) {
      console.error('Error loading popular locations:', error);
    }
  };

  const searchLocations = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`${API}/geo/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
      setSuggestions(response.data.results || []);
    } catch (error) {
      console.error('Error searching locations:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setSelectedIndex(-1);
    
    // Debounce search
    clearTimeout(window.locationSearchTimeout);
    window.locationSearchTimeout = setTimeout(() => {
      searchLocations(newValue);
    }, 300);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (!query || query.length < 2) {
      // Show popular locations when focused with no query
      setSuggestions(popularLocations);
    }
  };

  const handleLocationSelect = (location) => {
    const selectedValue = location.display;
    setQuery(selectedValue);
    setIsOpen(false);
    setSelectedIndex(-1);
    setSuggestions([]);
    
    if (onChange) {
      onChange({ target: { value: selectedValue } });
    }
  };

  const handleKeyDown = (e) => {
    const currentSuggestions = suggestions.length > 0 ? suggestions : popularLocations;
    
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < currentSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && currentSuggestions[selectedIndex]) {
          handleLocationSelect(currentSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  const getLocationIcon = (type) => {
    switch (type) {
      case 'city':
        return <MapPin className="w-4 h-4 text-blue-600" />;
      case 'country':
        return <Globe className="w-4 h-4 text-green-600" />;
      case 'region':
        return <Globe className="w-4 h-4 text-purple-600" />;
      default:
        return <MapPin className="w-4 h-4 text-slate-400" />;
    }
  };

  const currentSuggestions = suggestions.length > 0 ? suggestions : (query.length < 2 ? popularLocations : []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Field */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`pr-10 ${className}`}
          {...props}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <div className="animate-spin w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full"></div>
          ) : (
            <Search className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && currentSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {/* Header for popular locations */}
          {query.length < 2 && popularLocations.length > 0 && (
            <div className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <Star className="w-3 h-3 text-amber-500" />
              Popular Locations
            </div>
          )}
          
          {/* Suggestions List */}
          <div className="py-1">
            {currentSuggestions.map((location, index) => (
              <div
                key={`${location.type}-${location.name}`}
                ref={el => suggestionRefs.current[index] = el}
                className={`px-3 py-2 cursor-pointer transition-colors flex items-center justify-between hover:bg-blue-50 ${
                  index === selectedIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => handleLocationSelect(location)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {getLocationIcon(location.type)}
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-slate-900 truncate">
                      {location.name}
                    </div>
                    {location.display !== location.name && (
                      <div className="text-sm text-slate-500 truncate">
                        {location.display}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      location.type === 'city' ? 'bg-blue-100 text-blue-700' :
                      location.type === 'country' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {location.type}
                  </Badge>
                  {location.region && (
                    <span className="text-xs text-slate-400">
                      {location.region}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationAutosuggest;