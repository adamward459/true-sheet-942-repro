import { useEffect, useRef, useState } from 'react';
import { Button, Keyboard, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TrueSheet } from '@lodev09/react-native-true-sheet';

const { version: TRUE_SHEET_VERSION } = require('@lodev09/react-native-true-sheet/package.json');

export default function App() {
  const sheet = useRef<TrueSheet>(null);
  const [log, setLog] = useState<string[]>([]);
  const [blurOnHide, setBlurOnHide] = useState(false);

  const append = (line: string) => {
    console.log(line);
    setLog((lines) => [...lines.slice(-11), line]);
  };

  useEffect(() => {
    const frame = Keyboard.addListener('keyboardWillChangeFrame', ({ endCoordinates }) =>
      append(`keyboard height ${endCoordinates.height} screenY ${endCoordinates.screenY}`)
    );
    return () => frame.remove();
  }, []);

  // The workaround from the issue: blur the input so iPadOS does not keep a minimized keyboard.
  useEffect(() => {
    if (!blurOnHide) return;
    const hide = Keyboard.addListener('keyboardWillHide', () =>
      TextInput.State.blurTextInput(TextInput.State.currentlyFocusedInput())
    );
    return () => hide.remove();
  }, [blurOnHide]);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>TrueSheet #942 repro</Text>
      <Text>@lodev09/react-native-true-sheet {TRUE_SHEET_VERSION}</Text>
      <View style={styles.row}>
        <Text>Blur input on keyboardWillHide (workaround)</Text>
        <Switch value={blurOnHide} onValueChange={setBlurOnHide} />
      </View>
      <Button title="Present" onPress={() => sheet.current?.present()} />
      <Button title="Clear log" onPress={() => setLog([])} />
      <View style={styles.log}>
        {log.map((line, index) => (
          <Text key={index} style={styles.logLine}>
            {line}
          </Text>
        ))}
      </View>

      <TrueSheet
        ref={sheet}
        detents={['auto']}
        backgroundStyle={{ backgroundColor: 'white' }}
      >
        <View style={styles.content}>
          <Text>Focus the input, then tap the Hide keyboard key.</Text>
          <TextInput placeholder="Type here" style={styles.input} />
        </View>
      </TrueSheet>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', paddingTop: 80, gap: 12, backgroundColor: '#eee' },
  title: { fontSize: 20, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  log: { width: 420, padding: 12, gap: 2, backgroundColor: '#fff', borderRadius: 8 },
  logLine: { fontFamily: 'Menlo', fontSize: 12 },
  content: { padding: 24, gap: 12 },
  input: { borderWidth: 1, borderColor: '#999', borderRadius: 8, padding: 12 },
});
