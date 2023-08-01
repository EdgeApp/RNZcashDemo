/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  Button,
  LogBox,
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import {
  AddressTool,
  KeyTool,
  makeSynchronizer,
  Synchronizer,
} from 'react-native-zcash';
import {
  birthdayHeight,
  randomHex,
  defaultHost,
  defaultPort,
} from './config.json';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {
  ConfirmedTransaction,
  InitializerConfig,
  UnifiedViewingKey,
} from 'react-native-zcash/lib/src/types';

LogBox.ignoreAllLogs();

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [destAddress, setDestAddress] = useState<string | undefined>();
  const [destAmount, setDestAmount] = useState<string | undefined>();
  const [destMemo, setDestMemo] = useState<string | undefined>();
  const [synchronizer2, setSynchronizer2] = useState<
    Synchronizer | undefined
  >();
  const [spendKey, setSpendKey] = useState<string | undefined>();
  const [viewKey, setViewKey] = useState<UnifiedViewingKey | undefined>();
  const [address, setAddress] = useState<string | undefined>();
  const [status, setStatus] = useState<string>('');
  const [update, setUpdate] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [blockHeight, setBlockHeight] = useState<number>(0);
  const [transactions, setTransactions] = useState<ConfirmedTransaction[]>([]);

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

      // const birthdayHeight = await KeyTool.getBirthdayHeight(
      //   defaultHost,
      //   defaultPort,
      // );
      // Initialize the synchronizer
      const initializerConfig: InitializerConfig = {
        networkName: 'mainnet',
        defaultHost,
        defaultPort,
        fullViewingKey: vKey,
        alias: 'MyZcashWallet1',
        birthdayHeight,
      };

      let localBlockHeight = 0;

      const synchronizer = await makeSynchronizer(initializerConfig);
      setSynchronizer2(synchronizer);
      synchronizer.subscribe({
        onStatusChanged: newStatus => {
          const date = new Date().toISOString().slice(11, 23);
          setStatus(`${date}: onStatusChanged: ${JSON.stringify(newStatus)}`);
          if (newStatus.name === 'SYNCED') {
            synchronizer.getShieldedBalance().then(walletBalance => {
              setBalance(JSON.stringify(walletBalance));
            });
            console.log(
              `getTransactions: ${birthdayHeight} -> ${localBlockHeight}`,
            );
            synchronizer
              .getTransactions({
                first: birthdayHeight,
                last: localBlockHeight,
              })
              .then(txs => {
                setTransactions(txs);
              });
          }
        },
        onUpdate: event => {
          const date = new Date().toISOString().slice(11, 23);
          setUpdate(`${date}: onUpdate: ${JSON.stringify(event)}`);
          setBlockHeight(event.networkBlockHeight);
          localBlockHeight = event.networkBlockHeight;
        },
      });
      synchronizer.start();
    }
    init();
  }, []);

  const renderItem = ({item}: {item: ConfirmedTransaction}) => {
    const date = `Date: ${new Date(
      item.blockTimeInSeconds * 1000,
    ).toISOString()}`;
    const txid = `Txid: ${item.rawTransactionId}`;
    const value = `Zatoshis: ${item.value}`;
    const toAddr = item.toAddress != null ? `ToAddress: ${item.toAddress}` : '';

    return (
      <View>
        <Text>{`${date}\n${txid}\n${value}\n${toAddr}\n\n`}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView>
        <Text>{'Spend'}</Text>
        <TextInput
          onChangeText={setDestAddress}
          returnKeyType="next"
          placeholder="Address"
          value={destAddress}
        />
        <TextInput
          onChangeText={setDestAmount}
          keyboardType="decimal-pad"
          returnKeyType="next"
          placeholder="Amount (Zatoshis)"
          value={destAmount}
        />
        <TextInput
          onChangeText={setDestMemo}
          returnKeyType="next"
          placeholder="Memo"
          value={destMemo}
        />

        <Button
          title="Send"
          onPress={() => {
            if (
              synchronizer2 == null ||
              destAmount == null ||
              destAddress == null ||
              spendKey == null
            ) {
              return;
            }
            synchronizer2
              .sendToAddress({
                zatoshi: destAmount,
                toAddress: destAddress,
                memo: destMemo ?? '',
                fromAccountIndex: 0,
                spendingKey: spendKey,
              })
              .then(result => {
                console.log(JSON.stringify(result, null, 2));
              });
          }}
        />

        <Text>{`spendKey: ${spendKey}\n`}</Text>
        <Text>{`viewKey: ${viewKey?.extfvk}\n`}</Text>
        <Text>{`address: ${address}\n`}</Text>
        <Text>{`balance: ${balance}\n`}</Text>
        <Text>{`blockHeight: ${blockHeight}\n`}</Text>
        <Text>{`status: ${status}\n`}</Text>
        <Text>{`update: ${update}\n`}</Text>
        <FlatList
          data={transactions}
          renderItem={renderItem}
          keyExtractor={item => item.rawTransactionId}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export default App;
