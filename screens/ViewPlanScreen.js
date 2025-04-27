import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { t } from '../i18n';

// 訓練週期圖標
const cycleIcons = {
  base: 'trending-up',
  intensity: 'trending-up',
  recovery: 'trending-down'
};

export default function ViewPlanScreen({ plan, onBack, onEdit, onDelete }) {
  const { isDarkMode } = useContext(ThemeContext);
  const [expandedCycles, setExpandedCycles] = useState({});
  const [expandedWeeks, setExpandedWeeks] = useState({});
  
  // 獲取目標名稱
  const getGoalName = (goalId) => {
    const goals = {
      'marathon': t('marathon'),
      'triathlon': t('triathlon'),
      'strength': t('strength'),
      'fatLoss': t('fat_loss'),
      'crossfit': t('crossfit'),
      'custom': t('custom_plan')
    };
    return goals[goalId] || t('custom_plan');
  };
  
  // 獲取強度等級名稱
  const getIntensityName = (level) => {
    const levels = {
      'beginner': t('beginner'),
      'intermediate': t('intermediate'),
      'advanced': t('advanced')
    };
    return levels[level] || t('intermediate');
  };
  
  // 切換展開/收起中週期
  const toggleCycle = (cycleId) => {
    setExpandedCycles(prev => ({
      ...prev,
      [cycleId]: !prev[cycleId]
    }));
  };
  
  // 切換展開/收起週
  const toggleWeek = (weekId) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekId]: !prev[weekId]
    }));
  };
  
  // 渲染訓練日
  const renderWorkout = (workout) => {
    return (
      <View
        key={workout.id}
        style={[
          styles.workoutItem,
          isDarkMode ? styles.workoutItemDark : styles.workoutItemLight
        ]}
      >
        <View style={styles.workoutHeader}>
          <Text style={[
            styles.workoutTitle,
            isDarkMode ? styles.textDark : styles.textLight
          ]}>
            {workout.name}
          </Text>
          {workout.completed ? (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>完成</Text>
            </View>
          ) : null}
        </View>
        
        {workout.exercises && workout.exercises.length > 0 ? (
          <View style={styles.exercisesList}>
            {workout.exercises.map((exercise, index) => (
              <View 
                key={index} 
                style={[
                  styles.exerciseItem,
                  isDarkMode ? styles.exerciseItemDark : styles.exerciseItemLight
                ]}
              >
                <View style={styles.exerciseHeader}>
                  <Text style={[
                    styles.exerciseName,
                    isDarkMode ? styles.textDark : styles.textLight
                  ]}>
                    {exercise.name}
                  </Text>
                  {exercise.type ? (
                    <Text style={[
                      styles.exerciseType,
                      isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
                    ]}>
                      {exercise.type}
                    </Text>
                  ) : null}
                </View>
                
                <View style={styles.exerciseDetails}>
                  {exercise.sets ? (
                    <Text style={[
                      styles.exerciseDetail,
                      isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
                    ]}>
                      {exercise.sets} 組 x {exercise.reps || '-'} 次
                    </Text>
                  ) : null}
                  
                  {exercise.weight ? (
                    <Text style={[
                      styles.exerciseDetail,
                      isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
                    ]}>
                      {exercise.weight} kg
                    </Text>
                  ) : null}
                  
                  {exercise.distance ? (
                    <Text style={[
                      styles.exerciseDetail,
                      isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
                    ]}>
                      {exercise.distance} {exercise.distanceUnit || 'km'}
                    </Text>
                  ) : null}
                  
                  {exercise.time ? (
                    <Text style={[
                      styles.exerciseDetail,
                      isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
                    ]}>
                      {exercise.time} {exercise.timeUnit || 'min'}
                    </Text>
                  ) : null}
                  
                  {exercise.rest ? (
                    <Text style={[
                      styles.exerciseDetail,
                      isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
                    ]}>
                      休息: {exercise.rest} {exercise.restUnit || 'sec'}
                    </Text>
                  ) : null}
                </View>
                
                {exercise.notes ? (
                  <Text style={[
                    styles.exerciseNotes,
                    isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
                  ]}>
                    備註: {exercise.notes}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : (
          <Text style={[
            styles.noExercisesText,
            isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
          ]}>
            點擊編輯計劃來添加訓練內容
          </Text>
        )}
      </View>
    );
  };
  
  // 渲染訓練週
  const renderWeek = (week, index) => {
    const isExpanded = expandedWeeks[week.id] ?? false;
    
    return (
      <View
        key={week.id}
        style={[
          styles.weekItem,
          isDarkMode ? styles.weekItemDark : styles.weekItemLight
        ]}
      >
        <TouchableOpacity
          style={styles.weekHeader}
          onPress={() => toggleWeek(week.id)}
        >
          <View style={styles.weekTitleContainer}>
            <Text style={[
              styles.weekTitle,
              isDarkMode ? styles.textDark : styles.textLight
            ]}>
              {week.name || `${t('week')} ${index + 1}`}
            </Text>
            <Text style={[
              styles.workoutCount,
              isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
            ]}>
              {week.workouts ? `${week.workouts.length} ${t('training_day')}` : ''}
            </Text>
          </View>
          
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={isDarkMode ? '#fff' : '#000'}
          />
        </TouchableOpacity>
        
        {isExpanded && week.workouts && (
          <View style={styles.workoutsList}>
            {week.workouts.map(workout => renderWorkout(workout))}
          </View>
        )}
      </View>
    );
  };
  
  // 渲染週期
  const renderCycle = (cycle, index) => {
    const isExpanded = expandedCycles[cycle.id] ?? false;
    
    return (
      <View
        key={cycle.id}
        style={[
          styles.cycleItem,
          isDarkMode ? styles.cycleItemDark : styles.cycleItemLight
        ]}
      >
        <TouchableOpacity
          style={styles.cycleHeader}
          onPress={() => toggleCycle(cycle.id)}
        >
          <View style={styles.cycleTitleContainer}>
            <MaterialCommunityIcons
              name={cycleIcons[cycle.type] || 'calendar-month'}
              size={20}
              color={isDarkMode ? '#fff' : '#000'}
              style={styles.cycleIcon}
            />
            <Text style={[
              styles.cycleTitle,
              isDarkMode ? styles.textDark : styles.textLight
            ]}>
              {cycle.name || `${t('meso_cycle')} ${index + 1}`}
            </Text>
          </View>
          
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={isDarkMode ? '#fff' : '#000'}
          />
        </TouchableOpacity>
        
        {isExpanded && cycle.weeks && (
          <View style={styles.weeksList}>
            {cycle.weeks.map((week, index) => renderWeek(week, index))}
          </View>
        )}
      </View>
    );
  };
  
  // 渲染無週期的計劃
  const renderSimplePlan = () => {
    return (
      <View style={styles.weeksContainer}>
        {plan.cycles.weeks.map((week, index) => renderWeek(week, index))}
      </View>
    );
  };
  
  // 渲染有週期的計劃
  const renderPeriodizedPlan = () => {
    return (
      <View style={styles.cyclesContainer}>
        {plan.cycles.mesoCycles.map((cycle, index) => renderCycle(cycle, index))}
      </View>
    );
  };
  
  return (
    <ScrollView
      style={[
        styles.container,
        isDarkMode ? styles.containerDark : styles.containerLight
      ]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDarkMode ? '#fff' : '#000'}
          />
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle,
          isDarkMode ? styles.textDark : styles.textLight
        ]}>
          訓練計劃詳情
        </Text>
      </View>
      
      <View style={styles.planHeader}>
        <Text style={[
          styles.planTitle,
          isDarkMode ? styles.textDark : styles.textLight
        ]}>
          {plan.name}
        </Text>
        
        <View style={styles.planActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              isDarkMode ? styles.buttonDark : styles.buttonLight
            ]}
            onPress={() => onEdit(plan)}
          >
            <Ionicons
              name="pencil"
              size={16}
              color={isDarkMode ? '#fff' : '#007bff'}
            />
            <Text style={[
              styles.actionButtonText,
              { color: isDarkMode ? '#fff' : '#007bff' }
            ]}>
              {t('edit_plan')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.deleteButton,
              isDarkMode ? styles.deleteButtonDark : styles.deleteButtonLight
            ]}
            onPress={() => onDelete(plan.id)}
          >
            <Ionicons
              name="trash-outline"
              size={16}
              color={isDarkMode ? '#fff' : '#dc3545'}
            />
            <Text style={[
              styles.actionButtonText,
              { color: isDarkMode ? '#fff' : '#dc3545' }
            ]}>
              {t('delete_plan')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.planInfoContainer}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={[
              styles.infoLabel,
              isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
            ]}>
              {t('goal')}:
            </Text>
            <Text style={[
              styles.infoValue,
              isDarkMode ? styles.textDark : styles.textLight
            ]}>
              {getGoalName(plan.goalType)}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={[
              styles.infoLabel,
              isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
            ]}>
              {t('plan_duration')}:
            </Text>
            <Text style={[
              styles.infoValue,
              isDarkMode ? styles.textDark : styles.textLight
            ]}>
              {plan.duration} {t('week')}
            </Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={[
              styles.infoLabel,
              isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
            ]}>
              {t('training_frequency')}:
            </Text>
            <Text style={[
              styles.infoValue,
              isDarkMode ? styles.textDark : styles.textLight
            ]}>
              {plan.frequency} {t('training_day')}/週
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={[
              styles.infoLabel,
              isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
            ]}>
              {t('training_intensity')}:
            </Text>
            <Text style={[
              styles.infoValue,
              isDarkMode ? styles.textDark : styles.textLight
            ]}>
              {getIntensityName(plan.intensityLevel)}
            </Text>
          </View>
        </View>
        
        {plan.notes && (
          <View style={styles.notesContainer}>
            <Text style={[
              styles.notesLabel,
              isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
            ]}>
              {t('plan_notes')}:
            </Text>
            <Text style={[
              styles.notesText,
              isDarkMode ? styles.textDark : styles.textLight
            ]}>
              {plan.notes}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.planContentContainer}>
        <Text style={[
          styles.contentTitle,
          isDarkMode ? styles.textDark : styles.textLight
        ]}>
          {plan.useCycles ? t('cycles') : t('training_plan')}
        </Text>
        
        {plan.cycles.type === 'periodized' ? renderPeriodizedPlan() : renderSimplePlan()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  containerLight: {
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  textDark: {
    color: '#ffffff',
  },
  textLight: {
    color: '#000000',
  },
  textDarkSecondary: {
    color: '#aaaaaa',
  },
  textLightSecondary: {
    color: '#666666',
  },
  planHeader: {
    marginBottom: 16,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  planActions: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 12,
  },
  buttonDark: {
    backgroundColor: '#333333',
    borderColor: '#555555',
    borderWidth: 1,
  },
  buttonLight: {
    backgroundColor: '#ffffff',
    borderColor: '#dddddd',
    borderWidth: 1,
  },
  deleteButton: {},
  deleteButtonDark: {
    backgroundColor: '#4a1212',
    borderColor: '#6b1b1b',
    borderWidth: 1,
  },
  deleteButtonLight: {
    backgroundColor: '#fee',
    borderColor: '#fcc',
    borderWidth: 1,
  },
  actionButtonText: {
    fontWeight: '500',
    marginLeft: 6,
  },
  planInfoContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: 'rgba(100, 100, 255, 0.05)',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 15,
    lineHeight: 20,
  },
  planContentContainer: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  cyclesContainer: {},
  cycleItem: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cycleItemDark: {
    backgroundColor: '#222222',
  },
  cycleItemLight: {
    backgroundColor: '#ffffff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cycleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  cycleTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cycleIcon: {
    marginRight: 8,
  },
  cycleTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  weeksList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  weeksContainer: {},
  weekItem: {
    marginBottom: 12,
    borderRadius: 10,
    overflow: 'hidden',
  },
  weekItemDark: {
    backgroundColor: '#2a2a2a',
  },
  weekItemLight: {
    backgroundColor: '#f5f5f5',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  weekTitleContainer: {
    flex: 1,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  workoutCount: {
    fontSize: 12,
    marginTop: 4,
  },
  workoutsList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
    padding: 8,
  },
  workoutItem: {
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
  },
  workoutItemDark: {
    backgroundColor: '#333333',
  },
  workoutItemLight: {
    backgroundColor: '#ffffff',
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  completedBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  completedText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  exercisesList: {},
  exerciseItem: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
  },
  exerciseItemDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  exerciseItemLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '500',
  },
  exerciseType: {
    fontSize: 12,
  },
  exerciseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  exerciseDetail: {
    fontSize: 12,
    marginRight: 8,
  },
  exerciseNotes: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  noExercisesText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  }
}); 