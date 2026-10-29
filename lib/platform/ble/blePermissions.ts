import { PermissionsAndroid, Platform, type Permission } from 'react-native';

export type BlePermissionResult = 'granted' | 'denied' | 'blocked';

const ANDROID_12_API_LEVEL = 31;

function androidApiLevel(): number {
  return typeof Platform.Version === 'number' ? Platform.Version : 0;
}

function requiredAndroidPermissions(): Permission[] {
  if (androidApiLevel() >= ANDROID_12_API_LEVEL) {
    return [PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT];
  }
  return [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
}

export async function requestBlePermissions(): Promise<BlePermissionResult> {
  if (Platform.OS !== 'android') return 'granted';
  const permissions = requiredAndroidPermissions();
  const result = await PermissionsAndroid.requestMultiple(permissions);
  const statuses = permissions.map((permission) => result[permission]);
  if (statuses.includes('never_ask_again')) return 'blocked';
  return statuses.every((status) => status === 'granted') ? 'granted' : 'denied';
}

export async function checkBlePermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const checks = await Promise.all(requiredAndroidPermissions().map((permission) => PermissionsAndroid.check(permission)));
  return checks.every((granted) => granted);
}
