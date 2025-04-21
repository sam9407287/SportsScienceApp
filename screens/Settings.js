import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView
} from 'react-native';

export default function Settings({ onBack, currentTheme, onThemeChange }) {
  // 主題選項
  const themeOptions = [
    { id: 'sport', label: '運動科技風', description: '深色背景，鮮明對比，現代感設計' },
    { id: 'minimal', label: '極簡清新風', description: '淺色背景，簡約設計，輕盈舒適' },
    { id: 'professional', label: '運動專業風', description: '藍色專業色調，資訊清晰，表格式佈局' },
  ];

  // 設定主題
  const handleThemeSelect = (themeId) => {
    onThemeChange(themeId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>設置</Text>
        <View style={styles.placeholder}></View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>界面風格</Text>
          <Text style={styles.sectionDescription}>選擇喜歡的界面風格</Text>
          
          {themeOptions.map((theme) => (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.themeOption,
                currentTheme === theme.id && styles.selectedThemeOption
              ]}
              onPress={() => handleThemeSelect(theme.id)}
            >
              <View style={styles.themeInfo}>
                <Text style={styles.themeTitle}>{theme.label}</Text>
                <Text style={styles.themeDescription}>{theme.description}</Text>
              </View>
              {currentTheme === theme.id && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  headerText: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
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
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedThemeOption: {
    borderColor: '#4a90e2',
    backgroundColor: '#f0f7ff',
  },
  themeInfo: {
    flex: 1,
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 14,
    color: '#666',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  checkmarkText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 