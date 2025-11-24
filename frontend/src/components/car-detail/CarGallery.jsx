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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <h3 className="font-bold text-lg mb-4">Photo Gallery</h3>
      
      {/* Main Image - УВЕЛИЧЕНО */}
      <div className="mb-4">
        <img
          src={allImages[selectedImage]}
          alt={`${title} - view ${selectedImage + 1}`}
          className="w-full h-[450px] object-cover rounded-lg"
          loading="lazy"
        />
      </div>
      
      {/* Thumbnails - УВЕЛИЧЕНО */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {allImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImage(idx)}
            className={`flex-shrink-0 w-28 h-24 rounded-lg overflow-hidden border-2 transition-all ${
              selectedImage === idx ? 'border-red-600 scale-105' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <img
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>
      
      {/* Counter */}
      <p className="text-center text-sm text-gray-500 mt-3">
        {selectedImage + 1} / {allImages.length}
      </p>
    </div>
  );
};

export default CarGallery;