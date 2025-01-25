import { useTheme } from './../components/ThemeProvider';
import { toast as toastify } from "react-toastify";
import { useEffect, useState, useCallback } from 'react';

const useToast = () => {
    // TODO: figure out dynamic theme switching
    const theme = useTheme();
    const [toastClass, setToastClass] = useState('');

    useEffect(() => {
        setToastClass(theme.darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800');
    }, [theme.darkMode]);

    const toast = {
        success: useCallback((message: string) => {
            toastify(message, {
                className: theme.darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800',
            });
        }, [theme.darkMode]),
        error: useCallback((message: string) => {
            toastify(message, {
                className: theme.darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800',
            });
        }, [theme.darkMode]),
    }

    return toast;
}
export default useToast;