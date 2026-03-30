import React from 'react';
import VideoMosaic from '../components/VideoMosaic';
import './Gallery.css';

const Gallery = () => {
    return (
        <div className="gallery-page animate-fade-in" style={{ padding: 0 }}>
            {/* 🎥 Video Mosaic Hero at Top */}
            <VideoMosaic />
        </div>
    );
};

export default Gallery;
