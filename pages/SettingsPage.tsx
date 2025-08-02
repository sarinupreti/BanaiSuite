import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { Button } from '../components/ui';

const SettingsPage: React.FC = () => {
    const { theme, setTheme, currency, setCurrency } = useSettings();

    const themes = [
        { name: 'Light', value: 'light' },
        { name: 'Dark', value: 'dark' },
        { name: 'System', value: 'system' },
    ];
    
    const currencies = [
        { name: 'US Dollar (USD)', value: 'USD' },
        { name: 'Indian Rupee (INR)', value: 'INR' },
        { name: 'Nepalese Rupee (NPR)', value: 'NPR' },
    ];

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <p className="text-sm text-on-surface-variant mt-1">Customize the look and feel of the app.</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <label className="text-base font-medium text-on-surface">Theme</label>
                        <p className="text-sm text-on-surface-variant">Select your preferred color theme.</p>
                        <div className="flex flex-wrap gap-2 pt-2">
                            {themes.map((t) => (
                                <Button 
                                    key={t.value} 
                                    variant={theme === t.value ? 'filled' : 'outlined'} 
                                    onClick={() => setTheme(t.value as any)}
                                >
                                    {t.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Localization</CardTitle>
                    <p className="text-sm text-on-surface-variant mt-1">Choose your preferred currency.</p>
                </CardHeader>
                <CardContent>
                     <div className="space-y-2">
                        <label htmlFor="currency-select" className="text-base font-medium text-on-surface">Currency</label>
                        <p className="text-sm text-on-surface-variant">This will affect how monetary values are displayed.</p>
                        <select
                            id="currency-select"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value as any)}
                            className="mt-2 w-full md:w-1/2 rounded-lg border border-outline bg-surface-variant px-3 py-2 text-on-surface focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                        >
                            {currencies.map((c) => (
                                <option key={c.value} value={c.value}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SettingsPage;
