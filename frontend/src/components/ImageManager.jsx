import { useState } from 'react';
import { Button } from './ui/button';
import { X, GripVertical, Plus, Upload } from 'lucide-react';

export default function ImageManager({ images = [], onChange }) {
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    
    onChange(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const addImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      onChange([...images, url]);
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">
          Images ({images.length}/15)
        </label>
        <Button
          type="button"
          onClick={addImage}
          size="sm"
          variant="outline"
          disabled={images.length >= 15}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Photo
        </Button>
      </div>

      {images.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-8 text-center text-gray-500">
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No images yet. Click "Add Photo" to start.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((url, index) => (
            <div
              key={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative group border rounded-lg overflow-hidden cursor-move transition ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
            >
              {/* Drag Handle */}
              <div className="absolute top-2 left-2 bg-black/50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition">
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Index Badge */}
              <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                #{index + 1}
              </div>

              {/* Image Preview */}
              <div className="aspect-video bg-gray-200">
                <img
                  src={url}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x250?text=Invalid+URL';
                  }}
                />
              </div>

              {/* URL Display */}
              <div className="p-2 bg-gray-50">
                <div className="text-xs text-gray-600 truncate">{url}</div>
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute bottom-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-gray-500">
          💡 Drag to reorder. First image will be the main photo.
        </p>
      )}
    </div>
  );
}
