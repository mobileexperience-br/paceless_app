const { withAndroidManifest } = require('expo/config-plugins');

const LOCATION_PERMISSIONS = [
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.ACCESS_FINE_LOCATION',
];

const SDK_23_PERMISSIONS_KEY = 'uses-permission-sdk-23';

const withoutDuplicateLocationPermissions = (config) =>
  withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const entries = manifest[SDK_23_PERMISSIONS_KEY];

    if (Array.isArray(entries)) {
      const kept = entries.filter(
        (entry) => !LOCATION_PERMISSIONS.includes(entry.$['android:name']),
      );

      if (kept.length > 0) {
        manifest[SDK_23_PERMISSIONS_KEY] = kept;
      } else {
        delete manifest[SDK_23_PERMISSIONS_KEY];
      }
    }

    return config;
  });

module.exports = withoutDuplicateLocationPermissions;
