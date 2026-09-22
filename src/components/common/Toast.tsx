import React, { useState, useCallback, createContext, useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

type ToastType = 'success' | 'error' | 'info';

interface ToastData {
  visible: boolean;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  show: (message: string, type?: ToastType) => void;
  visible: boolean;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<ToastContextType>({
  show: () => {},
  visible: false,
  message: '',
  type: 'info',
});

export const useToast = () => useContext(ToastContext);

const { width } = Dimensions.get('window');

const TOAST_ICONS: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'close-circle',
  info: 'information-circle',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { colors } = useTheme();
  const [toast, setToast] = useState<ToastData>({
    visible: false,
    message: '',
    type: 'info',
  });
  const translateY = useRef(new Animated.Value(-120)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hide = useCallback(() => {
    Animated.timing(translateY, {
      toValue: -120,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    });
  }, [translateY]);

  const show = useCallback(
    (message: string, type: ToastType = 'info') => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setToast({ visible: true, message, type });
      Animated.spring(translateY, {
        toValue: 0,
        tension: 80,
        friction: 12,
        useNativeDriver: true,
      }).start();

      timeoutRef.current = setTimeout(() => {
        hide();
      }, 3000);
    },
    [hide, translateY]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getBackgroundColor = (): string => {
    switch (toast.type) {
      case 'success':
        return colors.success || '#10B981';
      case 'error':
        return colors.danger || '#EF4444';
      case 'info':
      default:
        return colors.primary || '#6366F1';
    }
  };

  return (
    <ToastContext.Provider value={{ show, visible: toast.visible, message: toast.message, type: toast.type }}>
      {children}
      {toast.visible && (
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: getBackgroundColor(),
              transform: [{ translateY }],
              top: 50,
            },
          ]}
        >
          <View style={styles.content}>
            <Ionicons
              name={TOAST_ICONS[toast.type]}
              size={22}
              color="#FFFFFF"
              style={styles.icon}
            />
            <Text style={styles.message} numberOfLines={2}>
              {toast.message}
            </Text>
            <TouchableOpacity onPress={hide} style={styles.closeButton}>
              <Ionicons name="close" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const Toast: React.FC = () => {
  return null;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  message: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  closeButton: {
    marginLeft: 10,
    padding: 4,
  },
});

export default Toast;
