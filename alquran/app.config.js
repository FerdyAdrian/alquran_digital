const fs = require('node:fs');
const path = require('node:path');

module.exports = ({ config }) => {
  const adhan = './assets/audio/adzan.wav';
  const hasAdhan = fs.existsSync(path.join(__dirname, adhan));
  return {
    ...config,
    plugins: [
      ...config.plugins,
      'expo-secure-store',
      ['expo-notifications', { ...(hasAdhan ? { sounds: [adhan] } : {}) }],
      ['react-native-google-mobile-ads', {
        androidAppId: process.env.ADMOB_ANDROID_APP_ID || 'ca-app-pub-5041245306964870~7788827731',
        iosAppId: process.env.ADMOB_IOS_APP_ID || 'ca-app-pub-3940256099942544~1458002511',
        delayAppMeasurementInit: true,
      }],
    ],
    extra: { ...config.extra, adhanSound: hasAdhan ? 'adzan.wav' : null },
  };
};
