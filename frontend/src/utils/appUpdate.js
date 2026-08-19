import { Capacitor } from '@capacitor/core';
import { Dialog } from '@capacitor/dialog';
import { App } from '@capacitor/app';

// The current version of THIS app build
// ⚠️ Change this every time you build a new APK
export const CURRENT_APP_VERSION = '1.0.0';

// Which app type this is: 'user' | 'admin'
// Set via VITE_APP_TYPE env variable in .env
export const APP_TYPE = import.meta.env.VITE_APP_TYPE || 'user';

/**
 * Parses a semver string like "1.2.3" into a comparable number
 */
function parseVersion(v) {
  const parts = String(v).split('.').map(Number);
  return (parts[0] || 0) * 10000 + (parts[1] || 0) * 100 + (parts[2] || 0);
}

/**
 * Called on app startup. Checks backend for minimum required version.
 * If the installed app is outdated, shows a blocking dialog.
 */
export async function checkForAppUpdate() {
  // Only run on real Android/iOS devices
  if (!Capacitor.isNativePlatform()) return;

  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const res = await fetch(`${backendUrl}/api/settings/app-version`);
    if (!res.ok) return;

    const data = await res.json();

    const minVersion = data.MIN_REQUIRED_APP_VERSION || '1.0.0';
    const updateUrl = APP_TYPE === 'admin'
      ? data.ADMIN_APP_UPDATE_URL
      : data.USER_APP_UPDATE_URL;

    const currentNum = parseVersion(CURRENT_APP_VERSION);
    const minNum = parseVersion(minVersion);

    if (currentNum < minNum) {
      await showUpdateDialog(minVersion, updateUrl);
    }
  } catch (err) {
    // Silently fail — don't block users if backend is unreachable
    console.warn('[AppUpdate] Version check failed:', err);
  }
}

/**
 * Shows a blocking "Update Required" dialog.
 * User must update — they cannot dismiss this dialog.
 */
async function showUpdateDialog(minVersion, updateUrl) {
  const { value } = await Dialog.confirm({
    title: '🚀 Update Required',
    message: `A newer version (v${minVersion}) of the W!FOMART app is available.\n\nPlease update to continue using the app.`,
    okButtonTitle: 'Update Now',
    cancelButtonTitle: 'Exit',
  });

  if (value && updateUrl) {
    // Open the Play Store / APK download link
    window.open(updateUrl, '_system');
  }

  // Show the dialog again if user chose "Exit" or update url is missing
  // This blocks the app until it's updated
  await App.exitApp();
}
