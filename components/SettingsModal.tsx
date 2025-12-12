
import React, { useState, useEffect, useRef } from 'react';
import { UserSettings, ThemeColor, PurchasingItem, AppData } from '../types';
import { XIcon, PlusIcon, TrashIcon, UserIcon, BriefcaseIcon, StarIcon, DownloadIcon, UploadIcon, DatabaseIcon, KeyboardIcon, ZapIcon } from './Icons';
import { translations } from '../translations';
import { themes } from '../themes';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: UserSettings;
    fullData?: AppData; // Need full data for export
    onSave: (newSettings: UserSettings) => void;
    onImport?: (data: AppData) => void; // New handler for import
}

type TabKey = 'general' | 'work' | 'features' | 'data';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, fullData, onSave, onImport }) => {
    const [formData, setFormData] = useState<UserSettings>(settings);
    const [activeTab, setActiveTab] = useState<TabKey>('general');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Temporary state for adding new item
    const [newItemName, setNewItemName] = useState("");
    const [newItemPrice, setNewItemPrice] = useState("");
    const [newItemEmoji, setNewItemEmoji] = useState("🎁");

    // Sync settings when modal opens
    useEffect(() => {
        if (isOpen) {
            // Ensure new boolean flags have defaults if coming from old save
            setFormData({
                ...settings,
                showTree: settings.showTree ?? true,
                showParticles: settings.showParticles ?? true
            });
        }
    }, [isOpen, settings]);

    const t = translations[formData.language];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        // Handle checkbox separately
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
        }));
    };

    const handleLanguageChange = (lang: 'en' | 'zh') => {
        setFormData(prev => ({ ...prev, language: lang }));
    };

    const handleThemeChange = (color: ThemeColor) => {
        setFormData(prev => ({ ...prev, themeColor: color }));
    };

    const handleAddItem = () => {
        if (!newItemName || !newItemPrice) return;
        const newItem: PurchasingItem = {
            id: Date.now().toString(),
            name: newItemName,
            price: Number(newItemPrice),
            emoji: newItemEmoji || "🎁"
        };
        setFormData(prev => ({
            ...prev,
            purchasingItems: [...prev.purchasingItems, newItem]
        }));
        setNewItemName("");
        setNewItemPrice("");
        setNewItemEmoji("🎁");
    };

    const handleDeleteItem = (id: string) => {
        if (formData.purchasingItems.length <= 1) return; // Prevent deleting last item
        setFormData(prev => ({
            ...prev,
            purchasingItems: prev.purchasingItems.filter(item => item.id !== id)
        }));
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    // --- Export Data ---
    const handleExport = () => {
        if (!fullData) return;
        const dataStr = JSON.stringify(fullData, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `pinework_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // --- Import Data ---
    const triggerImport = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = event.target?.result as string;
                const parsedData = JSON.parse(json);

                // Basic validation
                if (parsedData.settings && Array.isArray(parsedData.tasks)) {
                    if (window.confirm(t.confirmImport)) {
                        onImport?.(parsedData);
                        setFormData(parsedData.settings); // Update local form
                        alert(t.importSuccess);
                    }
                } else {
                    alert("Invalid data file.");
                }
            } catch (err) {
                console.error(err);
                alert("Failed to parse JSON.");
            }
        };
        reader.readAsText(file);
        // Reset input
        e.target.value = '';
    };


    const colorOptions: ThemeColor[] = ['pine', 'ocean', 'sunset', 'lavender', 'graphite'];

    const tabs = [
        { key: 'general', label: t.tab_general, icon: UserIcon },
        { key: 'work', label: t.tab_work, icon: BriefcaseIcon },
        { key: 'features', label: t.tab_features, icon: StarIcon },
        { key: 'data', label: t.tab_data, icon: DatabaseIcon },
    ];

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${isOpen ? 'visible' : 'invisible pointer-events-none'}`}
        >
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/30 backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div
                className={`bg-white relative rounded-3xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-8'}`}
            >

                {/* Header */}
                <div className="flex items-center justify-between p-6 bg-primary-50 border-b border-primary-100 flex-shrink-0">
                    <h2 className="text-xl font-bold text-primary-900">{t.personalize}</h2>
                    <button onClick={onClose} className="p-2 text-primary-600 hover:bg-primary-200 rounded-full transition-colors">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-grow overflow-hidden">

                    {/* Sidebar Navigation */}
                    <div className="w-1/4 bg-gray-50 border-r border-gray-100 flex flex-col p-2 space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key as TabKey)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold text-sm ${
                                        isActive
                                            ? 'bg-white text-primary-700 shadow-sm ring-1 ring-gray-100'
                                            : 'text-gray-500 hover:bg-white/60 hover:text-primary-600'
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'opacity-70'}`} />
                                    <span className="hidden sm:block">{tab.label}</span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white relative">

                        {/* --- GENERAL TAB --- */}
                        {activeTab === 'general' && (
                            <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                                {/* Language */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.language}</label>
                                    <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
                                        <button
                                            onClick={() => handleLanguageChange('zh')}
                                            className={`py-1.5 px-4 rounded-lg text-sm font-medium transition-all ${formData.language === 'zh' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-primary-600'}`}
                                        >
                                            {t.chinese}
                                        </button>
                                        <button
                                            onClick={() => handleLanguageChange('en')}
                                            className={`py-1.5 px-4 rounded-lg text-sm font-medium transition-all ${formData.language === 'en' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-primary-600'}`}
                                        >
                                            {t.english}
                                        </button>
                                    </div>
                                </div>

                                {/* Theme */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.themeColor}</label>
                                    <div className="flex gap-4">
                                        {colorOptions.map((color) => {
                                            const bgStyle = `rgb(${themes[color][500]})`;
                                            const isSelected = formData.themeColor === color;
                                            return (
                                                <button
                                                    key={color}
                                                    onClick={() => handleThemeChange(color)}
                                                    className={`group relative flex flex-col items-center gap-1 transition-all ${isSelected ? 'scale-110' : 'opacity-70 hover:opacity-100'}`}
                                                >
                                                    <div
                                                        className={`w-10 h-10 rounded-full shadow-sm transition-transform ${isSelected ? 'ring-2 ring-offset-2 ring-primary-200' : ''}`}
                                                        style={{ backgroundColor: bgStyle }}
                                                    >
                                                        {isSelected && (
                                                            <div className="w-full h-full flex items-center justify-center text-white">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-medium text-gray-600 group-hover:text-primary-600">{t[color]}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-primary-700 ml-1">{t.nickname}</label>
                                    <input
                                        type="text"
                                        name="userName"
                                        value={formData.userName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                                    />
                                </div>

                                {/* Background */}
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-primary-700 ml-1">{t.bgImage}</label>
                                    <input
                                        type="text"
                                        name="backgroundImage"
                                        placeholder="https://..."
                                        value={formData.backgroundImage || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400"
                                    />
                                    <p className="text-xs text-gray-500 ml-1">{t.bgHint}</p>
                                </div>

                                {/* Shortcuts Section (New) */}
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <KeyboardIcon className="w-4 h-4 text-primary-500" />
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.shortcuts}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <span className="text-sm text-gray-600">{t.shortcut_new_task}</span>
                                            <kbd className="bg-white border border-gray-200 rounded px-2 py-0.5 text-xs font-mono text-gray-500 shadow-sm">Alt + N</kbd>
                                        </div>
                                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <span className="text-sm text-gray-600">{t.shortcut_mini_mode}</span>
                                            <kbd className="bg-white border border-gray-200 rounded px-2 py-0.5 text-xs font-mono text-gray-500 shadow-sm">Alt + M</kbd>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- WORK TAB --- */}
                        {activeTab === 'work' && (
                            <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-primary-700 ml-1">{t.monthlySalary}</label>
                                        <input
                                            type="number"
                                            name="monthlySalary"
                                            value={formData.monthlySalary}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-primary-700 ml-1">{t.currency}</label>
                                        <input
                                            type="text"
                                            name="currencySymbol"
                                            value={formData.currencySymbol}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-primary-700 ml-1">{t.workDays}</label>
                                        <input
                                            type="number"
                                            name="workingDaysPerMonth"
                                            value={formData.workingDaysPerMonth}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-primary-700 ml-1">{t.workHours}</label>
                                        <input
                                            type="number"
                                            name="workingHoursPerDay"
                                            value={formData.workingHoursPerDay}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400"
                                        />
                                    </div>
                                </div>

                                {/* Payday Setting */}
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-primary-700 ml-1">{t.payday}</label>
                                    <input
                                        type="number"
                                        name="payday"
                                        min="1"
                                        max="31"
                                        value={formData.payday || 15}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-primary-700 ml-1">{t.startTime}</label>
                                        <input
                                            type="time"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-primary-700 ml-1">{t.endTime}</label>
                                        <input
                                            type="time"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-primary-700 ml-1">{t.lunchStart}</label>
                                        <input
                                            type="time"
                                            name="lunchStartTime"
                                            value={formData.lunchStartTime || "12:00"}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-primary-700 ml-1">{t.lunchEnd}</label>
                                        <input
                                            type="time"
                                            name="lunchEndTime"
                                            value={formData.lunchEndTime || "13:30"}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <input
                                        type="checkbox"
                                        id="mentalVictoryMode"
                                        name="mentalVictoryMode"
                                        checked={formData.mentalVictoryMode}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
                                    />
                                    <div className="flex flex-col">
                                        <label htmlFor="mentalVictoryMode" className="text-sm font-semibold text-primary-700 select-none cursor-pointer">
                                            {t.mentalVictory}
                                        </label>
                                        <span className="text-xs text-gray-500">{t.mentalVictoryHint}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- FEATURES TAB --- */}
                        {activeTab === 'features' && (
                            <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

                                {/* Visual Settings */}
                                <div className="pt-2">
                                    <div className="flex items-center gap-2 mb-3">
                                        <ZapIcon className="w-4 h-4 text-primary-500" />
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.visualEffects}</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <input
                                                type="checkbox"
                                                id="showTree"
                                                name="showTree"
                                                checked={formData.showTree !== false} // default to true
                                                onChange={handleChange}
                                                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
                                            />
                                            <label htmlFor="showTree" className="text-sm font-semibold text-primary-700 select-none cursor-pointer">
                                                {t.showTree}
                                            </label>
                                        </div>
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <input
                                                type="checkbox"
                                                id="showParticles"
                                                name="showParticles"
                                                checked={formData.showParticles !== false} // default to true
                                                onChange={handleChange}
                                                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
                                            />
                                            <label htmlFor="showParticles" className="text-sm font-semibold text-primary-700 select-none cursor-pointer">
                                                {t.showParticles}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Pomodoro */}
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-primary-700 ml-1">{t.pomodoroDuration}</label>
                                    <input
                                        type="number"
                                        name="pomodoroDuration"
                                        value={formData.pomodoroDuration}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400"
                                    />
                                </div>

                                {/* Footer Text */}
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-primary-700 ml-1">{t.customFooterText}</label>
                                    <textarea
                                        name="customQuote"
                                        value={formData.customQuote}
                                        onChange={handleChange}
                                        placeholder={t.customFooterHint}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none h-24 text-sm leading-relaxed"
                                    />
                                </div>

                                {/* Purchasing Targets */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-primary-700 ml-1">{t.customTargets}</label>
                                    <div className="bg-gray-50 rounded-2xl p-4 space-y-4 border border-gray-100">
                                        {/* List Existing */}
                                        <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                                            {formData.purchasingItems.map((item) => (
                                                <div key={item.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                    <span className="text-2xl w-10 text-center">{item.emoji}</span>
                                                    <div className="flex-1 flex flex-col">
                                                        <span className="text-sm font-bold text-gray-800">{item.name}</span>
                                                        <span className="text-xs text-gray-500 font-mono">{formData.currencySymbol}{item.price}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteItem(item.id)}
                                                        disabled={formData.purchasingItems.length <= 1}
                                                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg disabled:opacity-30 transition-colors"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Add New */}
                                        <div className="flex gap-2 items-end pt-2 border-t border-gray-200">
                                            <div className="flex flex-col gap-1 w-[20%]">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">{t.itemEmoji}</label>
                                                <input
                                                    type="text"
                                                    className="w-full p-2.5 rounded-xl border border-gray-200 text-center bg-white"
                                                    value={newItemEmoji}
                                                    onChange={(e) => setNewItemEmoji(e.target.value)}
                                                    maxLength={2}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1 w-[45%]">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">{t.itemName}</label>
                                                <input
                                                    type="text"
                                                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
                                                    value={newItemName}
                                                    onChange={(e) => setNewItemName(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1 w-[35%]">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">{t.itemPrice}</label>
                                                <input
                                                    type="number"
                                                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
                                                    value={newItemPrice}
                                                    onChange={(e) => setNewItemPrice(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleAddItem}
                                            disabled={!newItemName || !newItemPrice}
                                            className="w-full py-3 bg-primary-100 text-primary-700 font-bold rounded-xl hover:bg-primary-200 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                            {t.addItem}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- DATA TAB (New) --- */}
                        {activeTab === 'data' && (
                            <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                                <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-2xl">
                                    <p className="text-sm text-yellow-800 leading-relaxed">
                                        {t.backupHint}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {/* Export */}
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-primary-900">{t.exportData}</h3>
                                            <p className="text-xs text-gray-500 mt-1">{t.exportDesc}</p>
                                        </div>
                                        <button
                                            onClick={handleExport}
                                            className="flex items-center gap-2 px-4 py-2 bg-white text-primary-700 font-bold text-sm rounded-xl border border-gray-200 shadow-sm hover:bg-primary-50 transition-all"
                                        >
                                            <DownloadIcon className="w-4 h-4" />
                                            {t.exportBtn}
                                        </button>
                                    </div>

                                    {/* Import */}
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-primary-900">{t.importData}</h3>
                                            <p className="text-xs text-gray-500 mt-1">{t.importDesc}</p>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                accept=".json"
                                                className="hidden"
                                            />
                                            <button
                                                onClick={triggerImport}
                                                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-bold text-sm rounded-xl shadow-md hover:bg-primary-700 transition-all"
                                            >
                                                <UploadIcon className="w-4 h-4" />
                                                {t.importBtn}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end flex-shrink-0">
                    <button
                        onClick={handleSave}
                        className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-200 transition-all active:scale-95"
                    >
                        {t.save}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
