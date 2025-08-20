import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Play, Pause, Square, RotateCcw } from 'lucide-react-native';

type TimerMode = 'countUp' | 'countDown';
type TimerState = 'stopped' | 'running' | 'paused';

export default function TimerScreen() {
  const [mode, setMode] = useState<TimerMode>('countUp');
  const [state, setState] = useState<TimerState>('stopped');
  const [currentTime, setCurrentTime] = useState(0); // in seconds
  const [inputTime, setInputTime] = useState('5:00'); // input for countdown
  const [startTime, setStartTime] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Timer</Text>
      </View>

      <View style={styles.modeContainer}>
        <Text style={styles.label}>Mode:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={mode}
            onValueChange={handleModeChange}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label="Count Up" value="countUp" />
            <Picker.Item label="Count Down" value="countDown" />
          </Picker>
        </View>
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
        <Text style={styles.timerMode}>
          {mode === 'countUp' ? 'Counting Up' : 'Counting Down'}
        </Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E5E9',
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
  picker: {
    height: 50,
  },
  pickerItem: {
    fontSize: 16,
    color: '#1D1D1F',
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
    marginVertical: 10,
    paddingHorizontal: 20,
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