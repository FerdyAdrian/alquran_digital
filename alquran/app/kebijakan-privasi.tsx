import { Linking, Pressable, ScrollView } from 'react-native';
import AppText from '../src/components/AppText';
import Card from '../src/components/Card';
import { useTheme } from '../src/context/ThemeContext';
import privacy from '../src/assets/privacy.json';
export default function PrivacyScreen() {
  const { theme } = useTheme();
  return <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 18, gap: 14, paddingBottom: 40 }}>
    <AppText variant="title">{privacy.title}</AppText><AppText>Diperbarui {privacy.updated}</AppText>
    {privacy.sections.map(section => <Card key={section.title} style={{ gap: 8 }}><AppText variant="subtitle">{section.title}</AppText><AppText>{section.body}</AppText></Card>)}
    <Pressable accessibilityRole="link" style={{ minHeight: 48, justifyContent: 'center' }} onPress={() => Linking.openURL(`mailto:${privacy.supportEmail}`)}><AppText>Hubungi dukungan privasi</AppText></Pressable>
  </ScrollView>;
}
