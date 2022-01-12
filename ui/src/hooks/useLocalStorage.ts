import { useEffect, useState } from 'react';

function getStorageValue(key: string, defaultValue?: any) {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(key);
        return saved !== null ? JSON.parse(saved) : defaultValue;
    }
    return defaultValue;
}

export default function useLocalStorage(key: string, defaultValue?: any) {
    const [value, setValue] = useState(() => {
        return getStorageValue(key, defaultValue);
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}
