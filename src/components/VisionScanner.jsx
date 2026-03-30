import React, { useState } from 'react';
import { Camera, Loader2, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import './VisionScanner.css';
import { analyzeFoodImage } from '../services/aiService';

const VisionScanner = ({ onResult }) => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setError(null);
        }
    };

    const scanFood = async () => {
        if (!image) return;
        setLoading(true);
        setError(null);

        try {
            const base64Data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(image);
            });

            const suggestions = await analyzeFoodImage(base64Data);
            onResult(suggestions);
        } catch (err) {
            console.error('AI Scan Error:', err);
            setError(`AI Error: ${err.message || 'Failed to analyze image'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="vision-scanner glass-panel" style={{ borderRadius: '24px', overflow: 'hidden' }}>
            <div className="upload-section" style={{ padding: '1rem' }}>
                {!preview ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <label className="upload-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                            <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                            <ImageIcon size={32} color="var(--color-primary)" />
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Gallery</span>
                        </label>
                        <label className="upload-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                            <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} hidden />
                            <Camera size={32} color="var(--color-primary)" />
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Camera</span>
                        </label>
                    </div>
                ) : (
                    <div style={{ position: 'relative' }}>
                        <img 
                            src={preview} 
                            alt="Meal preview" 
                            style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '16px' }} 
                        />
                        {!loading && (
                            <button 
                                onClick={() => { setImage(null); setPreview(null); }}
                                style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 20, fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                                Change
                            </button>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <div style={{ padding: '1rem', color: '#ff4444', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,68,68,0.05)', margin: '0 1rem 1rem', borderRadius: 12 }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {preview && !loading && !error && (
                <div style={{ padding: '0 1rem 1rem' }}>
                    <button 
                        className="primary-button" 
                        onClick={scanFood}
                        style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 800 }}
                    >
                        Analyze Plate
                    </button>
                </div>
            )}

            {loading && (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <Loader2 size={32} className="animate-spin" color="var(--color-primary)" style={{ margin: '0 auto 15px' }} />
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-dim)' }}>FitCoach AI is identifying your food...</p>
                </div>
            )}
        </div>
    );
};

export default VisionScanner;
