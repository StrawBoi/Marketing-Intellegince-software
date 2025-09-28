import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription } from './ui/alert';
import { 
  History, 
  Clock, 
  MapPin, 
  Heart, 
  Users, 
  ChevronRight,
  RefreshCw,
  Trash2,
  Search,
  Calendar,
  Filter
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HistoryPanel = ({ onSelectHistory, isOpen, onToggle }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    if (isOpen) {
      loadCampaignHistory();
    }
  }, [isOpen]);

  const loadCampaignHistory = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API}/history?limit=20`);
      setCampaigns(response.data.campaigns || []);
    } catch (error) {
      console.error('Error loading campaign history:', error);
      toast.error('Failed to load campaign history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCampaign = (campaign) => {
    if (onSelectHistory) {
      onSelectHistory({
        age_range: campaign.age_range,
        geographic_location: campaign.geographic_location,
        interests: campaign.interests
      });
      toast.success('Campaign data loaded into form');
    }
  };

  const handleDeleteCampaign = async (campaignId, event) => {
    event.stopPropagation();
    
    try {
      await axios.delete(`${API}/history/${campaignId}`);
      setCampaigns(campaigns.filter(c => c.id !== campaignId));
      toast.success('Campaign deleted successfully');
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = !searchTerm || 
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.age_range.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.geographic_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.interests.some(interest => interest.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = selectedFilter === 'all' ||
      (selectedFilter === 'recent' && new Date(campaign.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (selectedFilter === 'age' && campaign.age_range === selectedFilter);

    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const CampaignCard = ({ campaign }) => (
    <Card 
      className="group cursor-pointer hover:shadow-md transition-all duration-200 border hover:border-indigo-200"
      onClick={() => handleSelectCampaign(campaign)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
              {campaign.age_range}
            </h4>
            <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{campaign.geographic_location}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
        </div>
        
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {campaign.interests.slice(0, 3).map((interest, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                {interest}
              </Badge>
            ))}
            {campaign.interests.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                +{campaign.interests.length - 3} more
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(campaign.created_at)}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
              onClick={(e) => handleDeleteCampaign(campaign.id, e)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!isOpen) {
    return (
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50">
        <Button
          onClick={onToggle}
          className="rounded-full w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
          data-testid="history-toggle-button"
        >
          <History className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl border-l border-slate-200 z-50 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">Campaign History</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="hover:bg-slate-100"
            data-testid="close-history-panel"
          >
            ✕
          </Button>
        </div>
        
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              data-testid="history-search-input"
            />
          </div>
          
          {/* Filter buttons */}
          <div className="flex gap-2">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('all')}
              className="text-xs"
            >
              All
            </Button>
            <Button
              variant={selectedFilter === 'recent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('recent')}
              className="text-xs"
            >
              Recent
            </Button>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {filteredCampaigns.length} campaigns
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadCampaignHistory}
              disabled={isLoading}
              className="h-6 px-2 text-xs"
            >
              {isLoading ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2 mb-3"></div>
                      <div className="flex gap-2">
                        <div className="h-5 bg-slate-200 rounded w-16"></div>
                        <div className="h-5 bg-slate-200 rounded w-20"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredCampaigns.length > 0 ? (
              <div className="space-y-3" data-testid="history-campaigns-list">
                {filteredCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="font-semibold text-slate-600 mb-2">
                  {searchTerm ? 'No matching campaigns' : 'No campaigns yet'}
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : 'Generate your first marketing intelligence campaign to see it here'
                  }
                </p>
                {searchTerm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear search
                  </Button>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <Alert>
          <History className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Click any campaign to load its data into the form and regenerate intelligence.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default HistoryPanel;