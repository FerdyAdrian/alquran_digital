import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useEffect, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import type * as Ads from 'react-native-google-mobile-ads';
import { useAuth } from '../context/AuthContext';
import AppText from './AppText';

export default function AdBanner() {
  const { isPremium } = useAuth();
  const [sdk, setSdk] = useState<typeof Ads | null>(null);
  const [privacyRequired, setPrivacyRequired] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (isPremium || Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return;
    let active = true;
    (async () => {
      const ads = await import('react-native-google-mobile-ads');
      const consent = await ads.AdsConsent.gatherConsent();
      if (!active) return;
      setPrivacyRequired(consent.privacyOptionsRequirementStatus === ads.AdsConsentPrivacyOptionsRequirementStatus.REQUIRED);
      if (!consent.canRequestAds) return;
      await ads.default().initialize();
      if (active) setSdk(ads);
    })().catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [isPremium]);
  if (isPremium || !sdk) return null;
  const configured = Platform.OS === 'android' ? process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID : process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID;
  const unitId = __DEV__ || process.env.EXPO_PUBLIC_ADMOB_TEST_ADS === 'true' ? sdk.TestIds.BANNER : configured;
  if (!unitId) return null;
  const privacy = async () => {
    setFailed(true);
    try {
      await sdk.AdsConsent.showPrivacyOptionsForm();
      const consent = await sdk.AdsConsent.getConsentInfo();
      setFailed(!consent.canRequestAds);
    } catch { setFailed(true); }
  };
  return <View style={{ alignItems: 'center', gap: 8, paddingVertical: 16 }}>
    {!failed ? <><AppText variant="caption">Iklan</AppText><sdk.BannerAd unitId={unitId} size={sdk.BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{ requestNonPersonalizedAdsOnly: true }} onAdFailedToLoad={() => setFailed(true)} /></> : null}
    {privacyRequired ? <Pressable accessibilityRole="button" onPress={privacy} style={{ minHeight: 44, justifyContent: 'center' }}><AppText variant="caption">Pilihan privasi iklan</AppText></Pressable> : null}
  </View>;
}
