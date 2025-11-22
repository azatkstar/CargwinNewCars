import React, { useState } from 'react';

const CarGallery = ({ images = [], title }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Mock дополнительных изображений если мало
  const allImages = [
    ...(images || []),
    // Fallback images если мало
    ...(images?.length < 5 ? [
      'https://via.placeholder.com/800x600?text=Exterior+View',
      'https://via.placeholder.com/800x600?text=Interior+View',
      'https://via.placeholder.com/800x600?text=Dashboard+View'
    ] : [])
  ].slice(0, 10);  // Max 10 images

  if (!allImages || allImages.length === 0) return null;

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Photo Gallery</h2>
        
        {/* Main Image - Large */}
        <div className="mb-4">
          <img
            src={allImages[selectedImage]}
            alt={`${title} - view ${selectedImage + 1}`}
            className="w-full h-[500px] object-cover rounded-xl"
          />
        </div>
        
        {/* Thumbnails - Scrollable */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === idx ? 'border-red-600 scale-105' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
        
        {/* Counter */}
        <p className="text-center text-sm text-gray-500 mt-3">
          {selectedImage + 1} / {allImages.length}
        </p>
      </div>
    </div>
  );
};

export default CarGallery;