import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    TrendingUp,
    Camera,
    Utensils,
    Settings,
    LogOut,
    Flame,
    Droplets,
    Activity,
    CheckCircle2,
    Trash2,
    Ruler,
    Coffee,
    Sun,
    Moon,
    Apple,
    GlassWater,
    Home,
    ClipboardList,
    Dumbbell,
    BarChart2,
    User,
    Plus,
    ChevronDown
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import './Dashboard.css';
import VisionScanner from '../components/VisionScanner';
import Avatar from '../components/Avatar';
import MediaLightbox from '../components/MediaLightbox';
import { workoutVideos } from '../data/gymData';
import { initGoogleFit, connectGoogleFit, fetchDailySteps } from '../lib/googleFit';
import { Footprints } from 'lucide-react';
import ChallengeSummaryCard from '../components/ChallengeSummaryCard';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState(() => {
        const isDemo = localStorage.getItem('isDemoMode') === 'true';
        // Only default to vision if no demo scan exists yet
        return isDemo ? 'vision' : 'overview';
    });
    const [clientName, setClientName] = useState(localStorage.getItem('clientName') || 'Athlete');
    const [clientId, setClientId] = useState(localStorage.getItem('clientId'));
    const [isDemo, setIsDemo] = useState(localStorage.getItem('isDemoMode') === 'true');
    const [scanResult, setScanResult] = useState(null);
    const [foodLog, setFoodLog] = useState([]);
    const [weightLog, setWeightLog] = useState([]);
    const [newWeight, setNewWeight] = useState('');
    const [dailyGoal, setDailyGoal] = useState(2200);
    const [height, setHeight] = useState(175);
    const [heightUnit, setHeightUnit] = useState('cm');
    const [heightFt, setHeightFt] = useState(5);
    const [heightIn, setHeightIn] = useState(9);
    const [newPassword, setNewPassword] = useState('');
    const [workoutLog, setWorkoutLog] = useState([]);
    const [exerciseName, setExerciseName] = useState('');
    const [exerciseValue, setExerciseValue] = useState('');
    const [exerciseCategory, setExerciseCategory] = useState('Weight Training');
    const [trainerNote, setTrainerNote] = useState('');
    const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [editingWeightId, setEditingWeightId] = useState(null);
    const [editWeightValue, setEditWeightValue] = useState('');
    const [dailySteps, setDailySteps] = useState(0);
    const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [motivationQuote, setMotivationQuote] = useState(localStorage.getItem('motivationQuote') || 'Think elite. Train elite.');
    const [motivationPhoto, setMotivationPhoto] = useState(localStorage.getItem('motivationPhoto') || null);
    const [isEditingQuote, setIsEditingQuote] = useState(false);
    const [isUploadingMotivationPhoto, setIsUploadingMotivationPhoto] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(clientName);
    
    // Wellness State
    const [waterIntake, setWaterIntake] = useState(0);
    const [sleepHours, setSleepHours] = useState(0);
    const [sleepQuality, setSleepQuality] = useState(3);
    const [mealType, setMealType] = useState('breakfast');
    const [diaryDate, setDiaryDate] = useState(new Date());
    const [manualFoodName, setManualFoodName] = useState('');
    const [manualCals, setManualCals] = useState('');
    const [manualProtein, setManualProtein] = useState('');
    const [manualCarbs, setManualCarbs] = useState('');
    const [manualFats, setManualFats] = useState('');

    const navigate = useNavigate();

    const handleScanResult = (data) => {
        if (isDemo && (scanResult || localStorage.getItem('demo_used_v1'))) {
            alert('This is a one-time free demo scan. Join ELITE CROSS Fit Studio for unlimited AI scans!');
            return;
        }
        setScanResult(data);
    };

    useEffect(() => {
        if (!clientId && !isDemo) {
            navigate('/login');
            return;
        }
        if (isDemo) {
            // Mock data for demo
            setClientName(localStorage.getItem('clientName') || 'Guest');
            setDailyGoal(2200);
            setFoodLog([]);
        } else {
            fetchClientData();
        }
    }, [clientId, isDemo, navigate]);

    const fetchClientData = async () => {
        try {
            // Fetch profile
            const { data: profile } = await supabase
                .from('client_profiles')
                .select('*')
                .eq('id', clientId)
                .single();

            if (profile) {
                setDailyGoal(profile.daily_goal || 2200);
                const h = profile.height || 175;
                setHeight(h);
                setHeightFt(Math.floor(h / 30.48));
                setHeightIn(Math.round((h / 2.54) % 12));
                setClientName(profile.name);
                setTrainerNote(profile.trainer_note || 'No instructions set by trainer yet.');
                setProfilePhotoUrl(profile.profile_photo_url);
            }

            // Fetch Food Logs
            const { data: foods } = await supabase
                .from('food_logs')
                .select('*')
                .eq('client_id', clientId)
                .order('created_at', { ascending: false });
            setFoodLog(foods || []);

            // Fetch Workouts
            const { data: workouts } = await supabase
                .from('workout_logs')
                .select('*')
                .eq('client_id', clientId)
                .order('created_at', { ascending: false });
            setWorkoutLog(workouts || []);

            // Fetch Weight Logs
            const { data: weights } = await supabase
                .from('weight_logs')
                .select('*')
                .eq('client_id', clientId)
                .order('created_at', { ascending: true });

            if (weights && weights.length > 0) {
                setWeightLog(weights.map(w => ({
                    id: w.id,
                    date: new Date(w.created_at).toLocaleDateString([], { weekday: 'short' }),
                    fullDate: new Date(w.created_at).toLocaleDateString() + ' ' + new Date(w.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    weight: parseFloat(w.weight)
                })));
            } else {
                setWeightLog([
                    { id: '1', date: 'Mon', fullDate: 'Last Mon', weight: 80 },
                    { id: '2', date: 'Tue', fullDate: 'Last Tue', weight: 79.5 },
                    { id: '3', date: 'Wed', fullDate: 'Last Wed', weight: 79 },
                    { id: '4', date: 'Thu', fullDate: 'Last Thu', weight: 79.2 },
                    { id: '5', date: 'Fri', fullDate: 'Last Fri', weight: 78.8 },
                    { id: '6', date: 'Sat', fullDate: 'Last Sat', weight: 78.5 },
                    { id: '7', date: 'Sun', fullDate: 'Last Sun', weight: 78.2 }
                ]);
            }

            // Fetch Today's Steps
            const today = new Date().toISOString().split('T')[0];
            const { data: stepsData } = await supabase
                .from('step_logs')
                .select('steps')
                .eq('client_id', clientId)
                .eq('date', today)
                .single();
            
            if (stepsData) {
                setDailySteps(stepsData.steps);
            }

            // Fetch Water Intake
            const { data: waterData } = await supabase
                .from('water_logs')
                .select('amount_ml')
                .eq('client_id', clientId)
                .eq('date', today);
            
            if (waterData) {
                const total = waterData.reduce((acc, curr) => acc + curr.amount_ml, 0);
                setWaterIntake(total);
            }

            // Fetch Sleep
            const { data: sleepData } = await supabase
                .from('sleep_logs')
                .select('*')
                .eq('client_id', clientId)
                .eq('date', today)
                .single();
            
            if (sleepData) {
                setSleepHours(sleepData.hours);
                setSleepQuality(sleepData.quality);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (clientId && clientId !== 'your_google_client_id_here') {
            initGoogleFit(clientId);
        }
    }, []);

    const handleSyncSteps = async () => {
        try {
            setIsConnectingGoogle(true);
            const token = sessionStorage.getItem('google_fit_token');
            if (!token) {
                await connectGoogleFit();
            }
            
            const steps = await fetchDailySteps();
            setDailySteps(steps);

            // Save to Database
            const today = new Date().toISOString().split('T')[0];
            const { error } = await supabase
                .from('step_logs')
                .upsert({
                    client_id: clientId,
                    date: today,
                    steps: steps
                }, { onConflict: 'client_id,date' });

            if (error) console.error('Error saving steps:', error);
            else alert(`Successfully synced ${steps} steps!`);

        } catch (err) {
            console.error('Google Fit Sync Error:', err);
            if (err === 'popup_closed_by_user') {
                alert('Connection cancelled.');
            } else {
                alert('Failed to sync steps. Please check your connection.');
            }
        } finally {
            setIsConnectingGoogle(false);
        }
    };

    const handleManualEntry = async () => {
        if (!manualFoodName || !manualCals) return;
        
        const entry = {
            client_id: clientId,
            name: manualFoodName,
            calories: Math.round(parseFloat(manualCals) || 0),
            protein: Math.round(parseFloat(manualProtein) || 0),
            carbs: Math.round(parseFloat(manualCarbs) || 0),
            fats: Math.round(parseFloat(manualFats) || 0),
            meal_type: mealType,
            created_at: new Date(diaryDate).toISOString()
        };

        if (isDemo) {
            setFoodLog([{ ...entry, id: Date.now().toString() }, ...foodLog]);
            setManualFoodName('');
            setManualCals('');
            setManualProtein('');
            setManualCarbs('');
            setManualFats('');
            setActiveTab('foodlog');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('food_logs')
                .insert([entry])
                .select()
                .single();

            if (!error && data) {
                setFoodLog([data, ...foodLog]);
                setManualFoodName('');
                setManualCals('');
                setManualProtein('');
                setManualCarbs('');
                setManualFats('');
                setActiveTab('foodlog');
            }
        } catch (err) {
            console.error('Error saving manual entry:', err);
        }
    };

    const addToLog = async () => {
        if (!scanResult) return;

        if (isDemo) {
            const mockData = {
                id: Date.now().toString(),
                created_at: new Date(diaryDate).toISOString(),
                name: scanResult.itemName,
                calories: Math.round(scanResult.calories),
                protein: Math.round(scanResult.protein),
                carbs: Math.round(scanResult.carbs),
                fats: Math.round(scanResult.fats),
                meal_type: mealType
            };
            setFoodLog([mockData, ...foodLog]);
            setScanResult(null);
            setActiveTab('foodlog');
            localStorage.setItem('demo_used_v1', 'true');
            alert("Food logged locally! Since this is a demo, you've used your one free scan. Sign up for full access!");
            return;
        }

        if (!clientId) return;

        try {
            const { data, error } = await supabase
                .from('food_logs')
                .insert([{
                    client_id: clientId,
                    name: scanResult.itemName,
                    calories: Math.round(scanResult.calories),
                    protein: Math.round(scanResult.protein),
                    carbs: Math.round(scanResult.carbs),
                    fats: Math.round(scanResult.fats),
                    meal_type: mealType,
                    created_at: new Date(diaryDate).toISOString()
                }])
                .select()
                .single();

            if (!error && data) {
                setFoodLog([data, ...foodLog]);
                setScanResult(null);
                setActiveTab('foodlog');
                setMealType('breakfast'); // Reset
            }
        } catch (err) {
            console.error('Error saving food log:', err);
        }
    };

    const addWeightEntry = async () => {
        if (!newWeight) return;

        if (isDemo) {
            const newEntry = {
                id: Date.now().toString(),
                date: new Date().toLocaleDateString([], { weekday: 'short' }),
                fullDate: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                weight: parseFloat(newWeight)
            };
            setWeightLog([...weightLog.filter(log => log.id !== undefined && log.id !== null), newEntry]);
            setNewWeight('');
            alert("Weight updated locally for this demo session!");
            return;
        }

        if (!clientId) return;

        try {
            const { data, error } = await supabase
                .from('weight_logs')
                .insert([{
                    client_id: clientId,
                    weight: parseFloat(newWeight)
                }])
                .select()
                .single();

            if (!error && data) {
                const newEntry = {
                    id: data.id,
                    date: new Date(data.created_at).toLocaleDateString([], { weekday: 'short' }),
                    fullDate: new Date(data.created_at).toLocaleDateString() + ' ' + new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    weight: parseFloat(data.weight)
                };
                setWeightLog([...weightLog.filter(log => log.id !== undefined && log.id !== null), newEntry]);
                setNewWeight('');
                alert("Weight updated in your profile!");
            }
        } catch (err) {
            console.error('Error saving weight:', err);
        }
    };

    const updateWeightEntry = async (id) => {
        if (!editWeightValue || !clientId) return;
        try {
            const { error } = await supabase
                .from('weight_logs')
                .update({ weight: parseFloat(editWeightValue) })
                .eq('id', id);

            if (!error) {
                setWeightLog(weightLog.map(log =>
                    log.id === id ? { ...log, weight: parseFloat(editWeightValue) } : log
                ));
                setEditingWeightId(null);
                setEditWeightValue('');
            }
        } catch (err) {
            console.error('Error updating weight:', err);
        }
    };

    const deleteWeightEntry = async (id) => {
        if (!window.confirm("Are you sure you want to delete this weight entry?")) return;
        try {
            const { error } = await supabase
                .from('weight_logs')
                .delete()
                .eq('id', id);

            if (!error) {
                setWeightLog(weightLog.filter(log => log.id !== id));
            }
        } catch (err) {
            console.error('Error deleting weight:', err);
        }
    };

    const addWorkoutEntry = async () => {
        if (!exerciseName || !exerciseValue) return;
        if (!isDemo && !clientId) return;

        // Automatic Calorie Estimation Logic
        const exerciseData = {
            'pushups': { rate: 0.5 },
            'squats': { rate: 0.4 },
            'plank': { rate: 5 },
            'jumping jacks': { rate: 0.2 },
            'burpees': { rate: 1.5 },
            'running': { rate: 12 },
            'cycling': { rate: 8 },
            'deadlift': { rate: 0.8 },
            'dumbbell': { rate: 0.5 },
            'bench press': { rate: 0.6 },
            'shoulder press': { rate: 0.5 },
            'bicep curls': { rate: 0.3 },
            'leg press': { rate: 0.6 },
            'yoga': { rate: 3 },
            'stretching': { rate: 2 },
            'pilates': { rate: 4 }
        };

        const searchName = exerciseName.toLowerCase();
        let estimatedCals = 0;
        const amount = parseFloat(exerciseValue.match(/\d+(\.\d+)?/)?.[0] || 0);

        Object.entries(exerciseData).forEach(([key, data]) => {
            if (searchName.includes(key)) {
                estimatedCals = Math.round(data.rate * amount);
            }
        });

        if (estimatedCals === 0 && amount > 0) estimatedCals = Math.round(amount * 0.3);

        if (isDemo) {
            const mockWorkout = {
                id: Date.now().toString(),
                created_at: new Date().toISOString(),
                exercise: exerciseName,
                category: exerciseCategory,
                value: exerciseValue,
                calories_burnt: estimatedCals
            };
            setWorkoutLog([mockWorkout, ...workoutLog]);
            setExerciseName('');
            setExerciseValue('');
            alert("Workout logged locally for this demo session!");
            return;
        }

        if (!clientId) return;

        try {
            const { data, error } = await supabase
                .from('workout_logs')
                .insert([{
                    client_id: clientId,
                    exercise: exerciseName,
                    category: exerciseCategory,
                    value: exerciseValue,
                    calories_burnt: estimatedCals
                }])
                .select()
                .single();

            if (!error && data) {
                setWorkoutLog([data, ...workoutLog]);
                setExerciseName('');
                setExerciseValue('');
            }
        } catch (err) {
            console.error('Error saving workout:', err);
        }
    };

    const addWater = async (amount) => {
        if (isDemo) {
            setWaterIntake(waterIntake + amount);
            alert("Water intake updated locally!");
            return;
        }
        try {
            const today = new Date().toISOString().split('T')[0];
            const { error } = await supabase
                .from('water_logs')
                .insert([{
                    client_id: clientId,
                    amount_ml: amount,
                    date: today
                }]);

            if (!error) {
                setWaterIntake(waterIntake + amount);
            }
        } catch (err) {
            console.error('Error logging water:', err);
        }
    };

    const updateSleep = async (hours, quality) => {
        if (isDemo) {
            setSleepHours(hours);
            setSleepQuality(quality);
            alert("Sleep data updated locally!");
            return;
        }
        try {
            const today = new Date().toISOString().split('T')[0];
            const { error } = await supabase
                .from('sleep_logs')
                .upsert({
                    client_id: clientId,
                    date: today,
                    hours: parseFloat(hours),
                    quality: parseInt(quality)
                }, { onConflict: 'client_id,date' });

            if (!error) {
                setSleepHours(hours);
                setSleepQuality(quality);
            }
        } catch (err) {
            console.error('Error saving sleep:', err);
        }
    };

    const deleteWorkoutEntry = async (id) => {
        try {
            const { error } = await supabase
                .from('workout_logs')
                .delete()
                .eq('id', id);

            if (!error) {
                setWorkoutLog(workoutLog.filter(log => log.id !== id));
            }
        } catch (err) {
            console.error('Error deleting workout:', err);
        }
    };

    const deleteFoodEntry = async (id) => {
        try {
            const { error } = await supabase
                .from('food_logs')
                .delete()
                .eq('id', id);

            if (!error) {
                setFoodLog(foodLog.filter(item => item.id !== id));
            }
        } catch (err) {
            console.error('Error deleting food:', err);
        }
    };

    const calculateBMI = () => {
        const currentWeight = weightLog[weightLog.length - 1]?.weight;
        if (!currentWeight || !height) return { bmi: 0, category: 'N/A' };

        const heightInMeters = height / 100;
        const bmi = (currentWeight / (heightInMeters * heightInMeters)).toFixed(1);

        let category = 'Normal';
        if (bmi < 18.5) category = 'Underweight';
        else if (bmi >= 25 && bmi < 30) category = 'Overweight';
        else if (bmi >= 30) category = 'Obese';

        return { bmi, category };
    };

    const { bmi, category: bmiCategory } = calculateBMI();

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isClientLoggedIn');
        const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
        if (!isLoggedIn && !isDemoMode) {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const updateProfile = async () => {
        if (isDemo) {
            alert("Profile updated locally for this demo session!");
            return;
        }
        if (!clientId) return;
        try {
            const updateData = {
                name: clientName,
                daily_goal: dailyGoal,
                height: height
            };

            if (newPassword) {
                updateData.password = newPassword;
            }

            const { error } = await supabase
                .from('client_profiles')
                .update(updateData)
                .eq('id', clientId);

            if (!error) {
                alert("Profile updated successfully!");
                setNewPassword('');
            }
        } catch (err) {
            console.error('Error updating profile:', err);
        }
    };

    const handlePhotoUpload = async (event) => {
        try {
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${clientId}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            setIsUploadingImage(true);

            // Upload the file to standard storage
            const { error: uploadError } = await supabase.storage
                .from('profile-photos')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL
            const { data: publicUrlData } = supabase.storage
                .from('profile-photos')
                .getPublicUrl(filePath);

            const publicUrl = publicUrlData.publicUrl;

            // Update user profile
            const { error: updateError } = await supabase
                .from('client_profiles')
                .update({ profile_photo_url: publicUrl })
                .eq('id', clientId);

            if (updateError) {
                throw updateError;
            }

            setProfilePhotoUrl(publicUrl);
            alert("Profile photo updated successfully!");
        } catch (error) {
            console.error("Error uploading image: ", error);
            alert("Error uploading image: " + error.message);
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleMotivationPhotoUpload = async (event) => {
        try {
            if (!event.target.files || event.target.files.length === 0) return;
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `motivation-${clientId}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            setIsUploadingMotivationPhoto(true);

            const { error: uploadError } = await supabase.storage
                .from('profile-photos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from('profile-photos')
                .getPublicUrl(filePath);

            const publicUrl = publicUrlData.publicUrl;
            setMotivationPhoto(publicUrl);
            localStorage.setItem('motivationPhoto', publicUrl);
            alert("Motivational photo updated!");
        } catch (error) {
            console.error("Error uploading motivation photo: ", error);
            alert("Error: " + error.message);
        } finally {
            setIsUploadingMotivationPhoto(false);
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            {isDemo && (
                <div style={{ 
                    background: 'linear-gradient(90deg, var(--primary) 0%, #ffdf00 100%)', 
                    color: '#000', 
                    padding: '0.75rem', 
                    textAlign: 'center', 
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100
                }}>
                    <span>Viewing Free Demo Interface</span>
                    <Link to="/onboarding" onClick={() => localStorage.clear()} style={{ 
                        background: '#000', 
                        color: '#fff', 
                        padding: '4px 12px', 
                        borderRadius: '20px',
                        textDecoration: 'none',
                        fontSize: '0.8rem'
                    }}>
                        Get Full Access
                    </Link>
                </div>
            )}
            <div className="dashboard-container">
            <div className="dashboard-grid">
                {/* Sidebar Navigation */}
                <aside className="dashboard-sidebar glass-panel">
                    <div className="nav-links">
                        <button
                            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            <LayoutDashboard size={20} />
                            Overview
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'progress' ? 'active' : ''}`}
                            onClick={() => setActiveTab('progress')}
                        >
                            <TrendingUp size={20} />
                            Progress
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'workout' ? 'active' : ''}`}
                            onClick={() => setActiveTab('workout')}
                        >
                            <Activity size={20} />
                            Workout Log
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'foodlog' ? 'active' : ''}`}
                            onClick={() => setActiveTab('foodlog')}
                        >
                            <Utensils size={20} />
                            Food Log
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'vision' ? 'active' : ''}`}
                            onClick={() => setActiveTab('vision')}
                        >
                            <Camera size={20} />
                            AI Scanner
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <Settings size={20} />
                            Settings
                        </button>
                        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                            <div className="sidebar-status glass-panel" style={{ padding: '1rem', marginBottom: '1rem', background: 'rgba(163, 230, 53, 0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--primary)', marginBottom: '0.4rem' }}>
                                    <Ruler size={16} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Current Height</span>
                                </div>
                                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>{height}<span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 'normal', marginLeft: '4px' }}>cm</span></p>
                            </div>
                            <button className="nav-item" onClick={handleLogout} style={{ color: '#ff4444' }}>
                                <LogOut size={20} />
                                Logout
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="dashboard-content">
                    <div className="welcome-header fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div className="welcome-text">
                            <p className="primary">Welcome back,</p>
                            {isEditingName ? (
                                <input
                                    className="name-quick-edit"
                                    value={tempName}
                                    autoFocus
                                    onChange={(e) => setTempName(e.target.value)}
                                    onBlur={() => {
                                        setIsEditingName(false);
                                        setClientName(tempName);
                                        updateProfile();
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            setIsEditingName(false);
                                            setClientName(tempName);
                                            updateProfile();
                                        }
                                    }}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: '2px solid var(--primary)',
                                        color: 'white',
                                        fontSize: '1.8rem',
                                        fontWeight: 'bold',
                                        outline: 'none',
                                        padding: 0,
                                        width: 'auto',
                                        minWidth: '150px'
                                    }}
                                />
                            ) : (
                                <h1 
                                    onClick={() => {
                                        setTempName(clientName);
                                        setIsEditingName(true);
                                    }}
                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    title="Click to edit name"
                                >
                                    {clientName}
                                </h1>
                            )}
                        </div>
                        <Avatar url={profilePhotoUrl} name={clientName} size="lg" />
                    </div>

                    {activeTab === 'progress' && (
                        <div className="progress-section fade-in">
                            <div className="section-header">
                                <h2>Fitness Journey</h2>
                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <div className="stat-card glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.6rem 1.2rem', marginBottom: 0 }}>
                                        <TrendingUp size={16} className="primary" />
                                        <div>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', margin: 0 }}>Weight</p>
                                            <p style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>{weightLog.length > 0 ? weightLog[weightLog.length - 1].weight : '--'} kg</p>
                                        </div>
                                    </div>
                                    <div className="stat-card glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.6rem 1.2rem', marginBottom: 0 }}>
                                        <Ruler size={16} className="primary" />
                                        <div>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', margin: 0 }}>Height</p>
                                            <p style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>{height} cm</p>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                                <div className="stat-card glass-panel" style={{ borderBottom: '3px solid var(--primary)' }}>
                                    <Utensils size={20} className="primary" />
                                    <span className="stat-value">{Math.round(foodLog.filter(item => new Date(item.created_at).toDateString() === diaryDate.toDateString()).reduce((acc, curr) => acc + curr.calories, 0))}</span>
                                    <span className="stat-label">Total Intake</span>
                                </div>
                                <div className="stat-card glass-panel" style={{ borderBottom: '3px solid #ffb944' }}>
                                    <Flame size={20} style={{ color: '#ffb944' }} />
                                    <span className="stat-value">{Math.round(workoutLog.filter(item => new Date(item.created_at).toDateString() === diaryDate.toDateString()).reduce((acc, curr) => acc + (curr.calories_burnt || 0), 0))}</span>
                                    <span className="stat-label">Total Burnt</span>
                                </div>
                                <div className="stat-card glass-panel" style={{ borderBottom: '3px solid #64d2ff' }}>
                                    <Activity size={20} style={{ color: '#64d2ff' }} />
                                    <span className="stat-value">
                                        {Math.round(foodLog.filter(item => new Date(item.created_at).toDateString() === diaryDate.toDateString()).reduce((acc, curr) => acc + curr.calories, 0) - 
                                        workoutLog.filter(item => new Date(item.created_at).toDateString() === diaryDate.toDateString()).reduce((acc, curr) => acc + (curr.calories_burnt || 0), 0))}
                                    </span>
                                    <span className="stat-label">Net Balance</span>
                                </div>
                                <div className="stat-card glass-panel" style={{ borderBottom: '3px solid #f97316' }}>
                                    <Footprints size={20} style={{ color: '#f97316' }} />
                                    <span className="stat-value">{Math.round(dailySteps)}</span>
                                    <span className="stat-label">Steps (Date)</span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                                <button 
                                    className="primary-button" 
                                    onClick={handleSyncSteps}
                                    disabled={isConnectingGoogle}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '0 auto' }}
                                >
                                    <Footprints size={18} />
                                    {isConnectingGoogle ? 'Connecting...' : 'Sync Smart Watch Steps'}
                                </button>
                            </div>

                            <div className="bmi-summary glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Body Mass Index (BMI)</h3>
                                    <p className="text-dim">Based on your current weight ({weightLog[weightLog.length - 1]?.weight}kg)</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{bmi}</span>
                                    <p style={{ color: bmiCategory === 'Normal' ? 'var(--primary)' : '#ffb944', fontWeight: 'bold' }}>{bmiCategory}</p>
                                </div>
                            </div>

                            <div className="charts-container">
                                <div className="chart-card glass-panel">
                                    <h3>Weight Trend (kg)</h3>
                                    <div className="svg-chart-container">
                                        <svg viewBox="0 0 400 200" className="chart-svg">
                                            {[0, 50, 100, 150].map(y => (
                                                <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="rgba(255,255,255,0.05)" />
                                            ))}
                                            <polyline
                                                fill="none"
                                                stroke="var(--primary)"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                points={weightLog.map((pt, i) => `${(i * 350 / Math.max(weightLog.length - 1, 1)) + 25},${200 - ((pt.weight - 75) * 10)}`).join(' ')}
                                            />
                                            {weightLog.map((pt, i) => (
                                                <g key={i}>
                                                    <circle
                                                        cx={(i * 350 / Math.max(weightLog.length - 1, 1)) + 25}
                                                        cy={200 - ((pt.weight - 75) * 10)}
                                                        r="4"
                                                        fill="var(--primary)"
                                                    />
                                                    <text
                                                        x={(i * 350 / Math.max(weightLog.length - 1, 1)) + 25}
                                                        y="190"
                                                        fontSize="10"
                                                        fill="var(--text-dim)"
                                                        textAnchor="middle"
                                                    >{pt.date}</text>
                                                </g>
                                            ))}
                                        </svg>
                                    </div>
                                </div>

                                <div className="chart-card glass-panel">
                                    <h3>Calorie Intake History</h3>
                                    <div className="svg-chart-container">
                                        <svg viewBox="0 0 400 200" className="chart-svg">
                                            {[2100, 1850, 1900, 2200, 1800, 1950, 1850].map((cal, i) => (
                                                <g key={i}>
                                                    <rect
                                                        x={(i * 50) + 25}
                                                        y={200 - (cal / 15)}
                                                        width="30"
                                                        height={cal / 15}
                                                        fill="rgba(163, 230, 53, 0.3)"
                                                        rx="4"
                                                    />
                                                    <text x={(i * 50) + 40} y="190" fontSize="10" fill="var(--text-dim)" textAnchor="middle">
                                                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                                                    </text>
                                                </g>
                                            ))}
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="weight-history" style={{ marginTop: '2rem' }}>
                                <h2>Weight History</h2>
                                <div className="glass-panel" style={{ marginTop: '1rem', overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                <th style={{ padding: '1rem' }}>Date & Time</th>
                                                <th style={{ padding: '1rem' }}>Weight (kg)</th>
                                                <th style={{ padding: '1rem' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {weightLog.slice().reverse().map((log) => (
                                                <tr key={log.id || Math.random()} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '1rem', color: 'var(--text-dim)' }}>{log.fullDate || log.date}</td>
                                                    <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                                                        {editingWeightId === log.id ? (
                                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                                <input
                                                                    type="number"
                                                                    step="0.1"
                                                                    className="glass-input"
                                                                    style={{ width: '80px', padding: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                                                    value={editWeightValue}
                                                                    onChange={(e) => setEditWeightValue(e.target.value)}
                                                                />
                                                                <button onClick={() => updateWeightEntry(log.id)} className="primary-button" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Save</button>
                                                                <button onClick={() => setEditingWeightId(null)} className="secondary-button" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.1)', color: 'white' }}>Cancel</button>
                                                            </div>
                                                        ) : (
                                                            <span>{log.weight} kg</span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        {log.id && log.id.length > 5 ? (
                                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                {editingWeightId !== log.id && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingWeightId(log.id);
                                                                            setEditWeightValue(log.weight);
                                                                        }}
                                                                        style={{ background: 'transparent', border: 'none', color: '#64d2ff', cursor: 'pointer', padding: '0.5rem' }}
                                                                    >
                                                                        ✎ Edit
                                                                    </button>
                                                                )}
                                                                <button
                                                                    className="delete-btn"
                                                                    onClick={() => deleteWeightEntry(log.id)}
                                                                    style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '0.5rem' }}
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-dim" style={{ fontSize: '0.8rem' }}>Demo Entry</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'workout' && (
                        <div className="workout-section fade-in">
                            <div className="trainer-corner glass-panel">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                                    <Activity size={24} />
                                    <h3>Trainer's Corner</h3>
                                </div>
                                <p className="workout-instruction">{trainerNote}</p>
                            </div>

                            <div className="log-creation glass-panel" style={{ marginTop: '2rem', padding: '2rem' }}>
                                <h3>Log New Exercise</h3>
                                <div className="log-inputs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', marginTop: '1.5rem' }}>
                                    <select
                                        className="glass-input"
                                        value={exerciseCategory}
                                        onChange={(e) => setExerciseCategory(e.target.value)}
                                        style={{ 
                                            background: 'rgba(255,255,255,0.05)', 
                                            color: 'white',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            padding: '0.6rem',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        <option style={{ background: '#1a1a1a', color: 'white' }} value="Weight Training">Weight Training</option>
                                        <option style={{ background: '#1a1a1a', color: 'white' }} value="Cardio">Cardio</option>
                                        <option style={{ background: '#1a1a1a', color: 'white' }} value="Flexibility">Flexibility</option>
                                    </select>
                                    <input
                                        type="text"
                                        list="exercise-suggestions"
                                        placeholder="Exercise (e.g. Deadlift)"
                                        value={exerciseName}
                                        onChange={(e) => setExerciseName(e.target.value)}
                                        className="glass-input"
                                    />
                                    <datalist id="exercise-suggestions">
                                        {exerciseCategory === 'Weight Training' && (
                                            <>
                                                <option value="Deadlift" />
                                                <option value="Dumbbell Press" />
                                                <option value="Bench Press" />
                                                <option value="Shoulder Press" />
                                                <option value="Bicep Curls" />
                                                <option value="Leg Press" />
                                                <option value="Weighted Squats" />
                                            </>
                                        )}
                                        {exerciseCategory === 'Cardio' && (
                                            <>
                                                <option value="Running" />
                                                <option value="Cycling" />
                                                <option value="Jumping Jacks" />
                                                <option value="Burpees" />
                                                <option value="Plank" />
                                                <option value="Brisk Walk" />
                                            </>
                                        )}
                                        {exerciseCategory === 'Flexibility' && (
                                            <>
                                                <option value="Yoga" />
                                                <option value="Stretching" />
                                                <option value="Pilates" />
                                            </>
                                        )}
                                    </datalist>
                                    <input
                                        type="text"
                                        placeholder="Result (e.g. 50 kg / 10 reps)"
                                        value={exerciseValue}
                                        onChange={(e) => setExerciseValue(e.target.value)}
                                        className="glass-input"
                                    />
                                    <button className="primary-button" onClick={addWorkoutEntry} style={{ padding: '0 2rem' }}>Log Workout</button>
                                </div>
                            </div>

                            <div className="workout-history" style={{ marginTop: '2rem' }}>
                                <h2>Recent Activities</h2>
                                <div className="glass-panel" style={{ marginTop: '1rem', overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                <th style={{ padding: '1rem' }}>Category</th>
                                                <th style={{ padding: '1rem' }}>Exercise</th>
                                                <th style={{ padding: '1rem' }}>Result</th>
                                                <th style={{ padding: '1rem' }}>Burnt</th>
                                                <th style={{ padding: '1rem' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {workoutLog.map((log) => (
                                                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                                                        <span className={`category-tag ${log.category?.toLowerCase().replace(' ', '-')}`}>
                                                            {log.category || 'Weight Training'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{log.exercise}</td>
                                                    <td style={{ padding: '1rem', color: 'var(--primary)' }}>{log.value}</td>
                                                    <td style={{ padding: '1rem', color: '#ffb944', fontWeight: 'bold' }}>{log.calories_burnt || 0} kcal</td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <button
                                                            className="delete-btn"
                                                            onClick={() => deleteWorkoutEntry(log.id)}
                                                            style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '0.5rem' }}
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'overview' && (
                        <div className="overview-section fade-in">
                            {/* Healthify-style Macro Summary */}
                            <div className="calorie-summary-card glass-panel" style={{ padding: '2rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: '2rem', alignItems: 'center' }}>
                                    {/* Motivation Hub - Black Round Small */}
                                    <div className="motivation-hub" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                        <div 
                                            className="motivation-circle" 
                                            style={{ 
                                                width: '120px', 
                                                height: '120px', 
                                                borderRadius: '50%', 
                                                background: motivationPhoto ? `url(${motivationPhoto}) center/cover no-repeat` : '#000',
                                                border: '2px solid var(--primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                                            }}
                                            onClick={() => document.getElementById('motivation-photo-input').click()}
                                        >
                                            {!motivationPhoto && (
                                                <Camera size={30} color="var(--primary)" style={{ opacity: 0.5 }} />
                                            )}
                                            {isUploadingMotivationPhoto && (
                                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <div className="loader small"></div>
                                                </div>
                                            )}
                                            <div className="upload-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s', gap: '15px' }}>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); document.getElementById('motivation-photo-input').click(); }} 
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                                                    title="Gallery"
                                                >
                                                    <Image size={24} color="white" />
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); document.getElementById('motivation-camera-input').click(); }} 
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                                                    title="Camera"
                                                >
                                                    <Camera size={24} color="var(--primary)" />
                                                </button>
                                            </div>
                                        </div>
                                        <input 
                                            id="motivation-photo-input" 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleMotivationPhotoUpload} 
                                            style={{ display: 'none' }} 
                                        />
                                        <input 
                                            id="motivation-camera-input" 
                                            type="file" 
                                            accept="image/*" 
                                            capture="environment"
                                            onChange={handleMotivationPhotoUpload} 
                                            style={{ display: 'none' }} 
                                        />
                                        
                                        <div style={{ width: '100%', textAlign: 'center' }}>
                                            {isEditingQuote ? (
                                                <input
                                                    className="motivation-quote-input"
                                                    value={motivationQuote}
                                                    autoFocus
                                                    onChange={(e) => setMotivationQuote(e.target.value)}
                                                    onBlur={() => {
                                                        setIsEditingQuote(false);
                                                        localStorage.setItem('motivationQuote', motivationQuote);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            setIsEditingQuote(false);
                                                            localStorage.setItem('motivationQuote', motivationQuote);
                                                        }
                                                    }}
                                                    style={{
                                                        background: '#000',
                                                        color: 'white',
                                                        border: '1px solid var(--primary)',
                                                        borderRadius: '20px',
                                                        padding: '6px 15px',
                                                        fontSize: '0.85rem',
                                                        textAlign: 'center',
                                                        width: '100%',
                                                        outline: 'none'
                                                    }}
                                                />
                                            ) : (
                                                <p 
                                                    onClick={() => setIsEditingQuote(true)}
                                                    style={{ 
                                                        color: 'var(--text-dim)', 
                                                        fontSize: '0.9rem', 
                                                        fontStyle: 'italic',
                                                        cursor: 'pointer',
                                                        margin: 0,
                                                        padding: '4px 8px',
                                                        borderRadius: '8px',
                                                        transition: 'background 0.3s'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                                >
                                                    "{motivationQuote}"
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="macro-ring-and-details" style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '2rem', display: 'flex', gap: '3rem', alignItems: 'center' }}>
                                        <div className="macro-ring-section">
                                            <div className="macro-ring-container">
                                                <svg className="macro-ring-svg" viewBox="0 0 100 100">
                                                    <circle className="macro-ring-bg" cx="50" cy="50" r="44" />
                                                    <circle 
                                                        className="macro-ring-fill" 
                                                        cx="50" 
                                                        cy="50" 
                                                        r="44" 
                                                        strokeDasharray={`${Math.min(100, (foodLog.filter(item => new Date(item.created_at).toDateString() === diaryDate.toDateString()).reduce((acc, curr) => acc + curr.calories, 0) / dailyGoal) * 100) * 2.76} 276`}
                                                    />
                                                </svg>
                                                <div className="macro-center-text">
                                                    <div className="value highlight">
                                                        {Math.round(dailyGoal - foodLog.filter(item => new Date(item.created_at).toDateString() === diaryDate.toDateString()).reduce((acc, curr) => acc + curr.calories, 0) + workoutLog.filter(item => new Date(item.created_at).toDateString() === diaryDate.toDateString()).reduce((acc, curr) => acc + (curr.calories_burnt || 0), 0))}
                                                    </div>
                                                    <div className="label">Left</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="macro-details" style={{ flex: 1 }}>
                                            <h3>Daily Macros</h3>
                                            <div className="macro-grid">
                                                <div className="macro-item">
                                                    <span className="value" style={{ color: '#bef264' }}>{Math.round(foodLog.filter(item => new Date(item.created_at).toDateString() === diaryDate.toDateString()).reduce((acc, curr) => acc + (curr.protein || 0), 0))}g</span>
                                                    <span className="label">Protein</span>
                                                </div>
                                                <div className="macro-item">
                                                    <span className="value" style={{ color: '#64d2ff' }}>{Math.round(foodLog.filter(item => new Date(item.created_at).toDateString() === diaryDate.toDateString()).reduce((acc, curr) => acc + (curr.carbs || 0), 0))}g</span>
                                                    <span className="label">Carbs</span>
                                                </div>
                                                <div className="macro-item">
                                                    <span className="value" style={{ color: '#ffb944' }}>{Math.round(foodLog.filter(item => new Date(item.created_at).toDateString() === diaryDate.toDateString()).reduce((acc, curr) => acc + (curr.fats || 0), 0))}g</span>
                                                    <span className="label">Fats</span>
                                                </div>
                                            </div>
                                            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                                                <span>Consumed: <strong>{Math.round(foodLog.filter(item => new Date(item.created_at).toDateString() === diaryDate.toDateString()).reduce((acc, curr) => acc + curr.calories, 0))}</strong></span>
                                                <span>|</span>
                                                <span>Goal: <strong>{dailyGoal}</strong></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="stats-grid" style={{ marginTop: '2rem' }}>
                                <div className="stat-card glass-panel" onClick={() => setActiveTab('foodlog')} style={{ cursor: 'pointer' }}>
                                    <GlassWater size={24} className="primary" />
                                    <span className="stat-value">{waterIntake}ml</span>
                                    <span className="stat-label">Water Intake</span>
                                    <div className="quick-add">
                                        <button onClick={(e) => { e.stopPropagation(); addWater(250); }}>+250ml</button>
                                    </div>
                                </div>
                                <div className="stat-card glass-panel">
                                    <Moon size={24} className="primary" />
                                    <span className="stat-value">{sleepHours}h</span>
                                    <span className="stat-label">Sleep (Q: {sleepQuality})</span>
                                    <div className="quick-add" style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input 
                                            type="number" 
                                            step="0.5" 
                                            placeholder="Hrs" 
                                            className="min-input" 
                                            onBlur={(e) => updateSleep(e.target.value, sleepQuality)}
                                        />
                                    </div>
                                </div>
                                <div className="stat-card glass-panel">
                                    <Activity size={24} className="primary" />
                                    <span className="stat-value">{bmi}</span>
                                    <span className="stat-label">BMI ({bmiCategory})</span>
                                </div>
                                <div className="stat-card glass-panel" onClick={handleSyncSteps} style={{ cursor: isConnectingGoogle ? 'not-allowed' : 'pointer' }}>
                                    <Activity size={24} className="primary" />
                                    <span className="stat-value">{dailySteps}</span>
                                    <span className="stat-label">Steps Today</span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem', marginTop: '2rem' }}>
                                <div className="glass-panel" style={{ padding: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h3 style={{ margin: 0 }}>Active Challenges</h3>
                                        <Link to="/challenges" style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '600', textDecoration: 'none' }}>View All</Link>
                                    </div>
                                    <ChallengeSummaryCard />
                                </div>
                                <div className="glass-panel" style={{ padding: '2rem' }}>
                                    <h3>Daily Tip</h3>
                                    <p className="text-dim">Drinking water before meals can help you feel fuller and reach your {dailyGoal} kcal goal efficiently.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'foodlog' && (
                        <div className="foodlog-section fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2>Diary</h2>
                                <button className="primary-button" onClick={() => setActiveTab('vision')}>
                                    <Camera size={18} /> Add Food
                                </button>
                            </div>

                            {/* Calendar Strip */}
                            <div className="calendar-strip">
                                {Array.from({ length: 30 }).map((_, i) => {
                                    const d = new Date();
                                    d.setDate(d.getDate() - (29 - i));
                                    const isSelected = d.toDateString() === diaryDate.toDateString();
                                    const isToday = d.toDateString() === new Date().toDateString();
                                    return (
                                        <div 
                                            key={i}
                                            onClick={() => setDiaryDate(new Date(d))}
                                            className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                                        >
                                            <span className="weekday">
                                                {d.toLocaleDateString([], { weekday: 'short' })}
                                            </span>
                                            <span className="date">
                                                {d.getDate()}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {['breakfast', 'lunch', 'dinner', 'snack'].map(category => {
                                const categoryItems = foodLog.filter(item => 
                                    item.meal_type === category && 
                                    new Date(item.created_at).toDateString() === diaryDate.toDateString()
                                );
                                return (
                                    <div key={category} className="meal-category-section glass-panel" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                                            <h3 style={{ textTransform: 'capitalize' }}>{category}</h3>
                                            <span className="category-total">
                                                {Math.round(categoryItems.reduce((acc, curr) => acc + curr.calories, 0))} kcal
                                            </span>
                                        </div>
                                        <div className="meal-items">
                                            {categoryItems.map(item => (
                                                <div key={item.id} className="meal-item-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                                                        <div className="text-dim" style={{ fontSize: '0.8rem' }}>
                                                            {Math.round(item.protein)}g P | {Math.round(item.carbs)}g C | {Math.round(item.fats)}g F
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <span style={{ fontWeight: '600' }}>{Math.round(item.calories)}</span>
                                                        <button onClick={() => deleteFoodEntry(item.id)} className="delete-btn">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {categoryItems.length === 0 && (
                                                <button 
                                                    className="text-dim" 
                                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem 0', fontStyle: 'italic' }}
                                                    onClick={() => { setMealType(category); setActiveTab('vision'); }}
                                                >
                                                    + Add something to {category}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === 'vision' && (
                        <div className="vision-section fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2>AI Food Scanner</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                                    <Plus size={14} /> Manual Entry Below
                                </div>
                            </div>

                            {!scanResult ? (
                                <>
                                    <VisionScanner onResult={handleScanResult} />
                                    
                                    <div className="manual-entry-form glass-panel" style={{ marginTop: '2rem', padding: '1.5rem' }}>
                                        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Or Enter Manually</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                            <input 
                                                className="glass-input" 
                                                placeholder="Food name (e.g. Chicken breast)"
                                                value={manualFoodName}
                                                onChange={(e) => setManualFoodName(e.target.value)}
                                            />
                                            <input 
                                                type="number" 
                                                className="glass-input" 
                                                placeholder="Cals"
                                                value={manualCals}
                                                onChange={(e) => setManualCals(e.target.value)}
                                            />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                            <input 
                                                type="number" 
                                                className="glass-input" 
                                                placeholder="Protein (g)"
                                                value={manualProtein}
                                                onChange={(e) => setManualProtein(e.target.value)}
                                            />
                                            <input 
                                                type="number" 
                                                className="glass-input" 
                                                placeholder="Carbs (g)"
                                                value={manualCarbs}
                                                onChange={(e) => setManualCarbs(e.target.value)}
                                            />
                                            <input 
                                                type="number" 
                                                className="glass-input" 
                                                placeholder="Fats (g)"
                                                value={manualFats}
                                                onChange={(e) => setManualFats(e.target.value)}
                                            />
                                        </div>
                                        <button 
                                            className="primary-button" 
                                            style={{ width: '100%', padding: '1rem' }}
                                            onClick={handleManualEntry}
                                            disabled={!manualFoodName || !manualCals}
                                        >
                                            Log Entry
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="scan-verification glass-panel fade-in" style={{ padding: '2rem', marginTop: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                                        <CheckCircle2 size={32} />
                                        <h3>AI Analysis Complete!</h3>
                                    </div>

                                    <div className="result-details" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                        <div>
                                            <label className="text-dim">Identified Item</label>
                                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{scanResult.itemName}</p>
                                        </div>
                                        <div>
                                            <label className="text-dim">Log to Meal</label>
                                            <select 
                                                className="glass-input" 
                                                value={mealType} 
                                                onChange={(e) => setMealType(e.target.value)}
                                                style={{ 
                                                    marginTop: '0.5rem', 
                                                    width: '100%', 
                                                    background: 'rgba(255,255,255,0.05)', 
                                                    color: 'white',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    padding: '0.6rem',
                                                    borderRadius: '8px'
                                                }}
                                            >
                                                <option style={{ background: '#1a1a1a', color: 'white' }} value="breakfast">Breakfast</option>
                                                <option style={{ background: '#1a1a1a', color: 'white' }} value="lunch">Lunch</option>
                                                <option style={{ background: '#1a1a1a', color: 'white' }} value="dinner">Dinner</option>
                                                <option style={{ background: '#1a1a1a', color: 'white' }} value="snack">Snack</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', margin: '1.5rem 0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                                            <div>
                                                <span className="stat-label">Protein</span>
                                                <p style={{ fontWeight: 'bold' }}>{Math.round(scanResult.protein)}g</p>
                                            </div>
                                            <div>
                                                <span className="stat-label">Carbs</span>
                                                <p style={{ fontWeight: 'bold' }}>{Math.round(scanResult.carbs)}g</p>
                                            </div>
                                            <div>
                                                <span className="stat-label">Fats</span>
                                                <p style={{ fontWeight: 'bold' }}>{Math.round(scanResult.fats)}g</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button className="primary-button" style={{ flex: 1 }} onClick={addToLog}>
                                            Save to Log
                                        </button>
                                        <button
                                            className="secondary-button"
                                            style={{ color: 'white', background: 'rgba(255,255,255,0.1)' }}
                                            onClick={() => setScanResult(null)}
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="settings-section fade-in">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
                                <Avatar url={profilePhotoUrl} name={clientName} size="xl" />
                                <div>
                                    <h2 style={{ marginBottom: '0.5rem' }}>Profile Settings</h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                                        <label className="text-dim" style={{ fontSize: '0.8rem' }}>Display Name:</label>
                                        <input
                                            value={clientName}
                                            onChange={(e) => setClientName(e.target.value)}
                                            style={{
                                                fontSize: '1.2rem',
                                                fontWeight: 'bold',
                                                background: 'transparent',
                                                border: 'none',
                                                borderBottom: '1px solid var(--primary)',
                                                color: 'white',
                                                outline: 'none',
                                                padding: '2px 0',
                                                width: '200px'
                                            }}
                                        />
                                        <button 
                                            onClick={updateProfile}
                                            style={{ 
                                                background: 'var(--primary)', 
                                                border: 'none', 
                                                color: 'black', 
                                                cursor: 'pointer',
                                                fontSize: '0.7rem',
                                                fontWeight: 'bold',
                                                padding: '4px 10px',
                                                borderRadius: '4px'
                                            }}
                                        >SAVE</button>
                                    </div>
                                    <p className="text-dim">Customize your fitness journey targets.</p>

                                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.8rem' }}>
                                        <label htmlFor="photo-upload" className="primary-button" style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                            cursor: isUploadingImage ? 'not-allowed' : 'pointer',
                                            opacity: isUploadingImage ? 0.7 : 1,
                                            padding: '0.5rem 1rem', fontSize: '0.9rem'
                                        }}>
                                            <Image size={16} />
                                            {isUploadingImage ? 'Uploading...' : 'Library'}
                                        </label>
                                        <label htmlFor="photo-camera" className="secondary-button" style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                            cursor: isUploadingImage ? 'not-allowed' : 'pointer',
                                            opacity: isUploadingImage ? 0.7 : 1,
                                            padding: '0.5rem 1rem', fontSize: '0.9rem',
                                            background: 'rgba(255,255,255,0.05)', color: 'white'
                                        }}>
                                            <Camera size={16} />
                                            Camera
                                        </label>
                                        <input
                                            id="photo-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoUpload}
                                            style={{ display: 'none' }}
                                            disabled={isUploadingImage}
                                        />
                                        <input
                                            id="photo-camera"
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            onChange={handlePhotoUpload}
                                            style={{ display: 'none' }}
                                            disabled={isUploadingImage}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="settings-grid" style={{ marginTop: '2rem' }}>
                                <div className="settings-card glass-panel" style={{ padding: '2rem' }}>
                                    <h3>Fitness Journey</h3>
                                    
                                    {/* Weight Update */}
                                    <div style={{ marginTop: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <label className="text-dim" style={{ display: 'block', marginBottom: '0.8rem' }}>Update Current Weight</label>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <input
                                                type="number"
                                                step="0.1"
                                                className="glass-input"
                                                placeholder="Weight (kg)"
                                                value={newWeight}
                                                onChange={(e) => setNewWeight(e.target.value)}
                                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.8rem', borderRadius: '8px', flex: 1 }}
                                            />
                                            <button
                                                className="primary-button"
                                                style={{ padding: '0.8rem 1.5rem' }}
                                                onClick={addWeightEntry}
                                            >Update Weight</button>
                                        </div>
                                    </div>

                                    {/* Height Update */}
                                    <div style={{ marginTop: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                                            <label className="text-dim">Update Height</label>
                                            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '2px' }}>
                                                <button 
                                                    onClick={() => setHeightUnit('cm')}
                                                    style={{ 
                                                        padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', border: 'none', cursor: 'pointer',
                                                        background: heightUnit === 'cm' ? 'var(--primary)' : 'transparent',
                                                        color: heightUnit === 'cm' ? 'black' : 'white'
                                                    }}
                                                >CM</button>
                                                <button 
                                                    onClick={() => setHeightUnit('in')}
                                                    style={{ 
                                                        padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', border: 'none', cursor: 'pointer',
                                                        background: heightUnit === 'in' ? 'var(--primary)' : 'transparent',
                                                        color: heightUnit === 'in' ? 'black' : 'white'
                                                    }}
                                                >FT/IN</button>
                                            </div>
                                        </div>

                                        {heightUnit === 'cm' ? (
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <input
                                                    type="number"
                                                    className="glass-input"
                                                    value={height}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        setHeight(val);
                                                        setHeightFt(Math.floor(val / 30.48));
                                                        setHeightIn(Math.round((val / 2.54) % 12));
                                                    }}
                                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.8rem', borderRadius: '8px', flex: 1 }}
                                                />
                                                <button
                                                    className="primary-button"
                                                    style={{ padding: '0.8rem 1.5rem' }}
                                                    onClick={updateProfile}
                                                >Update Height</button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                                                    <div style={{ flex: 1 }}>
                                                        <input
                                                            type="number"
                                                            className="glass-input"
                                                            value={heightFt}
                                                            onChange={(e) => {
                                                                const ft = parseInt(e.target.value) || 0;
                                                                setHeightFt(ft);
                                                                const cm = Math.round(((ft * 12) + (parseFloat(heightIn) || 0)) * 2.54 * 10) / 10;
                                                                setHeight(cm);
                                                            }}
                                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.8rem', borderRadius: '8px', width: '100%' }}
                                                        />
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: '4px' }}>ft</span>
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <input
                                                            type="number"
                                                            className="glass-input"
                                                            value={heightIn}
                                                            onChange={(e) => {
                                                                const inch = parseFloat(e.target.value) || 0;
                                                                setHeightIn(inch);
                                                                const cm = Math.round(((parseFloat(heightFt) || 0) * 12 + inch) * 2.54 * 10) / 10;
                                                                setHeight(cm);
                                                            }}
                                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.8rem', borderRadius: '8px', width: '100%' }}
                                                        />
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: '4px' }}>in</span>
                                                    </div>
                                                </div>
                                                <button
                                                    className="primary-button"
                                                    style={{ padding: '0.8rem 1.5rem' }}
                                                    onClick={updateProfile}
                                                >Update Height</button>
                                            </div>
                                        )}
                                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end' }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <p className="text-dim" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px' }}>Membership Status</p>
                                                <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Active Elite Member</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            
            {/* Premium Mobile Bottom Navigation */}
            <nav className="modern-bottom-nav">
                <button 
                    className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('overview')}
                >
                    <Home size={24} />
                    <span>Home</span>
                </button>
                <button 
                    className={`nav-tab ${activeTab === 'foodlog' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('foodlog')}
                >
                    <ClipboardList size={24} />
                    <span>Log</span>
                </button>
                <button 
                    className={`nav-tab ${activeTab === 'workout' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('workout')}
                >
                    <Dumbbell size={24} />
                    <span>Workout</span>
                </button>
                <button 
                    className={`nav-tab ${activeTab === 'progress' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('progress')}
                >
                    <BarChart2 size={24} />
                    <span>Progress</span>
                </button>
                <button 
                    className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('settings')}
                >
                    <User size={24} />
                    <span>Profile</span>
                </button>
            </nav>

            {/* FAB */}
            <button className="floating-add-btn" onClick={() => setActiveTab('vision')}>
                <Plus size={32} color="#000" />
            </button>

            {/* Shared Media Lightbox */}
            <MediaLightbox item={selectedVideo} onClose={() => setSelectedVideo(null)} />
        </div>
      </div>
    );
};

export default Dashboard;
