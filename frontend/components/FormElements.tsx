// components/FormElements.tsx - VERSIÓN ORIGINAL CON LABEL FLOTANTE
import React, { useState } from 'react';
import { TextInput, TextInputProps, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

interface CustomInputProps extends TextInputProps {
  label?: string;
}

export const CustomInput = React.forwardRef<TextInput, CustomInputProps>(
  ({ label, style, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [animatedValue] = useState(new Animated.Value(props.value ? 1 : 0));

    const handleFocus = (e: any) => {
      setIsFocused(true);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      if (!props.value) {
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
      onBlur?.(e);
    };

    const labelStyle = {
      transform: [{
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -20],
        }),
      }],
      fontSize: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [16, 12],
      }),
      color: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['#999', '#1E3F66'],
      }),
    };

    return (
      <View style={styles.inputContainer}>
        <TextInput
          ref={ref}
          style={[
            styles.input,
            isFocused && styles.inputFocused,
            style
          ]}
          placeholder={!props.value ? label : ''}
          placeholderTextColor="#999"
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {label && (
          <Animated.Text 
            style={[styles.label, labelStyle]}
            pointerEvents="none"
          >
            {label}
          </Animated.Text>
        )}
      </View>
    );
  }
);

// Dropdown para tipo de usuario (mantén tu versión original)
interface TipoUsuarioDropdownProps {
  value: 'estudiante' | 'arrendador' | 'ambos';
  onValueChange: (value: 'estudiante' | 'arrendador' | 'ambos') => void;
  disabled?: boolean;
}

export const TipoUsuarioDropdown: React.FC<TipoUsuarioDropdownProps> = ({
  value,
  onValueChange,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  const options = [
    { value: 'estudiante' as const, label: 'Estudiante' },
    { value: 'arrendador' as const, label: 'Arrendador' },
    { value: 'ambos' as const, label: 'Ambos' },
  ];

  const selectedOption = options.find(opt => opt.value === value);

  const handleFocus = () => {
    setIsFocused(true);
    setIsOpen(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    setIsOpen(false);
    if (!value) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleOptionSelect = (optionValue: 'estudiante' | 'arrendador' | 'ambos') => {
    onValueChange(optionValue);
    handleBlur();
  };

  const labelStyle = {
    transform: [{
      translateY: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -20],
      }),
    }],
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['#999', '#1E3F66'],
    }),
  };

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={[
          styles.dropdownHeader,
          isFocused && styles.dropdownHeaderOpen,
          disabled && styles.dropdownDisabled
        ]}
        onPress={handleFocus}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Animated.Text style={[styles.dropdownLabel, labelStyle]}>
          Tipo de usuario
        </Animated.Text>
        {selectedOption && (
            <Text style={styles.dropdownPlaceholder}>
            {selectedOption.label}
            </Text>
        )}
        <Text style={styles.dropdownArrow}>
          {isOpen ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownList}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.dropdownItem,
                value === option.value && styles.dropdownItemSelected
              ]}
              onPress={() => handleOptionSelect(option.value)}
            >
              <View style={styles.radioContainer}>
                <View style={[
                  styles.radioOuter,
                  value === option.value && styles.radioOuterSelected
                ]}>
                  {value === option.value && <View style={styles.radioInner} />}
                </View>
                <Text style={[
                  styles.dropdownItemText,
                  value === option.value && styles.dropdownItemTextSelected
                ]}>
                  {option.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  label: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 4,
    fontWeight: '500',
    pointerEvents: 'none',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8fafc',
    zIndex: 0,
  },
  inputFocused: {
    borderColor: '#1E3F66',
  },
  dropdownContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  dropdownHeader: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#f8fafc',
    minHeight: 60,
    justifyContent: 'center',
  },
  dropdownHeaderOpen: {
    borderColor: '#1E3F66',
  },
  dropdownDisabled: {
    opacity: 0.6,
  },
  dropdownLabel: {
    position: 'absolute',
    left: 16,
    top: 18,
    zIndex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 4,
    fontWeight: '500',
    pointerEvents: 'none',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#000',
  },
  dropdownArrow: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -6,
    fontSize: 12,
    color: '#64748b',
  },
  dropdownList: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownItemSelected: {
    backgroundColor: '#fef2f2',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#1E3F66',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1E3F66',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: '#1E3F66',
    fontWeight: '600',
  },
});