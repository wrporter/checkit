import { useEffect, useState } from 'react';

function getStorageValue(key: string, defaultValue?: any) {
    const saved = localStorage.getItem(key);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (ignored) {
            return saved;
        }
    }
    return defaultValue;
}

export default function useLocalStorage(key: string, defaultValue?: any) {
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        setValue(() => getStorageValue(key, defaultValue));
    }, [key, defaultValue]);

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}
