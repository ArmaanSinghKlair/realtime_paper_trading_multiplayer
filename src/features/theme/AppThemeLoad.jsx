import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateThemeAsync } from './themeSlice';
import { LOCAL_CACHE_THEME_SLICE_KEY } from '../../store/storeConstants';

/**
 * Apply theme on application load.
 * Intended to run ONLY ONCE.
 */
const AppThemeLoad = () => {
    const storeDispatch = useDispatch();
    useEffect(()=>{
        storeDispatch(updateThemeAsync(localStorage.getItem(LOCAL_CACHE_THEME_SLICE_KEY) || THEME_SLICE_VALUES.DARK));
    },[]);
}

export default AppThemeLoad