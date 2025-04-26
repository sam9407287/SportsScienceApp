import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import I18n from 'i18n-js';

// 導入翻譯文件
import en from './translations/en.json';
import zh from './translations/zh.json';

// 配置I18n
I18n.fallbacks = true;
I18n.translations = {
  en,
  zh
};

// 默認語言
I18n.defaultLocale = 'zh';
I18n.locale = 'zh';

// 初始化語言設置
export const initLanguage = async () => {
  try {
    // 嘗試從AsyncStorage中獲取保存的語言設置
    const savedLanguage = await AsyncStorage.getItem('appLanguage');
    
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'zh')) {
      I18n.locale = savedLanguage;
    } else {
      // 否則使用設備的默認語言
      const deviceLocale = Localization.locale.split('-')[0];
      I18n.locale = (deviceLocale === 'en' || deviceLocale === 'zh') ? deviceLocale : 'zh';
    }
  } catch (error) {
    console.error('初始化語言設置時出錯:', error);
    I18n.locale = 'zh'; // 出錯時默認使用中文
  }
};

// 切換語言的函數
export const changeLanguage = async (language) => {
  if (language !== 'en' && language !== 'zh') {
    console.warn('不支持的語言:', language);
    return false;
  }
  
  try {
    // 設置新語言
    I18n.locale = language;
    
    // 保存到 AsyncStorage
    await AsyncStorage.setItem('appLanguage', language);
    
    return true;
  } catch (error) {
    console.error('變更語言時出錯:', error);
    return false;
  }
};

// 獲取當前語言
export const getCurrentLanguage = () => {
  return I18n.locale || 'zh';
};

// 翻譯函數
export const t = (key, options = {}) => {
  if (!key) return '';
  
  try {
    return I18n.t(key, options);
  } catch (error) {
    console.warn(`翻譯錯誤，鍵: ${key}`, error);
    return key;
  }
};

// 判斷是否初始化完成
export const isI18nInitialized = () => {
  return !!I18n && !!I18n.translations;
};

export default I18n; 