import React, { useState } from 'react';

function ImageLoader({ src, alt, className }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    return (
        <div className="relative">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            )}
            <img
                src={src}
                alt={alt}
                className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                onLoad={() => setLoading(false)}
                onError={() => {
                    setLoading(false);
                    setError(true);
                }}
            />
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400 text-sm">Image non disponible</span>
                </div>
            )}
        </div>
    );
}

export default ImageLoader;