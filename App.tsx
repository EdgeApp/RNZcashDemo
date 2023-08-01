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
import {AddressTool, KeyTool} from 'react-native-zcash';
import {randomHex} from './config.json';

import {Colors} from 'react-native/Libraries/NewAppScreen';
LogBox.ignoreAllLogs();
import {UnifiedViewingKey} from 'react-native-zcash/lib/src/types';

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [spendKey, setSpendKey] = useState<string | undefined>();
  const [viewKey, setViewKey] = useState<UnifiedViewingKey | undefined>();
  const [address, setAddress] = useState<string | undefined>();

  if (address != null) {
    console.log(`address: ${address}`);
  }

  useEffect(() => {
    async function init() {
      const key = await KeyTool.deriveSpendingKey(randomHex, 'mainnet');
      setSpendKey(key);
      const vKey = await KeyTool.deriveViewingKey(randomHex, 'mainnet');
      setViewKey(vKey);
      const addr = await AddressTool.deriveShieldedAddress(
        vKey.extfvk,
        'mainnet',
      );
      setAddress(addr);
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
      <Text>{`viewKey: ${viewKey?.extfvk}\n`}</Text>
      <Text>{`address: ${address}\n`}</Text>
    </SafeAreaView>
  );
}

export default App;
