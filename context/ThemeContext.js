import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 創建主題上下文
export const ThemeContext = createContext();

// 主題提供者組件
export const ThemeProvider = ({ children }) => {
  // 系統當前顏色模式
  const systemColorScheme = useColorScheme();
  // 儲存用戶主動設置的深淺模式狀態
  const [isDarkMode, setIsDarkMode] = useState(false);
  // 是否已從存儲中加載設置
  const [isLoaded, setIsLoaded] = useState(false);
  // 是否使用系統設置
  const [useSystemTheme, setUseSystemTheme] = useState(true);
  
  // 初始加載保存的主題設置
  useEffect(() => {
    const loadThemeSettings = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem('isDarkMode');
        const savedUseSystemTheme = await AsyncStorage.getItem('useSystemTheme');
        
        // 如果有保存使用系統設置的選項
        if (savedUseSystemTheme !== null) {
          const useSystem = savedUseSystemTheme === 'true';
          setUseSystemTheme(useSystem);
          
          // 如果使用系統設置，則跟隨系統主題
          if (useSystem) {
            setIsDarkMode(systemColorScheme === 'dark');
          } 
          // 否則使用用戶保存的設置
          else if (savedThemeMode !== null) {
            setIsDarkMode(savedThemeMode === 'true');
          }
        } 
        // 如果沒有保存系統設置選項，檢查是否有保存的深淺模式設置
        else if (savedThemeMode !== null) {
          setIsDarkMode(savedThemeMode === 'true');
          setUseSystemTheme(false);
        } 
        // 如果都沒有，默認使用系統設置
        else {
          setIsDarkMode(systemColorScheme === 'dark');
        }
        
        setIsLoaded(true);
      } catch (error) {
        console.error('加載主題設置時出錯:', error);
        setIsDarkMode(systemColorScheme === 'dark');
        setIsLoaded(true);
      }
    };
    
    loadThemeSettings();
  }, [systemColorScheme]);
  
  // 當系統顏色模式變化時，如果設置為跟隨系統，則更新主題
  useEffect(() => {
    if (useSystemTheme && isLoaded) {
      setIsDarkMode(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, useSystemTheme, isLoaded]);
  
  // 切換深淺模式
  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      setUseSystemTheme(false);
      await AsyncStorage.setItem('isDarkMode', String(newMode));
      await AsyncStorage.setItem('useSystemTheme', 'false');
    } catch (error) {
      console.error('保存主題設置時出錯:', error);
    }
  };
  
  // 設置是否使用系統主題
  const setSystemTheme = async (value) => {
    try {
      setUseSystemTheme(value);
      await AsyncStorage.setItem('useSystemTheme', String(value));
      
      if (value) {
        setIsDarkMode(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('保存系統主題設置時出錯:', error);
    }
  };
  
  // 上下文值
  const contextValue = {
    isDarkMode,
    toggleTheme,
    useSystemTheme,
    setSystemTheme,
    isLoaded
  };
  
  // 僅在加載完成後渲染子組件，避免閃爍
  if (!isLoaded) {
    return null; // 或者顯示加載中的組件
  }
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}; 