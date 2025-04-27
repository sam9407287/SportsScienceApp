import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Platform,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';
import { t, getCurrentLanguage } from '../i18n';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LineChart } from 'react-native-chart-kit';

// 健康記錄的數據結構
const RECORD_STORAGE_KEY = 'healthRecords';

export default function HealthRecord({ onBack }) {
  const { isDarkMode } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('weight'); // 'weight' 或 'bodyFat'
  const [records, setRecords] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isChartModalVisible, setIsChartModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [note, setNote] = useState('');
  const [chartTimeRange, setChartTimeRange] = useState('30days'); // '30days', '90days', 'all'
  
  // 加載健康記錄數據
  useEffect(() => {
    loadRecords();
  }, []);
  
  // 從 AsyncStorage 加載記錄
  const loadRecords = async () => {
    try {
      const storedRecords = await AsyncStorage.getItem(RECORD_STORAGE_KEY);
      if (storedRecords !== null) {
        setRecords(JSON.parse(storedRecords).sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
    } catch (error) {
      console.error('Error loading health records:', error);
    }
  };
  
  // 保存記錄到 AsyncStorage
  const saveRecordsToStorage = async (updatedRecords) => {
    try {
      await AsyncStorage.setItem(RECORD_STORAGE_KEY, JSON.stringify(updatedRecords));
    } catch (error) {
      console.error('Error saving health records:', error);
    }
  };
  
  // 添加新記錄
  const addRecord = () => {
    // 基本驗證
    if (!weight && activeTab === 'weight') {
      Alert.alert(t('invalid_input'), t('enter_weight'));
      return;
    }
    if (!bodyFat && activeTab === 'bodyFat') {
      Alert.alert(t('invalid_input'), t('enter_body_fat'));
      return;
    }
    
    const newRecord = {
      id: Date.now().toString(),
      date: selectedDate.toISOString(),
      weight: weight ? parseFloat(weight) : null,
      bodyFat: bodyFat ? parseFloat(bodyFat) : null,
      note: note,
      createdAt: new Date().toISOString()
    };
    
    const updatedRecords = [...records, newRecord].sort((a, b) => new Date(b.date) - new Date(a.date));
    setRecords(updatedRecords);
    saveRecordsToStorage(updatedRecords);
    resetForm();
    setIsAddModalVisible(false);
    Alert.alert(t('record_saved'));
  };
  
  // 更新記錄
  const updateRecord = () => {
    if (!editingRecord) return;
    
    // 基本驗證
    if (!weight && activeTab === 'weight') {
      Alert.alert(t('invalid_input'), t('enter_weight'));
      return;
    }
    if (!bodyFat && activeTab === 'bodyFat') {
      Alert.alert(t('invalid_input'), t('enter_body_fat'));
      return;
    }
    
    const updatedRecords = records.map(record => {
      if (record.id === editingRecord.id) {
        return {
          ...record,
          date: selectedDate.toISOString(),
          weight: weight ? parseFloat(weight) : record.weight,
          bodyFat: bodyFat ? parseFloat(bodyFat) : record.bodyFat,
          note: note
        };
      }
      return record;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setRecords(updatedRecords);
    saveRecordsToStorage(updatedRecords);
    resetForm();
    setIsEditModalVisible(false);
    Alert.alert(t('record_saved'));
  };
  
  // 刪除記錄
  const deleteRecord = (recordId) => {
    Alert.alert(
      t('confirm_delete'),
      t('confirm_delete_message'),
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('delete_record'), 
          style: 'destructive',
          onPress: () => {
            const updatedRecords = records.filter(record => record.id !== recordId);
            setRecords(updatedRecords);
            saveRecordsToStorage(updatedRecords);
            Alert.alert(t('record_deleted'));
          }
        }
      ]
    );
  };
  
  // 編輯記錄
  const editRecord = (record) => {
    setEditingRecord(record);
    setSelectedDate(new Date(record.date));
    setWeight(record.weight ? record.weight.toString() : '');
    setBodyFat(record.bodyFat ? record.bodyFat.toString() : '');
    setNote(record.note || '');
    setIsEditModalVisible(true);
  };
  
  // 重置表單
  const resetForm = () => {
    setSelectedDate(new Date());
    setWeight('');
    setBodyFat('');
    setNote('');
    setEditingRecord(null);
  };
  
  // 處理日期變更
  const onDateChange = (event, selected) => {
    setShowDatePicker(false);
    if (selected) {
      setSelectedDate(selected);
    }
  };
  
  // 格式化日期顯示
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  // 獲取圖表數據
  const getChartData = () => {
    if (records.length === 0) return null;
    
    let filteredRecords = [...records];
    
    if (chartTimeRange === '30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filteredRecords = records.filter(record => new Date(record.date) >= thirtyDaysAgo);
    } else if (chartTimeRange === '90days') {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      filteredRecords = records.filter(record => new Date(record.date) >= ninetyDaysAgo);
    }
    
    // 按日期升序排序
    filteredRecords.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const labels = filteredRecords.map(record => formatDate(record.date));
    
    if (activeTab === 'weight') {
      const data = filteredRecords.map(record => record.weight || 0);
      return {
        labels,
        datasets: [{ data, color: (opacity = 1) => isDarkMode ? `rgba(102, 176, 255, ${opacity})` : `rgba(0, 128, 255, ${opacity})` }],
      };
    } else {
      const data = filteredRecords.map(record => record.bodyFat || 0);
      return {
        labels,
        datasets: [{ data, color: (opacity = 1) => isDarkMode ? `rgba(255, 102, 102, ${opacity})` : `rgba(255, 61, 61, ${opacity})` }],
      };
    }
  };
  
  // 獲取最新記錄
  const getRecentRecords = () => {
    return records.slice(0, 5);
  };
  
  return (
    <SafeAreaView style={[
      styles.container,
      isDarkMode ? styles.containerDark : styles.containerLight
    ]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* 標題欄 */}
      <View style={[
        styles.header,
        isDarkMode ? styles.headerDark : styles.headerLight
      ]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={isDarkMode ? '#ffffff' : '#000000'} 
          />
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle,
          isDarkMode ? styles.textDark : styles.textLight
        ]}>
          {t('health_record_title')}
        </Text>
        <View style={styles.emptyRight} />
      </View>
      
      {/* 標籤切換 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'weight' ? 
              (isDarkMode ? styles.activeTabDark : styles.activeTabLight) : 
              (isDarkMode ? styles.inactiveTabDark : styles.inactiveTabLight)
          ]}
          onPress={() => setActiveTab('weight')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'weight' ? 
              (isDarkMode ? styles.activeTextDark : styles.activeTextLight) : 
              (isDarkMode ? styles.inactiveTextDark : styles.inactiveTextLight)
          ]}>
            {t('weight_tracking')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'bodyFat' ? 
              (isDarkMode ? styles.activeTabDark : styles.activeTabLight) : 
              (isDarkMode ? styles.inactiveTabDark : styles.inactiveTabLight)
          ]}
          onPress={() => setActiveTab('bodyFat')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'bodyFat' ? 
              (isDarkMode ? styles.activeTextDark : styles.activeTextLight) : 
              (isDarkMode ? styles.inactiveTextDark : styles.inactiveTextLight)
          ]}>
            {t('body_fat_tracking')}
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 記錄統計摘要或趨勢提示 */}
        {/* 最近記錄 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[
              styles.sectionTitle,
              isDarkMode ? styles.textDark : styles.textLight
            ]}>
              {t('recent_records')}
            </Text>
            
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => setIsChartModalVisible(true)}
            >
              <Text style={[
                styles.viewAllText,
                isDarkMode ? styles.linkTextDark : styles.linkTextLight
              ]}>
                {t('view_chart')}
              </Text>
            </TouchableOpacity>
          </View>
          
          {records.length === 0 ? (
            <Text style={[
              styles.noRecordsText,
              isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
            ]}>
              {t('no_records')}
            </Text>
          ) : (
            getRecentRecords().map((record) => (
              <View 
                key={record.id}
                style={[
                  styles.recordItem,
                  isDarkMode ? styles.recordItemDark : styles.recordItemLight
                ]}
              >
                <View style={styles.recordDate}>
                  <Text style={[
                    styles.dateText,
                    isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
                  ]}>
                    {formatDate(record.date)}
                  </Text>
                </View>
                
                <View style={styles.recordDetails}>
                  {record.weight !== null && (
                    <Text style={[
                      styles.recordValue,
                      isDarkMode ? styles.textDark : styles.textLight
                    ]}>
                      {record.weight} kg
                    </Text>
                  )}
                  
                  {record.bodyFat !== null && (
                    <Text style={[
                      styles.recordValue,
                      isDarkMode ? styles.textDark : styles.textLight
                    ]}>
                      {record.bodyFat}%
                    </Text>
                  )}
                  
                  {record.note && (
                    <Text style={[
                      styles.recordNote,
                      isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
                    ]} numberOfLines={1}>
                      {record.note}
                    </Text>
                  )}
                </View>
                
                <View style={styles.recordActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => editRecord(record)}
                  >
                    <Ionicons 
                      name="pencil-outline" 
                      size={20} 
                      color={isDarkMode ? '#aaa' : '#666'} 
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteRecord(record.id)}
                  >
                    <Ionicons 
                      name="trash-outline" 
                      size={20} 
                      color={isDarkMode ? '#ff7070' : '#ff4d4d'} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      
      {/* 浮動添加按鈕 */}
      <TouchableOpacity
        style={[
          styles.addButton,
          isDarkMode ? styles.addButtonDark : styles.addButtonLight
        ]}
        onPress={() => {
          resetForm();
          setIsAddModalVisible(true);
        }}
      >
        <Ionicons name="add" size={24} color="#ffffff" />
      </TouchableOpacity>
      
      {/* 添加記錄模態框 */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={[
          styles.modalContainer,
          isDarkMode ? styles.modalContainerDark : styles.modalContainerLight
        ]}>
          <View style={[
            styles.modalContent,
            isDarkMode ? styles.modalContentDark : styles.modalContentLight
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                {t('add_new_record')}
              </Text>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsAddModalVisible(false)}
              >
                <Ionicons 
                  name="close" 
                  size={24} 
                  color={isDarkMode ? '#ffffff' : '#000000'} 
                />
              </TouchableOpacity>
            </View>
            
            <ScrollView
              style={styles.formContainer}
              contentContainerStyle={styles.formContent}
              showsVerticalScrollIndicator={false}
            >
              {/* 日期選擇器 */}
              <Text style={[
                styles.inputLabel,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                {t('date')}
              </Text>
              
              <TouchableOpacity
                style={[
                  styles.datePickerButton,
                  isDarkMode ? styles.inputDark : styles.inputLight
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[
                  styles.dateText,
                  isDarkMode ? styles.textDark : styles.textLight
                ]}>
                  {formatDate(selectedDate.toISOString())}
                </Text>
                <Ionicons 
                  name="calendar-outline" 
                  size={20} 
                  color={isDarkMode ? '#aaa' : '#666'} 
                />
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              )}
              
              {/* 體重輸入 */}
              <Text style={[
                styles.inputLabel,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                {t('weight_kg')}
              </Text>
              
              <TextInput
                style={[
                  styles.input,
                  isDarkMode ? styles.inputDark : styles.inputLight
                ]}
                value={weight}
                onChangeText={setWeight}
                placeholder={t('enter_weight')}
                placeholderTextColor={isDarkMode ? '#777' : '#999'}
                keyboardType="numeric"
              />
              
              {/* 體脂率輸入 */}
              <Text style={[
                styles.inputLabel,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                {t('body_fat_percentage')}
              </Text>
              
              <TextInput
                style={[
                  styles.input,
                  isDarkMode ? styles.inputDark : styles.inputLight
                ]}
                value={bodyFat}
                onChangeText={setBodyFat}
                placeholder={t('enter_body_fat')}
                placeholderTextColor={isDarkMode ? '#777' : '#999'}
                keyboardType="numeric"
              />
              
              {/* 備註輸入 */}
              <Text style={[
                styles.inputLabel,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                {t('optional_note')}
              </Text>
              
              <TextInput
                style={[
                  styles.input,
                  styles.noteInput,
                  isDarkMode ? styles.inputDark : styles.inputLight
                ]}
                value={note}
                onChangeText={setNote}
                placeholder={t('optional_note')}
                placeholderTextColor={isDarkMode ? '#777' : '#999'}
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
              />
              
              {/* 保存按鈕 */}
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  isDarkMode ? styles.saveButtonDark : styles.saveButtonLight
                ]}
                onPress={addRecord}
              >
                <Text style={styles.saveButtonText}>
                  {t('save')}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* 編輯記錄模態框 */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={[
          styles.modalContainer,
          isDarkMode ? styles.modalContainerDark : styles.modalContainerLight
        ]}>
          <View style={[
            styles.modalContent,
            isDarkMode ? styles.modalContentDark : styles.modalContentLight
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                {t('edit_record')}
              </Text>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Ionicons 
                  name="close" 
                  size={24} 
                  color={isDarkMode ? '#ffffff' : '#000000'} 
                />
              </TouchableOpacity>
            </View>
            
            <ScrollView
              style={styles.formContainer}
              contentContainerStyle={styles.formContent}
              showsVerticalScrollIndicator={false}
            >
              {/* 日期選擇器 */}
              <Text style={[
                styles.inputLabel,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                {t('date')}
              </Text>
              
              <TouchableOpacity
                style={[
                  styles.datePickerButton,
                  isDarkMode ? styles.inputDark : styles.inputLight
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[
                  styles.dateText,
                  isDarkMode ? styles.textDark : styles.textLight
                ]}>
                  {formatDate(selectedDate.toISOString())}
                </Text>
                <Ionicons 
                  name="calendar-outline" 
                  size={20} 
                  color={isDarkMode ? '#aaa' : '#666'} 
                />
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              )}
              
              {/* 體重輸入 */}
              <Text style={[
                styles.inputLabel,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                {t('weight_kg')}
              </Text>
              
              <TextInput
                style={[
                  styles.input,
                  isDarkMode ? styles.inputDark : styles.inputLight
                ]}
                value={weight}
                onChangeText={setWeight}
                placeholder={t('enter_weight')}
                placeholderTextColor={isDarkMode ? '#777' : '#999'}
                keyboardType="numeric"
              />
              
              {/* 體脂率輸入 */}
              <Text style={[
                styles.inputLabel,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                {t('body_fat_percentage')}
              </Text>
              
              <TextInput
                style={[
                  styles.input,
                  isDarkMode ? styles.inputDark : styles.inputLight
                ]}
                value={bodyFat}
                onChangeText={setBodyFat}
                placeholder={t('enter_body_fat')}
                placeholderTextColor={isDarkMode ? '#777' : '#999'}
                keyboardType="numeric"
              />
              
              {/* 備註輸入 */}
              <Text style={[
                styles.inputLabel,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                {t('optional_note')}
              </Text>
              
              <TextInput
                style={[
                  styles.input,
                  styles.noteInput,
                  isDarkMode ? styles.inputDark : styles.inputLight
                ]}
                value={note}
                onChangeText={setNote}
                placeholder={t('optional_note')}
                placeholderTextColor={isDarkMode ? '#777' : '#999'}
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
              />
              
              {/* 保存按鈕 */}
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  isDarkMode ? styles.saveButtonDark : styles.saveButtonLight
                ]}
                onPress={updateRecord}
              >
                <Text style={styles.saveButtonText}>
                  {t('save')}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* 圖表模態框 */}
      <Modal
        visible={isChartModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsChartModalVisible(false)}
      >
        <View style={[
          styles.modalContainer,
          isDarkMode ? styles.modalContainerDark : styles.modalContainerLight
        ]}>
          <View style={[
            styles.modalContent,
            styles.chartModalContent,
            isDarkMode ? styles.modalContentDark : styles.modalContentLight
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                {activeTab === 'weight' ? t('weight_tracking') : t('body_fat_tracking')}
              </Text>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsChartModalVisible(false)}
              >
                <Ionicons 
                  name="close" 
                  size={24} 
                  color={isDarkMode ? '#ffffff' : '#000000'} 
                />
              </TouchableOpacity>
            </View>
            
            {/* 時間範圍切換 */}
            <View style={styles.timeRangeContainer}>
              <Text style={[
                styles.timeRangeLabel,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                {t('time_period')}:
              </Text>
              
              <View style={styles.timeRangeButtons}>
                <TouchableOpacity
                  style={[
                    styles.timeRangeButton,
                    chartTimeRange === '30days' ? styles.timeRangeButtonActive : null,
                    isDarkMode && chartTimeRange === '30days' ? styles.timeRangeButtonActiveDark : null
                  ]}
                  onPress={() => setChartTimeRange('30days')}
                >
                  <Text style={[
                    styles.timeRangeButtonText,
                    chartTimeRange === '30days' ? 
                      (isDarkMode ? styles.timeRangeTextActiveDark : styles.timeRangeTextActive) : 
                      (isDarkMode ? styles.textDark : styles.textLight)
                  ]}>
                    {t('last_30_days')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.timeRangeButton,
                    chartTimeRange === '90days' ? styles.timeRangeButtonActive : null,
                    isDarkMode && chartTimeRange === '90days' ? styles.timeRangeButtonActiveDark : null
                  ]}
                  onPress={() => setChartTimeRange('90days')}
                >
                  <Text style={[
                    styles.timeRangeButtonText,
                    chartTimeRange === '90days' ? 
                      (isDarkMode ? styles.timeRangeTextActiveDark : styles.timeRangeTextActive) : 
                      (isDarkMode ? styles.textDark : styles.textLight)
                  ]}>
                    {t('last_90_days')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.timeRangeButton,
                    chartTimeRange === 'all' ? styles.timeRangeButtonActive : null,
                    isDarkMode && chartTimeRange === 'all' ? styles.timeRangeButtonActiveDark : null
                  ]}
                  onPress={() => setChartTimeRange('all')}
                >
                  <Text style={[
                    styles.timeRangeButtonText,
                    chartTimeRange === 'all' ? 
                      (isDarkMode ? styles.timeRangeTextActiveDark : styles.timeRangeTextActive) : 
                      (isDarkMode ? styles.textDark : styles.textLight)
                  ]}>
                    {t('all_time')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* 圖表 */}
            <ScrollView
              horizontal
              style={styles.chartContainer}
              contentContainerStyle={styles.chartContent}
              showsHorizontalScrollIndicator={false}
            >
              {records.length > 0 ? (
                <LineChart
                  data={getChartData()}
                  width={Math.max(Dimensions.get('window').width - 40, records.length * 50)}
                  height={220}
                  chartConfig={{
                    backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
                    backgroundGradientFrom: isDarkMode ? '#1e1e1e' : '#ffffff',
                    backgroundGradientTo: isDarkMode ? '#1e1e1e' : '#ffffff',
                    decimalPlaces: activeTab === 'weight' ? 1 : 1,
                    color: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16
                    },
                    propsForDots: {
                      r: '6',
                      strokeWidth: '2',
                      stroke: isDarkMode ? '#444' : '#fafafa'
                    }
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16
                  }}
                />
              ) : (
                <View style={styles.noChartDataContainer}>
                  <Text style={[
                    styles.noChartDataText,
                    isDarkMode ? styles.textDark : styles.textLight
                  ]}>
                    {t('no_records')}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#f8f9fa',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerLight: {
    backgroundColor: '#fff',
    borderBottomColor: '#e0e0e0',
  },
  headerDark: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  emptyRight: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontWeight: '500',
  },
  activeTabLight: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inactiveTabLight: {
    backgroundColor: '#f0f0f0',
  },
  activeTabDark: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#444',
  },
  inactiveTabDark: {
    backgroundColor: '#1a1a1a',
  },
  activeTextLight: {
    color: '#9775FA',
  },
  inactiveTextLight: {
    color: '#888',
  },
  activeTextDark: {
    color: '#9d6dde',
  },
  inactiveTextDark: {
    color: '#aaa',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAllButton: {
    padding: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  linkTextLight: {
    color: '#9775FA',
  },
  linkTextDark: {
    color: '#9d6dde',
  },
  textLight: {
    color: '#333',
  },
  textDark: {
    color: '#fff',
  },
  textLightSecondary: {
    color: '#666',
  },
  textDarkSecondary: {
    color: '#aaa',
  },
  noRecordsText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 30,
    fontStyle: 'italic',
  },
  recordItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recordItemLight: {
    backgroundColor: '#fff',
  },
  recordItemDark: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
  },
  recordDate: {
    width: 80,
  },
  dateText: {
    fontSize: 14,
  },
  recordDetails: {
    flex: 1,
    marginLeft: 8,
  },
  recordValue: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  recordNote: {
    fontSize: 14,
    marginTop: 4,
  },
  recordActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonLight: {
    backgroundColor: '#9775FA',
  },
  addButtonDark: {
    backgroundColor: '#9d6dde',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainerLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainerDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  chartModalContent: {
    paddingBottom: 20,
  },
  modalContentLight: {
    backgroundColor: '#fff',
  },
  modalContentDark: {
    backgroundColor: '#1e1e1e',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalHeaderLight: {
    borderBottomColor: '#eee',
  },
  modalHeaderDark: {
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    padding: 16,
    paddingBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  noteInput: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  inputLight: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    color: '#333',
  },
  inputDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
    color: '#fff',
  },
  datePickerButton: {
    height: 50,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  saveButton: {
    height: 50,
    borderRadius: 8,
    marginTop: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonLight: {
    backgroundColor: '#9775FA',
  },
  saveButtonDark: {
    backgroundColor: '#9d6dde',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  timeRangeLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 12,
  },
  timeRangeButtons: {
    flexDirection: 'row',
    flex: 1,
  },
  timeRangeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  timeRangeButtonActive: {
    backgroundColor: '#9775FA20',
  },
  timeRangeButtonActiveDark: {
    backgroundColor: '#9d6dde30',
  },
  timeRangeButtonText: {
    fontSize: 14,
  },
  timeRangeTextActive: {
    color: '#9775FA',
    fontWeight: '500',
  },
  timeRangeTextActiveDark: {
    color: '#9d6dde',
    fontWeight: '500',
  },
  chartContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  chartContent: {
    paddingRight: 20,
    alignItems: 'center',
  },
  noChartDataContainer: {
    height: 220,
    width: Dimensions.get('window').width - 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noChartDataText: {
    fontSize: 16,
    fontStyle: 'italic',
  }
}); 