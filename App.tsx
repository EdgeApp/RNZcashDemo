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
import {AddressTool, KeyTool, makeSynchronizer} from 'react-native-zcash';
import {randomHex, defaultHost, defaultPort} from './config.json';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {
  InitializerConfig,
  UnifiedViewingKey,
} from 'react-native-zcash/lib/src/types';

LogBox.ignoreAllLogs();

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [spendKey, setSpendKey] = useState<string | undefined>();
  const [viewKey, setViewKey] = useState<UnifiedViewingKey | undefined>();
  const [address, setAddress] = useState<string | undefined>();
  const [status, setStatus] = useState<string>('');
  const [update, setUpdate] = useState<string>('');

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

      const birthdayHeight = await KeyTool.getBirthdayHeight(
        defaultHost,
        defaultPort,
      );
      // Initialize the synchronizer
      const initializerConfig: InitializerConfig = {
        networkName: 'mainnet',
        defaultHost,
        defaultPort,
        fullViewingKey: vKey,
        alias: 'MyZcashWallet1',
        birthdayHeight,
      };

      const synchronizer = await makeSynchronizer(initializerConfig);
      synchronizer.subscribe({
        onStatusChanged: newStatus => {
          const date = new Date().toISOString().slice(11, 23);
          setStatus(`${date}: onStatusChanged: ${JSON.stringify(newStatus)}`);
        },
        onUpdate: event => {
          const date = new Date().toISOString().slice(11, 23);
          setUpdate(`${date}: onUpdate: ${JSON.stringify(event)}`);
        },
      });
      synchronizer.start();
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
      <Text>{`status: ${status}\n`}</Text>
      <Text>{`update: ${update}\n`}</Text>
    </SafeAreaView>
  );
}

export default App;
