import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, History, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

export default function Progress() {
  const navigate = useNavigate();
  const clientId = localStorage.getItem('clientId');
  
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('client_id', clientId)
        .order('taken_at', { ascending: false });
      
      if (error) throw error;
      setPhotos(data || []);
    } catch (err) {
      console.error('Error loading photos:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${clientId}/${Date.now()}.${fileExt}`;
      const filePath = `progress/${fileName}`;

      // 1. Upload to storage (Bucket: progress-photos)
      const { error: uploadError } = await supabase.storage
        .from('progress-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('progress-photos')
        .getPublicUrl(filePath);

      // 2. Save record to DB (Matches schema.sql)
      const { error: dbError } = await supabase.from('progress_photos').insert({
        client_id: clientId,
        photo_url: publicUrl,
        notes: photos.length === 0 ? 'Initial Phase' : 'Current Progress',
        taken_at: new Date().toISOString()
      });

      if (dbError) throw dbError;

      load();
      alert('Transformation photo saved!');
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload photo. Ensure "progress-photos" bucket exists in Supabase.');
    } finally {
      setUploading(false);
    }
  }

  async function deletePhoto(id) {
    if (!window.confirm('Delete this photo?')) return;
    await supabase.from('progress_photos').delete().eq('id', id);
    setPhotos(photos.filter(p => p.id !== id));
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--color-bg-main)' }}>
      <Loader2 className="animate-spin" color="var(--color-primary)" size={40} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-main)', padding: '20px 20px 80px' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#fff' }}>
            <ArrowLeft size={24} />
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Progress Photos</h1>
        </div>
        <label className="primary-button" style={{ padding: '8px 12px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
          <span style={{ fontSize: 13, fontWeight: 600 }}>Sync</span>
          <input type="file" accept="image/*" onChange={handleUpload} hidden disabled={uploading} />
        </label>
      </header>

      {photos.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <ImageIcon size={48} style={{ color: 'var(--color-text-dim)', opacity: 0.2, marginBottom: 16 }} />
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Body Transformation</h2>
          <p style={{ color: 'var(--color-text-dim)', fontSize: 13 }}>Upload your first photo to start your journey tracking.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {photos.map((p) => (
            <div key={p.id} className="glass-panel slide-up" style={{ padding: 8 }}>
              <img src={p.photo_url} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: 'var(--color-text-dim)' }}>{new Date(p.taken_at).toLocaleDateString()}</span>
                <button onClick={() => deletePhoto(p.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)' }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {photos.length >= 2 && (
        <div className="glass-panel" style={{ marginTop: 24, padding: '1.25rem', borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <History size={16} color="var(--color-primary)" />
            <h3 style={{ fontSize: 14, margin: 0 }}>Side-by-Side Comparison</h3>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: 'var(--color-text-dim)', marginBottom: 4 }}>Before</div>
              <img src={photos[photos.length - 1].photo_url} style={{ width: '100%', borderRadius: 6, aspectRatio: '1/1', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: 'var(--color-text-dim)', marginBottom: 4 }}>Latest</div>
              <img src={photos[0].photo_url} style={{ width: '100%', borderRadius: 6, aspectRatio: '1/1', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
