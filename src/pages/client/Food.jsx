import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Camera, Trash2, Mic, Loader2, Save, Search, ChevronDown, ChevronLeft, ChevronRight, X, Utensils } from 'lucide-react';
import { supabase, TABLES } from '../../services/supabaseClient';
import { analyzeFoodText } from '../../services/aiService';

export default function Food() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [diaryDate, setDiaryDate] = useState(new Date());
  const dateScrollRef = React.useRef(null);
  const [mealType, setMealType] = useState('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'strip'
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [quickQty, setQuickQty] = useState(1);

  const commonFoods = [
    { name: 'Idli (2 nos)', calories: 130, protein: 4, carbs: 28, fats: 1 },
    { name: 'Masala Dosa (1 no)', calories: 350, protein: 6, carbs: 45, fats: 15 },
    { name: 'Plain Dosa (1 no)', calories: 120, protein: 3, carbs: 24, fats: 2 },
    { name: 'Medu Vada (1 no)', calories: 110, protein: 3, carbs: 12, fats: 6 },
    { name: 'Pongal (1 bowl)', calories: 280, protein: 7, carbs: 40, fats: 12 },
    { name: 'Upma (1 bowl)', calories: 220, protein: 5, carbs: 35, fats: 6 },
    { name: 'Chicken Biryani (South)', calories: 550, protein: 25, carbs: 65, fats: 20 },
    { name: 'Curd Rice (1 bowl)', calories: 210, protein: 6, carbs: 35, fats: 5 },
    { name: 'Appam (1 no)', calories: 120, protein: 2, carbs: 25, fats: 1 },
    { name: 'Sambar (1 bowl)', calories: 90, protein: 4, carbs: 12, fats: 3 }
  ];

  const filteredFoods = searchQuery 
    ? commonFoods.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  const [manualFoodName, setManualFoodName] = useState('');
  const [manualCals, setManualCals] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFats, setManualFats] = useState('');

  useEffect(() => { load(); }, []);

  const toLocalDateStr = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  useEffect(() => {
    if (dateScrollRef.current) {
        dateScrollRef.current.scrollLeft = dateScrollRef.current.scrollWidth;
    }
  }, []);

  async function load() {
    const { data } = await supabase
      .from(TABLES.FOOD_LOGS)
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
    setLogs(data || []);
    setLoading(false);
  }

  async function deleteLog(id) {
    if (!window.confirm('Remove this entry?')) return;
    const { error } = await supabase.from(TABLES.FOOD_LOGS).delete().eq('id', id);
    if (!error) setLogs(logs.filter(l => l.id !== id));
  }

  async function logManualEntry() {
    if (!manualFoodName || !manualCals) return;
    const entry = {
      user_id: userId,
      name: manualFoodName,
      calories: Math.round(parseFloat(manualCals) || 0),
      protein: Math.round(parseFloat(manualProtein) || 0),
      carbs: Math.round(parseFloat(manualCarbs) || 0),
      fat: Math.round(parseFloat(manualFats) || 0),
      meal_type: mealType,
      timestamp: new Date(diaryDate).toISOString()
    };
    const { data, error } = await supabase.from(TABLES.FOOD_LOGS).insert(entry).select().single();
    if (!error && data) {
      setLogs([data, ...logs]);
      setManualFoodName('');
      setManualCals('');
      setManualProtein('');
      setManualCarbs('');
      setManualFats('');
    }
  }

  const selectedDateStr = toLocalDateStr(diaryDate);
  const dayLogs = logs.filter(l => l.timestamp && toLocalDateStr(new Date(l.timestamp)) === selectedDateStr);
  const totals = dayLogs.reduce((acc, l) => ({
    cal: Math.round(acc.cal + (l.calories || 0)),
    p: Math.round(acc.p + (l.protein || 0)),
    c: Math.round(acc.c + (l.carbs || 0)),
    f: Math.round(acc.f + (l.fat || 0)),
  }), { cal: 0, p: 0, c: 0, f: 0 });
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-main)', padding: '20px 20px 40px' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#fff' }}>
            <ArrowLeft size={24} />
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Daily Nutrition</h1>
        </div>
      </header>

      {/* Month Navigator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
              {diaryDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
          </h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button 
                onClick={() => setViewMode(viewMode === 'grid' ? 'strip' : 'grid')}
                className="secondary-button"
                style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, color: 'var(--color-primary)' }}
              >
                  {viewMode === 'grid' ? 'STRIP VIEW' : 'GRID VIEW'}
              </button>
              <button 
                onClick={() => {
                    const d = new Date(diaryDate);
                    d.setMonth(d.getMonth() - 1);
                    setDiaryDate(d);
                }}
                className="secondary-button" 
                style={{ padding: '6px 10px', borderRadius: 8 }}
              >
                  <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => {
                    const d = new Date(diaryDate);
                    d.setMonth(d.getMonth() + 1);
                    setDiaryDate(d);
                }}
                className="secondary-button" 
                style={{ padding: '6px 10px', borderRadius: 8 }}
              >
                  <ChevronRight size={20} />
              </button>
          </div>
      </div>

      {/* Conditional Calendar View */}
      {viewMode === 'strip' ? (
          <div className="calendar-strip" ref={dateScrollRef}>
              {(() => {
                  const daysInMonth = new Date(diaryDate.getFullYear(), diaryDate.getMonth() + 1, 0).getDate();
                  return [...Array(daysInMonth)].map((_, i) => {
                      const d = new Date(diaryDate.getFullYear(), diaryDate.getMonth(), i + 1);
                      const isSelected = d.toLocaleDateString() === diaryDate.toLocaleDateString();
                      const isToday = d.toLocaleDateString() === new Date().toLocaleDateString();
                      return (
                          <button
                              key={i}
                              onClick={() => setDiaryDate(d)}
                              className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                          >
                              <span className="weekday">
                                  {d.toLocaleDateString([], { weekday: 'short' })}
                              </span>
                              <span className="date">
                                  {d.getDate()}
                              </span>
                          </button>
                      );
                  });
              })()}
          </div>
      ) : (
          <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              gap: 4, 
              background: 'rgba(255,255,255,0.03)', 
              padding: 8, 
              borderRadius: 16, 
              border: '1px solid rgba(255,255,255,0.05)',
              marginBottom: 20
          }}>
              {['S','M','T','W','T','F','S'].map(day => (
                  <div key={day} style={{ textAlign: 'center', fontSize: 9, fontWeight: 800, color: 'var(--color-text-dim)', padding: '2px 0' }}>{day}</div>
              ))}
              {(() => {
                  const firstDay = new Date(diaryDate.getFullYear(), diaryDate.getMonth(), 1).getDay();
                  const daysInMonth = new Date(diaryDate.getFullYear(), diaryDate.getMonth() + 1, 0).getDate();
                  const cells = [];
                  
                  // Empty cells for first week
                  for(let i=0; i<firstDay; i++) cells.push(<div key={`empty-${i}`} />);
                  
                  // Day cells
                  for(let i=1; i<=daysInMonth; i++) {
                      const d = new Date(diaryDate.getFullYear(), diaryDate.getMonth(), i);
                      const dStr = toLocalDateStr(d);
                      const dayTotal = logs
                        .filter(l => l.created_at && toLocalDateStr(new Date(l.created_at)) === dStr)
                        .reduce((sum, l) => sum + (l.calories || 0), 0);
                      
                      const isSelected = d.toLocaleDateString() === diaryDate.toLocaleDateString();
                      const isToday = d.toLocaleDateString() === new Date().toLocaleDateString();
                      
                      cells.push(
                          <div 
                              key={i}
                              onClick={() => setDiaryDate(d)}
                              style={{ 
                                  aspectRatio: '1/1',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: 8,
                                  cursor: 'pointer',
                                  background: isSelected ? 'var(--color-primary)' : isToday ? 'rgba(205, 255, 0, 0.1)' : 'rgba(255,255,255,0.02)',
                                  color: isSelected ? '#000' : '#fff',
                                  border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.03)',
                                  transition: 'all 0.2s',
                                  position: 'relative',
                                  padding: 2
                              }}
                          >
                              <span style={{ fontSize: 10, fontWeight: 800, lineHeight: 1 }}>{i}</span>
                              {dayTotal > 0 && (
                                  <span style={{ 
                                      fontSize: 7, 
                                      fontWeight: 700, 
                                      marginTop: 1,
                                      color: isSelected ? '#000' : 'var(--color-primary)',
                                      opacity: isSelected ? 0.8 : 1
                                  }}>
                                      {Math.round(dayTotal)}
                                  </span>
                              )}
                          </div>
                      );
                  }
                  return cells;
              })()}
          </div>
      )}

      {/* AI SCAN & QUICK LOG - Middle Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
        <Link 
            to={`/scan?date=${diaryDate.toISOString()}`} 
            className="primary-button" 
            style={{ 
                flex: 1,
                padding: '12px 16px', 
                borderRadius: 20, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 8, 
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(205, 255, 0, 0.2)',
                maxWidth: '160px'
            }}
        >
          <Camera size={20} color="#000" />
          <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase' }}>Scan</span>
        </Link>
        <button 
            onClick={() => setShowQuickMenu(true)}
            className="secondary-button" 
            style={{ 
                flex: 1,
                padding: '12px 16px', 
                borderRadius: 20, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 8, 
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-primary)',
                color: 'var(--color-primary)',
                maxWidth: '160px'
            }}
        >
          <Utensils size={20} />
          <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase' }}>Quick Add</span>
        </button>
      </div>

      {/* QUICK MENU OVERLAY */}
      {showQuickMenu && (
        <div style={{ 
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', 
            backdropFilter: 'blur(10px)', zIndex: 1000, 
            display: 'flex', alignItems: 'flex-end' 
        }}>
            <div style={{ 
                width: '100%', background: 'var(--color-bg-secondary)', 
                borderTopLeftRadius: 30, borderTopRightRadius: 30,
                padding: '2rem 1.5rem 3rem', maxHeight: '70vh', overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>South Indian Menu</h3>
                    <button onClick={() => setShowQuickMenu(false)} style={{ background: 'none', border: 'none', color: '#fff' }}><X size={24} /></button>
                </div>

                {/* Quick Menu Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', marginBottom: 4, display: 'block' }}>Meal Type</label>
                            <select 
                                className="glass-input" 
                                value={mealType}
                                onChange={(e) => setMealType(e.target.value)}
                                style={{ width: '100%', fontSize: 13, background: 'rgba(0,0,0,0.2)', color: '#fff' }}
                            >
                                <option value="breakfast">Breakfast</option>
                                <option value="lunch">Lunch</option>
                                <option value="dinner">Dinner</option>
                                <option value="snack">Snack</option>
                            </select>
                        </div>
                        <div style={{ width: 100 }}>
                            <label style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', marginBottom: 4, display: 'block' }}>Qty</label>
                            <input 
                                type="number"
                                className="glass-input"
                                value={quickQty}
                                onChange={(e) => setQuickQty(Math.max(1, parseInt(e.target.value) || 1))}
                                style={{ width: '100%', fontSize: 13, textAlign: 'center' }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                    {commonFoods
                      .filter(f => f.name.toLowerCase().includes(quickSearch.toLowerCase()))
                      .map(food => (
                        <button 
                            key={food.name}
                            onClick={async () => {
                                const entry = {
                                    user_id: userId,
                                    name: `${food.name} (x${quickQty})`,
                                    calories: Math.round(food.calories * quickQty),
                                    protein: Math.round(food.protein * quickQty),
                                    carbs: Math.round(food.carbs * quickQty),
                                    fat: Math.round(food.fats * quickQty),
                                    meal_type: mealType,
                                    timestamp: new Date(diaryDate).toISOString()
                                };
                                const { data, error } = await supabase.from(TABLES.FOOD_LOGS).insert(entry).select().single();
                                if (!error && data) {
                                  setLogs([data, ...logs]);
                                  setShowQuickMenu(false);
                                  setQuickQty(1); // Reset qty
                                  setQuickSearch('');
                                }
                            }}
                            style={{ 
                                background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)',
                                borderRadius: 16, padding: '16px 12px', textAlign: 'left', cursor: 'pointer'
                            }}
                        >
                            <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--color-primary)', marginBottom: 4 }}>{food.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>{food.calories} kcal</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Summary Chips (Healthify Mode) */}
      <div className="summary-chips">
        {[
          { label: 'Kcal', val: totals.cal, color: 'var(--color-primary)' },
          { label: 'Protein', val: totals.p + 'g', color: '#bef264' },
          { label: 'Carbs',  val: totals.c + 'g', color: '#64d2ff' },
          { label: 'Fats',   val: totals.f + 'g', color: '#ffb944' },
        ].map(s => (
          <div key={s.label} className="summary-chip">
            <div className="label">{s.label}</div>
            <div className="value" style={{ color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}><div className="loader" style={{ margin: '0 auto' }} /></div>
        ) : (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem', position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginBottom: 6, display: 'block' }}>Select Food</label>
                    <select 
                        className="glass-input" 
                        style={{ width: '100%', fontSize: 13, padding: '12px', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
                        onChange={(e) => {
                            const food = commonFoods.find(f => f.name === e.target.value);
                            if (food) {
                                setManualFoodName(food.name);
                                setManualCals(food.calories);
                                setManualProtein(food.protein);
                                setManualCarbs(food.carbs);
                                setManualFats(food.fats);
                            } else {
                                setManualFoodName('');
                                setManualCals('');
                            }
                        }}
                    >
                        <option value="">Choose a common food...</option>
                        {commonFoods.map(f => (
                            <option key={f.name} value={f.name}>{f.name}</option>
                        ))}
                    </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <input 
                        type="number" 
                        className="glass-input" 
                        placeholder="Calories"
                        value={manualCals}
                        onChange={(e) => setManualCals(e.target.value)}
                        style={{ fontSize: 13, padding: '12px' }}
                    />
                    <select 
                        className="glass-input" 
                        value={mealType}
                        onChange={(e) => setMealType(e.target.value)}
                        style={{ fontSize: 13, padding: '12px', background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snack">Snack</option>
                    </select>
                </div>
                <button 
                    onClick={logManualEntry}
                    disabled={!manualFoodName || !manualCals}
                    className="primary-button" 
                    style={{ padding: '12px', fontSize: 13, borderRadius: '12px', fontWeight: 800 }}
                >
                    Log Item
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', paddingLeft: '0.5rem', borderBottom: '1px solid var(--color-primary)', paddingBottom: '0.5rem', marginTop: '1.5rem' }}>
                 <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-primary)' }}>Daily Summary</h3>
                 <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{Math.round(dayLogs.reduce((acc, curr) => acc + curr.calories, 0))} kcal</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                 {['breakfast', 'lunch', 'dinner', 'snack'].map(category => {
                    const categoryLogs = dayLogs.filter(item => item.meal_type === category);
                    return (
                        <div key={category} className="glass-panel" style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <h4 style={{ textTransform: 'capitalize', margin: 0, color: 'var(--color-text-dim)' }}>{category}</h4>
                                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{Math.round(categoryLogs.reduce((acc, curr) => acc + curr.calories, 0))} kcal</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {categoryLogs.map(log => (
                                    <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0' }}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{log.name}</div>
                                            <div style={{ fontSize: 12, color: 'var(--color-text-dim)', marginTop: 2 }}>
                                                {Math.round(log.protein)}g P · {Math.round(log.carbs)}g C · {Math.round(log.fat)}g F
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{Math.round(log.calories)}</div>
                                            <button onClick={() => deleteLog(log.id)} style={{ background: 'none', border: 'none', color: '#ff4444', padding: 4 }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {categoryLogs.length === 0 && (
                                    <Link 
                                        to={`/scan?date=${diaryDate.toISOString()}&type=${category}`} 
                                        style={{ display: 'block', color: 'var(--color-text-dim)', textDecoration: 'none', fontSize: '0.85rem', padding: '0.5rem 0', fontWeight: 600 }}
                                    >
                                        + ADD {category.toUpperCase()}
                                    </Link>
                                )}
                            </div>
                        </div>
                    );
                 })}
              </div>
            </div>
        )}
      </div>
    </div>
  );
}
