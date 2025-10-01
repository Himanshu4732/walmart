import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle,
  Eye,
  BarChart3
} from 'lucide-react';
import { farmsAPI, predictionsAPI, Farm, UploadResponse } from '../services/api';

const UploadStub: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    try {
      const farmsData = await farmsAPI.getFarms();
      setFarms(farmsData);
      if (farmsData.length > 0) {
        setSelectedFarm(farmsData[0].id);
      }
    } catch (error) {
      console.error('Failed to load farms:', error);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Please select an image file');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Please select an image file');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedFarm) {
      setError('Please select both a farm and an image file');
      return;
    }

    setUploading(true);
    setError('');
    setResult(null);

    try {
      const response = await predictionsAPI.uploadImage(selectedFarm, selectedFile);
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setResult(null);
    setError('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload & Analyze</h1>
        <p className="text-gray-600 mt-1">
          Upload crop images for AI-powered yield analysis
        </p>
      </div>

      {/* Instructions */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-6 w-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Demo Mode</h3>
            <p className="text-blue-800 text-sm mt-1">
              This is a stub implementation that returns mock AI predictions. 
              In production, this would integrate with YOLOv8 or ONNX models for real crop detection.
            </p>
            <div className="mt-2 text-xs text-blue-700">
              💡 Check the README.md for instructions on integrating real ML models
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="space-y-6">
          {/* Farm Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Farm</h3>
            {farms.length > 0 ? (
              <select
                value={selectedFarm || ''}
                onChange={(e) => setSelectedFarm(parseInt(e.target.value))}
                className="input-field"
              >
                {farms.map((farm) => (
                  <option key={farm.id} value={farm.id}>
                    {farm.name} - {farm.crop_type} ({farm.location})
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>No farms available. Please create a farm first.</p>
              </div>
            )}
          </div>

          {/* File Upload */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Image</h3>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-primary-500 bg-primary-50'
                  : selectedFile
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-primary-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="space-y-3">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                  <div>
                    <p className="font-medium text-green-900">{selectedFile.name}</p>
                    <p className="text-sm text-green-700">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={resetUpload}
                    className="text-sm text-green-600 hover:text-green-500"
                  >
                    Choose different file
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      Drop your image here
                    </p>
                    <p className="text-gray-600">or click to browse</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="btn-primary inline-flex items-center space-x-2 cursor-pointer"
                  >
                    <ImageIcon className="h-5 w-5" />
                    <span>Select Image</span>
                  </label>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {selectedFile && selectedFarm && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full mt-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Analyzing Image...
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Analyze Image</span>
                  </div>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {result && (
            <>
              {/* Analysis Results */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <p className="text-sm text-primary-600 font-medium">Items Detected</p>
                    <p className="text-2xl font-bold text-primary-900">{result.detected_count}</p>
                  </div>
                  
                  <div className="bg-accent-50 p-4 rounded-lg">
                    <p className="text-sm text-accent-600 font-medium">Predicted Yield</p>
                    <p className="text-2xl font-bold text-accent-900">{result.predicted_kg} kg</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Confidence</p>
                    <p className="text-2xl font-bold text-green-900">
                      {(result.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Avg. Ripeness</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {(result.ripeness_analysis.average_ripeness * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Ripeness Breakdown */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Ripeness Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Ripe</span>
                      <span className="font-medium text-green-600">
                        {result.ripeness_analysis.ripe} items
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Nearly Ripe</span>
                      <span className="font-medium text-yellow-600">
                        {result.ripeness_analysis.nearly_ripe} items
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Unripe</span>
                      <span className="font-medium text-red-600">
                        {result.ripeness_analysis.unripe} items
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detection Boxes Preview */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Detection Details
                </h3>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Eye className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">
                      {result.boxes.length} bounding boxes detected
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Highest confidence: {Math.max(...result.boxes.map(b => b.confidence)).toFixed(2)}</p>
                    <p>• Lowest confidence: {Math.min(...result.boxes.map(b => b.confidence)).toFixed(2)}</p>
                    <p>• Average size: {(result.boxes.reduce((sum, b) => sum + b.width * b.height, 0) / result.boxes.length).toFixed(0)} px²</p>
                  </div>
                </div>

                <div className="mt-4 text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg">
                  💡 In production, this would show the actual image with bounding boxes overlaid. 
                  The detection coordinates are available in the API response for visualization.
                </div>
              </div>
            </>
          )}

          {!result && (
            <div className="card">
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready for Analysis
                </h3>
                <p className="text-gray-600">
                  Upload an image to see AI-powered yield predictions and crop analysis
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sample Images */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Images</h3>
        <p className="text-gray-600 mb-4">
          Try these sample images to see how the analysis works:
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['tomatoes.jpg', 'apples.jpg', 'strawberries.jpg', 'oranges.jpg'].map((filename) => (
            <div key={filename} className="border border-gray-200 rounded-lg p-3 text-center">
              <div className="bg-gray-100 h-24 rounded-lg flex items-center justify-center mb-2">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900">{filename}</p>
              <p className="text-xs text-gray-500">Sample crop image</p>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          📁 Sample images are available in <code>backend/app/static/sample_images/</code>
        </div>
      </div>
    </div>
  );
};

export default UploadStub;