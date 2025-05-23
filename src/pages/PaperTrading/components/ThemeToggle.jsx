import React from 'react';
import { Button } from 'react-bootstrap';
import { Moon, Sun } from 'react-bootstrap-icons';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentTheme, THEME_SLICE_VALUES, updateThemeAsync } from '../../../features/theme/themeSlice';
import { ICON_SMALL_SIZE } from '../../../styles/constants';

/**
 * ThemeToggle component.
 * This component is responsible for toggling between light and dark themes.
 * It uses the Redux store to manage the theme state.
 * The component displays a sun icon for light mode and a moon icon for dark mode.
 * @param {string} rootElClassName - Additional class name for the root element. 
 * @returns 
 */
const ThemeToggle = ({ rootElClassName='' }) => {
  const currentTheme = useSelector(getCurrentTheme);
  const storeDispatch = useDispatch();

  /**
   * Handler for theme toggle button click
   */
  const handleThemeToggle = () =>{
    if(currentTheme == THEME_SLICE_VALUES.DARK){
      storeDispatch(updateThemeAsync(THEME_SLICE_VALUES.LIGHT));
    } else{
      storeDispatch(updateThemeAsync(THEME_SLICE_VALUES.DARK));
    }
  }

  return (
    <Button
      variant={`${currentTheme==THEME_SLICE_VALUES.DARK ? 'outline-secondary':'outline-dark'}`}
      onClick={handleThemeToggle}
      className={`d-flex align-items-center justify-content-center rounded-circle p-3 ${rootElClassName}`}
    >
      {(currentTheme == THEME_SLICE_VALUES.DARK) ? (
        <Sun size={ICON_SMALL_SIZE} className={`text-warning`}/> // Yellow sun for light mode
      ) : (
        <Moon size={ICON_SMALL_SIZE}  /> // Gray moon for dark mode
      )}
    </Button>
  );
};

export default ThemeToggle;