import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  const [bpid, setBpid] = useState('');
  const [pw, setPw] = useState('');
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<'agency' | 'container'>('agency');
  const [trackingCode, setTrackingCode] = useState('');

  const getBorderColor = (field: string) =>
    invalidFields.includes(field) ? '#ff3333' : '#ccc';

  const handleLogin = async () => {
    const missingFields = [];
    if (!bpid.trim()) missingFields.push('bpid');
    if (!pw.trim()) missingFields.push('pw');

    if (missingFields.length > 0) {
      setInvalidFields(missingFields);
      Alert.alert("입력 오류", "아이디와 비밀번호를 모두 입력해 주세요.");
      return;
    }

    try {
      const response = await fetch("http://10.100.0.71:3001/bp");
      if (!response.ok) throw new Error("Server Error");

      const json = await response.json();
      const user = json.find((item: any) => item.BPID === bpid && item.PW === pw);

      if (!user) {
        Alert.alert("로그인 실패", "아이디 또는 비밀번호가 올바르지 않습니다.");
        return;
      }

      const allowedAgency = ['A1', 'A2'];
      const allowedContainer = ['B1', 'B2', 'C1'];

      const isAgency = selectedTab === 'agency';
      const isAllowed = isAgency
        ? allowedAgency.includes(user.BPTYPE)
        : allowedContainer.includes(user.BPTYPE);

      if (!isAllowed) {
        Alert.alert(
          "접근 불가",
          isAgency
            ? "여행사 접근 권한이 없습니다."
            : "컨테이너 접근 권한이 없습니다."
        );
        return;
      }

      router.push({
        pathname: "/flights",
        params: {
          agentId: user.BPID,
          agencyName: user.NAME,
        },
      });
    } catch (error) {
      Alert.alert("오류", "서버 요청 중 오류가 발생했습니다.");
    }
  };

  const handleTracking = () => {
    if (trackingCode.trim() === 'admin135') {
      router.push('/bp-list');
    } else {
      Alert.alert('조회 실패', '일치하는 현황 정보가 없습니다.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.pageTitle}>First Page</Text>
        <View style={styles.card}>
          <Text style={styles.logo}>SkyLogistics</Text>
          <Text style={styles.subtitle}>Air Cargo & Travel Solutions</Text>
  
          <View style={styles.tabGroup}>
            <TouchableOpacity
              style={[styles.tabItem, selectedTab === 'agency' && styles.tabSelected]}
              onPress={() => setSelectedTab('agency')}
            >
              <Text style={[styles.tabText, selectedTab === 'agency' && styles.tabTextSelected]}>
                Travel Agency
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabItem, selectedTab === 'container' && styles.tabSelected]}
              onPress={() => setSelectedTab('container')}
            >
              <Text style={[styles.tabText, selectedTab === 'container' && styles.tabTextSelected]}>
                Container
              </Text>
            </TouchableOpacity>
          </View>
  
          <TextInput
            style={[styles.input, { borderColor: getBorderColor('bpid') }]}
            placeholder="User ID"
            placeholderTextColor={getBorderColor('bpid')}
            value={bpid}
            onChangeText={text => {
              setBpid(text);
              setInvalidFields(prev => prev.filter(f => f !== 'bpid'));
            }}
          />
          <TextInput
            style={[styles.input, { borderColor: getBorderColor('pw') }]}
            placeholder="Password"
            placeholderTextColor={getBorderColor('pw')}
            secureTextEntry
            value={pw}
            onChangeText={text => {
              setPw(text);
              setInvalidFields(prev => prev.filter(f => f !== 'pw'));
            }}
          />
  
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
  
          <Text style={styles.queryLabel}>현황조회</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter tracking number"
            placeholderTextColor="#aaa"
            value={trackingCode}
            onChangeText={setTrackingCode}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleTracking}>
            <Text style={styles.searchButtonText}>SEARCH</Text>
          </TouchableOpacity>
  
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.registerPrompt}>
              Don’t have an account? <Text style={styles.link}>Register Now</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#29448B', // 예매 페이지 배경색 반영
  },
  pageTitle: {
    position: 'absolute',
    top: 20,
    left: 20,
    color: '#ddd',
  },
  card: {
    backgroundColor: '#ffffffee',
    borderRadius: 20,
    padding: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#29448B',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  tabGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ddd',
    borderRadius: 10,
    marginBottom: 20,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabSelected: {
    backgroundColor: '#003366',
  },
  tabText: {
    color: '#333',
    fontWeight: '600',
  },
  tabTextSelected: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#003366',
    padding: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  queryLabel: {
    color: '#555',
    marginBottom: 6,
  },
  searchButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  searchButtonText: {
    color: '#003366',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  registerPrompt: {
    textAlign: 'center',
    marginTop: 16,
    color: '#666',
  },
  link: {
    color: '#003366',
    textDecorationLine: 'underline',
  },
});
