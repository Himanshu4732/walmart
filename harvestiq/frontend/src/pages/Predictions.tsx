import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  TrendingUp, 
  Edit3, 
  Trash2,
  Plus,
  Filter,
  Download
} from 'lucide-react';
import { predictionsAPI, farmsAPI, Prediction, Farm } from '../services/api';

const Predictions: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarm, setSelectedFarm] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPrediction, setEditingPrediction] = useState<Prediction | null>(null);
  const [newPrediction, setNewPrediction] = useState({
    farm_id: 0,
    detected_count: 0,
    predicted_kg: 0,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [predictionsData, farmsData] = await Promise.all([
        predictionsAPI.getPredictions(),
        farmsAPI.getFarms(),
      ]);
      setPredictions(predictionsData);
      setFarms(farmsData);
      if (farmsData.length > 0) {
        setNewPrediction(prev => ({ ...prev, farm_id: farmsData[0].id }));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await predictionsAPI.createPrediction(newPrediction);
      setNewPrediction({
        farm_id: farms[0]?.id || 0,
        detected_count: 0,
        predicted_kg: 0,
        notes: '',
      });
      setShowCreateModal(false);
      loadData();
    } catch (error) {
      console.error('Failed to create prediction:', error);
    }
  };

  const handleUpdatePrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrediction) return;

    try {
      await predictionsAPI.updatePrediction(editingPrediction.id, {
        detected_count: editingPrediction.detected_count,
        predicted_kg: editingPrediction.predicted_kg,
        notes: editingPrediction.notes,
      });
      setEditingPrediction(null);
      loadData();
    } catch (error) {
      console.error('Failed to update prediction:', error);
    }
  };

  const handleDeletePrediction = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this prediction?')) {
      try {
        await predictionsAPI.deletePrediction(id);
        loadData();
      } catch (error) {
        console.error('Failed to delete prediction:', error);
      }
    }
  };

  const filteredPredictions = selectedFarm
    ? predictions.filter(p => p.farm_id === selectedFarm)
    : predictions;

  const sortedPredictions = filteredPredictions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Predictions History</h1>
          <p className="text-gray-600 mt-1">
            Track and manage your yield predictions over time
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Prediction</span>
          </button>
        </div>
      </div>

      {/* Filters and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-3">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Filter by Farm</h3>
          </div>
          <select
            value={selectedFarm || ''}
            onChange={(e) => setSelectedFarm(e.target.value ? parseInt(e.target.value) : null)}
            className="input-field"
          >
            <option value="">All Farms</option>
            {farms.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stats Cards */}
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Predictions</p>
              <p className="text-2xl font-bold text-gray-900">{filteredPredictions.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-accent-100 rounded-lg">
              <Calendar className="h-6 w-6 text-accent-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Yield</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredPredictions.reduce((sum, p) => sum + p.predicted_kg, 0).toFixed(1)} kg
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. per Prediction</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredPredictions.length > 0 
                  ? (filteredPredictions.reduce((sum, p) => sum + p.predicted_kg, 0) / filteredPredictions.length).toFixed(1)
                  : '0'} kg
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Predictions Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Prediction Records
            {selectedFarm && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                for {farms.find(f => f.id === selectedFarm)?.name}
              </span>
            )}
          </h3>
          
          {filteredPredictions.length > 0 && (
            <button className="btn-secondary flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          )}
        </div>

        {sortedPredictions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Farm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detected Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Predicted Yield
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedPredictions.map((prediction) => {
                  const farm = farms.find(f => f.id === prediction.farm_id);
                  return (
                    <tr key={prediction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(prediction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {farm?.name || 'Unknown Farm'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {farm?.crop_type}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {prediction.detected_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-primary-600">
                          {prediction.predicted_kg} kg
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {prediction.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setEditingPrediction(prediction)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePrediction(prediction.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No predictions yet
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedFarm 
                ? 'No predictions found for the selected farm'
                : 'Start by uploading crop images or manually adding predictions'
              }
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Add First Prediction
            </button>
          </div>
        )}
      </div>

      {/* Create Prediction Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Prediction</h3>
            <form onSubmit={handleCreatePrediction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Farm</label>
                <select
                  required
                  value={newPrediction.farm_id}
                  onChange={(e) => setNewPrediction({ ...newPrediction, farm_id: parseInt(e.target.value) })}
                  className="input-field mt-1"
                >
                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.name} - {farm.crop_type}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Detected Count</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newPrediction.detected_count}
                  onChange={(e) => setNewPrediction({ ...newPrediction, detected_count: parseInt(e.target.value) || 0 })}
                  className="input-field mt-1"
                  placeholder="Number of items detected"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Predicted Yield (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={newPrediction.predicted_kg}
                  onChange={(e) => setNewPrediction({ ...newPrediction, predicted_kg: parseFloat(e.target.value) || 0 })}
                  className="input-field mt-1"
                  placeholder="Predicted yield in kg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                <textarea
                  value={newPrediction.notes}
                  onChange={(e) => setNewPrediction({ ...newPrediction, notes: e.target.value })}
                  className="input-field mt-1"
                  rows={3}
                  placeholder="Additional notes about this prediction"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Add Prediction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Prediction Modal */}
      {editingPrediction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Prediction</h3>
            <form onSubmit={handleUpdatePrediction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Detected Count</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editingPrediction.detected_count}
                  onChange={(e) => setEditingPrediction({ 
                    ...editingPrediction, 
                    detected_count: parseInt(e.target.value) || 0 
                  })}
                  className="input-field mt-1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Predicted Yield (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={editingPrediction.predicted_kg}
                  onChange={(e) => setEditingPrediction({ 
                    ...editingPrediction, 
                    predicted_kg: parseFloat(e.target.value) || 0 
                  })}
                  className="input-field mt-1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={editingPrediction.notes || ''}
                  onChange={(e) => setEditingPrediction({ 
                    ...editingPrediction, 
                    notes: e.target.value 
                  })}
                  className="input-field mt-1"
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingPrediction(null)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Update Prediction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Predictions;