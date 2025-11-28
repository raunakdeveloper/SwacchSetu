import React from 'react';

const ImageViewerModal = ({ src, alt, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2001] flex items-center justify-center bg-black/70">
      {/* backdrop click to close */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="relative z-10 max-w-4xl w-full px-4">
        <div className="bg-white rounded-lg overflow-hidden shadow-lg">
          <div className="flex justify-between items-center px-4 py-3 border-b">
            <p className="font-semibold text-gray-800 truncate">
              {alt || 'Image preview'}
            </p>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl leading-none"
            >
              ✕
            </button>
          </div>
          <div className="bg-black flex items-center justify-center">
            <img
              src={src}
              alt={alt}
              className="max-h-[80vh] w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewerModal;
