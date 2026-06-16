import React, { useState, useRef } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import { Upload, X, Loader2 } from 'lucide-react';

const ImageUpload = ({ images, setImages, maxImages = 5 }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (images.length + files.length > maxImages) {
      toast.error(`You can only upload up to ${maxImages} images`);
      return;
    }

    const formData = new FormData();
    
    // Compress each file before appending
    for (const file of files) {
      try {
        const options = {
          maxSizeMB: 1, // Compress to max 1MB
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: 0.8
        };
        const compressedFile = await imageCompression(file, options);
        formData.append('images', compressedFile, compressedFile.name);
      } catch (error) {
        console.error('Image compression failed:', error);
        // Fallback to original file if compression fails
        formData.append('images', file);
      }
    }

    try {
      setUploading(true);
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImages([...images, ...response.data.urls]);
      toast.success('Images uploaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error uploading images');
    } finally {
      setUploading(false);
      if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async (indexToRemove) => {
    const urlToRemove = images[indexToRemove];
    try {
      setImages(images.filter((_, index) => index !== indexToRemove));
      await api.delete('/upload', { data: { url: urlToRemove } });
    } catch (error) {
      console.error('Failed to delete from server', error);
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        multiple
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
      
      <div 
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
          uploading 
            ? 'border-slate-200 bg-slate-50 cursor-not-allowed' 
            : 'border-slate-300 bg-slate-50 hover:border-sky-500 hover:bg-sky-50 cursor-pointer'
        }`}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-sky-500 animate-spin mb-4" />
            <span className="text-slate-600 font-medium">Uploading images...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="bg-sky-100 p-4 rounded-full mb-4">
              <Upload className="w-8 h-8 text-sky-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Click to Upload Images</h3>
            <p className="text-sm text-slate-500">
              (Max {maxImages} images. PNG, JPG, WEBP up to 5MB each)
            </p>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
          {images.map((url, index) => (
            <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
              <img 
                src={url} 
                alt={`Upload ${index}`} 
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(index);
                }}
                className="absolute top-2 right-2 bg-white/90 hover:bg-white text-rose-500 hover:text-rose-600 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
