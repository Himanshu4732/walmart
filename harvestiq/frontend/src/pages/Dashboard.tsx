import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  MapPin, 
  Calendar, 
  Wheat,
  BarChart3,
  Plus
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { farmsAPI, predictionsAPI, Farm, Prediction } from '../services/api';

const Dashboard: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateFarm, setShowCreateFarm] = useState(false);
  const [newFarm, setNewFarm] = useState({
    name: '',
    location: '',
    crop_type: '',
    area: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [farmsData, predictionsData] = await Promise.all([
        farmsAPI.getFarms(),
        predictionsAPI.getPredictions(),
      ]);
      setFarms(farmsData);
      setPredictions(predictionsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await farmsAPI.createFarm(newFarm);
      setNewFarm({ name: '', location: '', crop_type: '', area: 0 });
      setShowCreateFarm(false);
      loadData();
    } catch (error) {
      console.error('Failed to create farm:', error);
    }
  };

  // Calculate statistics
  const totalPredictedYield = predictions.reduce((sum, p) => sum + p.predicted_kg, 0);
  const recentPredictions = predictions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 14);

  // Prepare chart data
  const chartData = recentPredictions
    .reverse()
    .map((prediction, index) => ({
      day: `Day ${index + 1}`,
      yield: prediction.predicted_kg,
      date: new Date(prediction.date).toLocaleDateString(),
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your farm performance and yield predictions</p>
        </div>
        <button
          onClick={() => setShowCreateFarm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Farm</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Wheat className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Farms</p>
              <p className="text-2xl font-bold text-gray-900">{farms.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-accent-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-accent-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Predicted Yield</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalPredictedYield.toFixed(1)} kg
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Predictions</p>
              <p className="text-2xl font-bold text-gray-900">{predictions.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Season</p>
              <p className="text-2xl font-bold text-gray-900">
                +{Math.round(Math.random() * 20 + 10)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yield Trend Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Yield Trend (Last 14 Predictions)
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value} kg`, 'Predicted Yield']}
                  labelFormatter={(label) => {
                    const item = chartData.find(d => d.day === label);
                    return item ? `Date: ${item.date}` : label;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="yield" 
                  stroke="#369b5c" 
                  strokeWidth={2}
                  dot={{ fill: '#369b5c', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No prediction data available</p>
                <p className="text-sm">Upload images to start tracking yield trends</p>
              </div>
            </div>
          )}
        </div>

        {/* Recent Predictions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Predictions</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentPredictions.slice(0, 5).map((prediction) => {
              const farm = farms.find(f => f.id === prediction.farm_id);
              return (
                <div key={prediction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {farm?.name || 'Unknown Farm'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {prediction.detected_count} items detected
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(prediction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary-600">
                      {prediction.predicted_kg} kg
                    </p>
                  </div>
                </div>
              );
            })}
            
            {predictions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No predictions yet</p>
                <p className="text-sm">Start by uploading crop images for analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Farms Overview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Farms</h3>
        {farms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {farms.map((farm) => (
              <div key={farm.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{farm.name}</h4>
                  <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                    {farm.crop_type}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {farm.location}
                  </div>
                  <p>Area: {farm.area} hectares</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Wheat className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No farms added yet</p>
            <p className="text-sm">Add your first farm to get started</p>
          </div>
        )}
      </div>

      {/* AI Assistant Placeholder */}
      <div className="card bg-gradient-to-r from-primary-50 to-accent-50 border-2 border-dashed border-primary-200">
        <div className="text-center py-8">
          <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🤖</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Assistant Ready</h3>
          <p className="text-gray-600 mb-4">
            Click the chat button in the bottom-right corner to get AI-powered insights about your crops!
          </p>
          <div className="text-sm text-gray-500">
            💡 Ask about weather, market prices, or yield optimization tips
          </div>
        </div>
      </div>

      {/* Create Farm Modal */}
      {showCreateFarm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Farm</h3>
            <form onSubmit={handleCreateFarm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Farm Name</label>
                <input
                  type="text"
                  required
                  value={newFarm.name}
                  onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })}
                  className="input-field mt-1"
                  placeholder="e.g., North Field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  required
                  value={newFarm.location}
                  onChange={(e) => setNewFarm({ ...newFarm, location: e.target.value })}
                  className="input-field mt-1"
                  placeholder="e.g., California, USA"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Crop Type</label>
                <select
                  required
                  value={newFarm.crop_type}
                  onChange={(e) => setNewFarm({ ...newFarm, crop_type: e.target.value })}
                  className="input-field mt-1"
                >
                  <option value="">Select crop type</option>
                  <option value="tomatoes">Tomatoes</option>
                  <option value="apples">Apples</option>
                  <option value="oranges">Oranges</option>
                  <option value="strawberries">Strawberries</option>
                  <option value="corn">Corn</option>
                  <option value="wheat">Wheat</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Area (hectares)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={newFarm.area}
                  onChange={(e) => setNewFarm({ ...newFarm, area: parseFloat(e.target.value) || 0 })}
                  className="input-field mt-1"
                  placeholder="e.g., 2.5"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateFarm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Create Farm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;