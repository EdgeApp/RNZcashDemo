/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  LogBox,
  SafeAreaView,
  StatusBar,
  Text,
  useColorScheme,
} from 'react-native';
import {KeyTool} from 'react-native-zcash';
import {randomHex} from './config.json';

import {Colors} from 'react-native/Libraries/NewAppScreen';
LogBox.ignoreAllLogs();

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [spendKey, setSpendKey] = useState<string | undefined>();

  useEffect(() => {
    async function init() {
      const key = await KeyTool.deriveSpendingKey(randomHex, 'mainnet');
      setSpendKey(key);
    }
    init();
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <Text>{`spendKey: ${spendKey}\n`}</Text>
    </SafeAreaView>
  );
}

export default App;
