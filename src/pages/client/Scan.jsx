import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, CheckCircle2 } from 'lucide-react';
import VisionScanner from '../../components/VisionScanner';
import { supabase, TABLES } from '../../services/supabaseClient';

export default function Scan() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const dateParam = params.get('date');
  const typeParam = params.get('type');
  
  const clientId = localStorage.getItem('userId');
  const [suggestions, setSuggestions] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [mealType, setMealType] = useState(typeParam || 'breakfast');

  async function saveToLog(result) {
    if (!clientId) return;
    setSaving(true);
    try {
      const created_at = dateParam ? new Date(dateParam).toISOString() : new Date().toISOString();
      const { error } = await supabase.from(TABLES.FOOD_LOGS).insert([{
        client_id: clientId,
        name: result.name,
        calories: Math.round(result.calories),
        protein: Math.round(result.protein),
        carbs: Math.round(result.carbs),
        fats: Math.round(result.fats),
        meal_type: mealType,
        created_at
      }]);

      if (error) throw error;
      navigate('/food');
    } catch (err) {
      console.error('Error saving scan:', err);
      alert('Failed to save log. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-main)', padding: '20px 20px 80px' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#fff', padding: 4 }}>
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>AI Food Scanner</h1>
      </header>

      {!suggestions ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <VisionScanner onResult={(results) => {
            setSuggestions(results);
            if (results && results.length > 0) {
              setSelectedResult(results[0]);
            }
          }} />
          
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text-dim)', fontSize: 14 }}>
              Snap a photo of your meal. FitCoach AI will identify the food and calculate nutrition.
            </p>
          </div>
        </div>
      ) : (
        <div className="animate-slide-up">
          <h2 style={{ fontSize: 22, marginBottom: '1.5rem', fontWeight: 700 }}>AI Suggestions</h2>
          <p style={{ color: 'var(--color-text-dim)', marginBottom: 20 }}>Select the item that best matches your meal:</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 30 }}>
            {suggestions.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedResult(item)}
                className={`glass-panel suggestion-card ${selectedResult === item ? 'selected-item' : ''}`}
                style={{ 
                  padding: '1rem', 
                  cursor: 'pointer', 
                  border: selectedResult === item ? '2px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{item.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-dim)', marginTop: 4 }}>
                      {item.calories} kcal · {item.protein}g P · {item.carbs}g C · {item.fats}g F
                    </div>
                  </div>
                  {selectedResult === item && <CheckCircle2 size={24} color="var(--color-primary)" />}
                </div>
                <div style={{ marginTop: 8, fontSize: 11, display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: item.confidence === 'high' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(251, 191, 36, 0.2)', color: item.confidence === 'high' ? '#4ade80' : '#fbbf24' }}>
                  {item.confidence.toUpperCase()} CONFIDENCE
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => { setSuggestions(null); setSelectedResult(null); }}
              className="secondary-button"
              style={{ flex: 1, padding: '16px' }}
            >
              Retake
            </button>
            <button
              onClick={() => saveToLog(selectedResult)}
              disabled={saving || !selectedResult}
              className="primary-button"
              style={{ flex: 2, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {saving ? 'Saving...' : 'Confirm & Log'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .selected-item {
          background: rgba(var(--color-primary-rgb), 0.1) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
