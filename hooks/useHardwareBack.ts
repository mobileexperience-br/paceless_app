import { useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';

export function useHardwareBack(handler: () => void): void {
  const handlerRef = useRef<() => void>(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', (): boolean => {
      handlerRef.current();
      return true;
    });
    return (): void => {
      subscription.remove();
    };
  }, []);
}
