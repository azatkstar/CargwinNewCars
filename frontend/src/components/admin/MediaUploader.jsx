import React, { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Upload, X, Star, Image as ImageIcon } from 'lucide-react';

const MediaUploader = ({ images = [], onChange, error }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = async (files) => {
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        if (file.size <= 10 * 1024 * 1024) { // 10MB limit
          formData.append('files', file);
        }
      });

      // Upload to backend
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${BACKEND_URL}/api/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const uploadedImages = await response.json();
        
        // Add uploaded images to existing ones
        const newImages = uploadedImages.map(img => ({
          url: img.url,
          alt: img.alt || '',
          width: img.width || 1920,
          height: img.height || 1080
        }));
        
        onChange([...images, ...newImages]);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const updateImage = (imageId, field, value) => {
    const updatedImages = images.map(img => 
      img.id === imageId ? { ...img, [field]: value } : img
    );
    onChange(updatedImages);
  };

  const removeImage = (imageId) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    onChange(updatedImages);
  };

  const setAsHero = (imageId) => {
    const updatedImages = images.map(img => ({
      ...img,
      isHero: img.id === imageId
    }));
    onChange(updatedImages);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-red-500 bg-red-50' 
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        data-upload-dropzone
      >
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 text-gray-400">
            {uploading ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            ) : (
              <Upload className="w-12 h-12" />
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {uploading ? 'Загружаем изображения...' : 'Перетащите изображения сюда'}
            </p>
            <p className="text-sm text-gray-600">
              или нажмите для выбора файлов
            </p>
          </div>

          <div className="text-xs text-gray-500">
            Требования: ≥1920×1080 для hero, ≥1200×900 для галереи, ≤10MB на файл
          </div>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={uploading}
          >
            Выбрать файлы
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Загруженные изображения ({images.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {images.map((image, index) => (
              <div key={image.id || image.url || index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Image Preview */}
                <div className="relative aspect-video bg-gray-100">
                  {image.url ? (
                    <img 
                      src={image.url}
                      alt={image.alt || `Изображение ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Image failed to load:', image.url);
                        e.target.src = 'https://via.placeholder.com/800x450?text=Image+Not+Available';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                  
                  {/* Hero Badge */}
                  {image.isHero && (
                    <div className="absolute top-2 left-2">
                      <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Главное
                      </div>
                    </div>
                  )}

                  {/* Remove Button */}
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                    onClick={() => removeImage(image.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Image Settings */}
                <div className="p-4 space-y-4">
                  <div>
                    <Label htmlFor={`alt-${image.id}`}>Alt текст *</Label>
                    <Input
                      id={`alt-${image.id}`}
                      value={image.alt}
                      onChange={(e) => updateImage(image.id, 'alt', e.target.value)}
                      placeholder="Описание изображения для SEO"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`ratio-${image.id}`}>Соотношение сторон</Label>
                    <Select 
                      value={image.ratio} 
                      onValueChange={(value) => updateImage(image.id, 'ratio', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16:9">16:9 (Hero)</SelectItem>
                        <SelectItem value="4:3">4:3 (Галерея)</SelectItem>
                        <SelectItem value="1:1">1:1 (Превью)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {image.width} × {image.height}
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAsHero(image.id)}
                      disabled={image.isHero}
                    >
                      <Star className="w-4 h-4 mr-1" />
                      {image.isHero ? 'Главное' : 'Сделать главным'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;