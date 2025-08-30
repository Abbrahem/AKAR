import React from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';

const SimpleMap = ({ 
  center = [24.7136, 46.6753], // Riyadh coordinates
  zoom = 12,
  markers = [],
  onLocationSelect,
  height = '400px',
  className = '',
  address,
  detailedAddress
}) => {
  const handleMapClick = () => {
    if (onLocationSelect) {
      onLocationSelect({ lat: center[0], lng: center[1] });
    }
  };

  return (
    <div className={className}>
      <div 
        style={{ height, width: '100%' }}
        className="rounded-lg overflow-hidden border border-gray-200 bg-gradient-to-br from-green-50 to-blue-50 relative cursor-pointer"
        onClick={handleMapClick}
      >
        {/* Map Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#059669" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Center Marker */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-red-500 rounded-full p-2 shadow-lg animate-bounce">
            <MapPinIcon className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Location Info */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs">
          <div className="flex items-start space-x-2 rtl:space-x-reverse">
            <MapPinIcon className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">الموقع</p>
              {detailedAddress ? (
                <p className="text-xs text-gray-600 leading-relaxed">{detailedAddress}</p>
              ) : address ? (
                <p className="text-xs text-gray-600">{address}</p>
              ) : (
                <p className="text-xs text-gray-600">
                  {center[0].toFixed(4)}, {center[1].toFixed(4)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg">
          <button className="block p-2 hover:bg-gray-50 border-b border-gray-200">
            <span className="text-lg font-bold text-gray-600">+</span>
          </button>
          <button className="block p-2 hover:bg-gray-50">
            <span className="text-lg font-bold text-gray-600">−</span>
          </button>
        </div>

        {/* Interactive Overlay */}
        <div className="absolute inset-0 bg-transparent hover:bg-blue-500/5 transition-colors duration-200">
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
            <div className="bg-black/75 text-white px-3 py-1 rounded-lg text-sm">
              {onLocationSelect ? 'انقر لاختيار الموقع' : 'عرض الخريطة'}
            </div>
          </div>
        </div>

        {/* Additional Markers */}
        {markers.map((marker, index) => (
          <div
            key={index}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: '50%',
              top: '50%',
            }}
          >
            <div className="bg-blue-500 rounded-full p-1 shadow-lg">
              <MapPinIcon className="w-4 h-4 text-white" />
            </div>
            {marker.title && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white rounded px-2 py-1 text-xs shadow-lg whitespace-nowrap">
                {marker.title}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleMap;
