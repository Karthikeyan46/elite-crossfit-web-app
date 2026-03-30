import React, { useRef, useEffect } from 'react';
import { galleryItems } from '../data/gymData';
import './VideoMosaic.css';

const CLIPS = [
  { label: 'Strength'  },
  { label: 'CrossFit'  },
  { label: 'Cardio'    },
  { label: 'Skill'     },
  { label: 'Training'  },
  { label: 'Power'     },
  { label: 'Endurance' },
  { label: 'Results'   },
  { label: 'Fitness'   },
  { label: 'Flex'      },
  { label: 'Energy'    },
  { label: 'Elite'     },
];

// ── Single video cell ──────────────────────────────────────────────────────────
function MosaicCell({ src, label, delay = 0 }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current || !src) return;
    const timer = setTimeout(() => {
      videoRef.current?.play().catch(() => {});
    }, delay);
    return () => clearTimeout(timer);
  }, [src, delay]);

  return (
    <div className="mosaic-cell">
      {src ? (
        <video
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          preload="metadata"
          className="mosaic-video"
        />
      ) : (
        <div className="mosaic-placeholder">
          <span className="mosaic-placeholder-label">{label}</span>
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function VideoMosaic() {
  // Manually select 12 unique, high-quality IDs for maximum variety
  const selectionIds = [4, 9, 10, 100, 101, 102, 103, 105, 14, 12, 23, 28];
  
  const videos = selectionIds.map(id => 
    galleryItems.find(item => item.id === id)
  ).filter(Boolean);

  return (
    <section className="mosaic-section">
      <div className="mosaic-wrap">
        {/* Dynamic grid of video cells */}
        <div className="mosaic-grid">
          {CLIPS.map((clip, i) => (
            <MosaicCell
              key={i}
              src={videos[i]?.url}
              label={clip.label}
              delay={i * 200}
            />
          ))}
        </div>

        {/* Dark overlay on top of all videos */}
        <div className="mosaic-overlay" />

        {/* Centre text */}
        <div className="mosaic-text-wrap">
          <h1 className="mosaic-headline">
            Train Smarter.<br />
            <span className="mosaic-accent">Grow Faster.</span>
          </h1>
          <div className="mosaic-underline" />
          <p className="mosaic-sub">
            Elite Cross Fit Studio · Udumalaipettai
          </p>
        </div>

      </div>
    </section>
  );
}
