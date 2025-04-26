import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  Alert,
  StatusBar,
  Switch,
  useColorScheme
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { t, changeLanguage, getCurrentLanguage, isI18nInitialized } from '../i18n';
import { ThemeContext } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function Settings({ onBack }) {
  const [currentLanguage, setCurrentLanguage] = useState('zh');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  
  // 獲取當前語言
  useEffect(() => {
    try {
      const lang = getCurrentLanguage();
      if (lang) {
        setCurrentLanguage(lang);
      }
    } catch (error) {
      console.error('Unable to get current language:', error);
    }
  }, []);
  
  // 獲取語言選項
  const languageOptions = [
    { id: 'zh', label: '中文' },
    { id: 'en', label: 'English' }
  ];
  
  // 切換語言
  const handleLanguageSelect = async (langId) => {
    if (langId !== currentLanguage && !isRefreshing) {
      setIsRefreshing(true);
      try {
        // 更新本地狀態
        setCurrentLanguage(langId);
        
        // 呼叫切換語言函數
        const success = await changeLanguage(langId);
        
        if (success) {
          // 提示用戶需要刷新應用
          Alert.alert(
            '語言已更改',
            '請重新啟動應用以完全應用新語言設置',
            [{ text: '確定', onPress: () => onBack() }]
          );
        } else {
          // 恢復到原始語言
          setCurrentLanguage(currentLanguage);
          Alert.alert('錯誤', '切換語言失敗');
        }
      } catch (error) {
        // 恢復到原始語言
        setCurrentLanguage(currentLanguage);
        console.error('Language change error:', error);
        Alert.alert('錯誤', '切換語言時發生錯誤');
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={isDarkMode ? '#121212' : '#ffffff'} 
      />
      
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, isDarkMode && styles.textDark]}>
            {isI18nInitialized() ? t('back') : '返回'}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerText, isDarkMode && styles.textDark]}>
          {isI18nInitialized() ? t('settings') : '設置'}
        </Text>
        <View style={styles.placeholder}></View>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
            {isI18nInitialized() ? t('appearance') : '外觀'}
          </Text>
          <Text style={[styles.sectionDescription, isDarkMode && styles.textSecondaryDark]}>
            {isI18nInitialized() ? t('select_appearance_mode') : '選擇顯示模式'}
          </Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, isDarkMode && styles.textDark]}>
                {isI18nInitialized() ? t('dark_mode') : '深色模式'}
              </Text>
              <Text style={[styles.settingDescription, isDarkMode && styles.textSecondaryDark]}>
                {isI18nInitialized() ? t('dark_mode_desc') : '適合夜間使用，減少眼睛疲勞'}
              </Text>
            </View>
            <View style={styles.themeControlContainer}>
              <View style={[
                styles.iconContainer, 
                isDarkMode ? styles.iconContainerDark : styles.iconContainerLight
              ]}>
                <Ionicons 
                  name={isDarkMode ? "moon" : "sunny"} 
                  size={22} 
                  color={isDarkMode ? "#9d6dde" : "#ffc93c"} 
                />
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#e0e0e0', true: isDarkMode ? 'rgba(157, 109, 222, 0.3)' : 'rgba(255, 201, 60, 0.3)' }}
                thumbColor={isDarkMode ? '#9d6dde' : '#ffc93c'}
                ios_backgroundColor="#e0e0e0"
                style={styles.themeSwitch}
              />
            </View>
          </View>
        </View>
        
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
            {isI18nInitialized() ? t('language') : '語言'}
          </Text>
          <Text style={[styles.sectionDescription, isDarkMode && styles.textSecondaryDark]}>
            {isI18nInitialized() ? t('select_language') : '選擇您喜歡的語言'}
          </Text>
          
          {languageOptions.map((lang) => (
            <TouchableOpacity
              key={lang.id}
              style={[
                styles.languageOption,
                isDarkMode && styles.languageOptionDark,
                currentLanguage === lang.id && (isDarkMode ? styles.selectedOptionDark : styles.selectedOption)
              ]}
              onPress={() => handleLanguageSelect(lang.id)}
              disabled={isRefreshing}
            >
              <View style={styles.languageInfo}>
                <Text style={[styles.languageTitle, isDarkMode && styles.textDark]}>{lang.label}</Text>
              </View>
              {currentLanguage === lang.id && (
                <View style={isDarkMode ? styles.checkmarkDark : styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
            {isI18nInitialized() ? t('about') : '關於'}
          </Text>
          <Text style={[styles.sectionDescription, isDarkMode && styles.textSecondaryDark]}>
            {isI18nInitialized() ? t('app_info') : '應用程式資訊'}
          </Text>
          
          <View style={[styles.infoCard, isDarkMode && styles.infoCardDark]}>
            <Text style={[styles.infoTitle, isDarkMode && styles.textDark]}>
              {isI18nInitialized() ? t('app_title') : '運動科學平台'}
            </Text>
            <Text style={[styles.infoVersion, isDarkMode && styles.textSecondaryDark]}>v1.0.0</Text>
            <Text style={[styles.infoCopyright, isDarkMode && styles.textSecondaryDark]}>
              © {new Date().getFullYear()} {isI18nInitialized() ? t('company_name') : '運動科學技術有限公司'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerDark: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  textDark: {
    color: '#fff',
  },
  textSecondaryDark: {
    color: '#aaa',
  },
  headerText: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionDark: {
    backgroundColor: '#1e1e1e',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    borderColor: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    marginBottom: 12,
  },
  languageOptionDark: {
    borderColor: '#333',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  selectedOptionDark: {
    borderColor: '#4361ee',
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
  },
  languageInfo: {
    flex: 1,
  },
  languageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkDark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4361ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },
  infoCardDark: {
    backgroundColor: '#252525',
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  infoVersion: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  infoCopyright: {
    fontSize: 14,
    color: '#888',
  },
  themeControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerLight: {
    backgroundColor: 'rgba(255, 201, 60, 0.15)',
  },
  iconContainerDark: {
    backgroundColor: 'rgba(157, 109, 222, 0.15)',
  },
  themeSwitch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
}); 