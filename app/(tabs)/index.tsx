import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { Play, Pause, Square, RotateCcw, ChevronDown } from 'lucide-react-native';

// Safe web utilities for iOS compatibility
const isWeb = Platform.OS === 'web';
const safeWindow = isWeb && typeof window !== 'undefined' ? window : null;

// Environment-based logging for iOS deployment
const isDevelopment = __DEV__;
const log = (message: string, data?: any) => {
  if (isDevelopment) {
    console.log(message, data);
  }
};

type TimerMode = 'countUp' | 'countDown';
type TimerState = 'stopped' | 'running' | 'paused';

export default function TimerScreen() {
  const [mode, setMode] = useState<TimerMode>('countUp');
  const [state, setState] = useState<TimerState>('stopped');
  const [currentTime, setCurrentTime] = useState(0); // in seconds
  const [inputTime, setInputTime] = useState('5:00'); // input for countdown
  const [startTime, setStartTime] = useState(0);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (state === 'running') {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (mode === 'countUp') {
            return prev + 1;
          } else {
            const newTime = prev - 1;
            if (newTime <= 0) {
              setState('stopped');
              if (Platform.OS !== 'web') {
                Alert.alert('Timer Finished', 'Countdown has reached zero!');
              }
              return 0;
            }
            return newTime;
          }
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state, mode]);

  // Handle orientation changes
  useEffect(() => {
    const updateOrientation = () => {
      const { width, height } = Dimensions.get('window');
      setDimensions(Dimensions.get('window'));
      
      // Force portrait mode on web for now
      let newIsLandscape = false;
      if (Platform.OS === 'web') {
        // On web, always start in portrait mode
        newIsLandscape = false;
        log('Web detected - forcing portrait mode');
      } else {
        // For mobile, use the standard width > height check
        newIsLandscape = width > height;
      }
      
      console.log('Orientation update:', { 
        width, 
        height, 
        isLandscape: newIsLandscape, 
        platform: Platform.OS,
        webWidth: isWeb && safeWindow ? safeWindow.innerWidth : 'N/A',
        webHeight: isWeb && safeWindow ? safeWindow.innerHeight : 'N/A'
      });
      setIsLandscape(newIsLandscape);
    };

    // Set initial orientation
    updateOrientation();

    // Listen for orientation changes
    const subscription = Dimensions.addEventListener('change', updateOrientation);

    // For web, also listen to window resize events
    if (isWeb && safeWindow) {
      const handleResize = () => {
        log('Web window resized');
        setTimeout(updateOrientation, 100);
      };
      safeWindow.addEventListener('resize', handleResize);
      
      return () => {
        subscription?.remove();
        safeWindow.removeEventListener('resize', handleResize);
      };
    }

    return () => {
      subscription?.remove();
    };
  }, []);

  const parseTimeInput = (input: string): number => {
    const parts = input.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10) || 0;
      const seconds = parseInt(parts[1], 10) || 0;
      return minutes * 60 + seconds;
    }
    return parseInt(input, 10) || 0;
  };

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (state === 'stopped') {
      if (mode === 'countDown') {
        const time = parseTimeInput(inputTime);
        if (time <= 0) {
          Alert.alert('Invalid Time', 'Please enter a valid time for countdown.');
          return;
        }
        setCurrentTime(time);
        setStartTime(time);
      } else {
        setCurrentTime(0);
        setStartTime(0);
      }
    }
    setState('running');
  };

  const handlePause = () => {
    setState(state === 'running' ? 'paused' : 'running');
  };

  const handleStop = () => {
    setState('stopped');
    if (mode === 'countDown') {
      setCurrentTime(startTime);
    } else {
      setCurrentTime(0);
    }
  };

  const handleReset = () => {
    setState('stopped');
    if (mode === 'countDown') {
      const time = parseTimeInput(inputTime);
      setCurrentTime(time);
      setStartTime(time);
    } else {
      setCurrentTime(0);
      setStartTime(0);
    }
  };

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setState('stopped');
    if (newMode === 'countDown') {
      const time = parseTimeInput(inputTime);
      setCurrentTime(time);
      setStartTime(time);
    } else {
      setCurrentTime(0);
      setStartTime(0);
    }
  };

  // Force portrait mode on web
  const effectiveIsLandscape = Platform.OS === 'web' ? false : isLandscape;

  return (
    <View style={[styles.container, effectiveIsLandscape && styles.containerLandscape]}>
      {!effectiveIsLandscape ? (
        // Portrait mode - full interface
        <>
                <View style={styles.header}>
        <Text style={styles.title}>Timer</Text>
                  <TouchableOpacity 
            style={styles.debugButton} 
            onPress={() => {
              const { width, height } = Dimensions.get('window');
              const newIsLandscape = width > height;
              log('Manual check:', { width, height, isLandscape: newIsLandscape, currentState: isLandscape, effective: effectiveIsLandscape });
              setIsLandscape(newIsLandscape);
            }}
          >
            <Text style={styles.debugButtonText}>Debug: {effectiveIsLandscape ? 'Landscape' : 'Portrait'} (Web: {Platform.OS === 'web' ? 'Yes' : 'No'})</Text>
          </TouchableOpacity>
      </View>

          <View style={styles.modeContainer}>
            <Text style={styles.label}>Mode:</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowModeDropdown(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownButtonText}>
                {mode === 'countUp' ? 'Count Up' : 'Count Down'}
              </Text>
              <ChevronDown size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {mode === 'countDown' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Set Time (MM:SS):</Text>
              <TextInput
                style={styles.timeInput}
                value={inputTime}
                onChangeText={setInputTime}
                placeholder="5:00"
                editable={state === 'stopped'}
              />
            </View>
          )}

          <View style={styles.timerContainer}>
            <Text style={styles.timerDisplay}>{formatTime(currentTime)}</Text>
          </View>

          <View style={styles.controlsContainer}>
            {state === 'stopped' ? (
              <TouchableOpacity style={styles.primaryButton} onPress={handleStart}>
                <Play size={24} color="white" />
                <Text style={styles.primaryButtonText}>Start</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.primaryButton} onPress={handlePause}>
                {state === 'running' ? (
                  <Pause size={24} color="white" />
                ) : (
                  <Play size={24} color="white" />
                )}
                <Text style={styles.primaryButtonText}>
                  {state === 'running' ? 'Pause' : 'Resume'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.secondaryButton} onPress={handleStop}>
              <Square size={20} color="#FF3B30" />
              <Text style={styles.secondaryButtonText}>Stop</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleReset}>
              <RotateCcw size={20} color="#007AFF" />
              <Text style={styles.secondaryButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        // Landscape mode - full screen timer
        <TouchableOpacity
          style={styles.landscapeContainer}
          activeOpacity={1}
          onPress={() => {
            if (state === 'running') {
              handlePause();
            } else if (state === 'paused') {
              handlePause();
            }
          }}
        >
          <View style={styles.landscapeTimerContainer}>
            <Text style={styles.landscapeTimerDisplay}>{formatTime(currentTime)}</Text>
            {state === 'running' && (
              <Text style={styles.landscapeTapHint}>Tap anywhere to pause</Text>
            )}
            {state === 'paused' && (
              <Text style={styles.landscapeTapHint}>Tap anywhere to resume</Text>
            )}
          </View>
        </TouchableOpacity>
      )}

      <Modal
        visible={showModeDropdown && !effectiveIsLandscape}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModeDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModeDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <TouchableOpacity
              style={[
                styles.dropdownOption,
                mode === 'countUp' && styles.dropdownOptionSelected
              ]}
              onPress={() => {
                handleModeChange('countUp');
                setShowModeDropdown(false);
              }}
            >
              <Text style={[
                styles.dropdownOptionText,
                mode === 'countUp' && styles.dropdownOptionTextSelected
              ]}>
                Count Up
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.dropdownOption,
                mode === 'countDown' && styles.dropdownOptionSelected
              ]}
              onPress={() => {
                handleModeChange('countDown');
                setShowModeDropdown(false);
              }}
            >
              <Text style={[
                styles.dropdownOptionText,
                mode === 'countDown' && styles.dropdownOptionTextSelected
              ]}>
                Count Down
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    ...Platform.select({
      ios: {
        paddingBottom: 20,
      },
    }),
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  debugButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  debugButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modeContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  dropdownButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#1D1D1F',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 200,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  dropdownOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownOptionSelected: {
    backgroundColor: '#F0F8FF',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#1D1D1F',
    textAlign: 'center',
  },
  dropdownOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  containerLandscape: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  landscapeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  landscapeTimerContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  landscapeTimerDisplay: {
    fontSize: 240,
    fontWeight: '500',
    color: '#007AFF',
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      web: 'Monaco, Consolas, monospace',
    }),
    textAlign: 'center',
  },
  landscapeTimerMode: {
    fontSize: 24,
    color: '#8E8E93',
    marginTop: 16,
  },
  landscapeTapHint: {
    fontSize: 18,
    color: '#8E8E93',
    marginTop: 20,
    textAlign: 'center',
    opacity: 0.8,
  },

  inputContainer: {
    marginHorizontal: 20,
    marginBottom: 40,
  },
  timeInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1D1D1F',
    textAlign: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        zIndex: 1,
      },
    }),
  },
  timerDisplay: {
    fontSize: 40,
    fontWeight: '300',
    color: '#007AFF',
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      web: 'Monaco, Consolas, monospace',
    }),
    textAlign: 'center',
  },
  timerMode: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 8,
  },
  controlsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  secondaryButtonText: {
    color: '#1D1D1F',
    fontSize: 16,
    fontWeight: '600',
  },
});