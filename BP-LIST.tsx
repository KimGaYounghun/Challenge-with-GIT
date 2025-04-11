import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert
} from 'react-native';
import { useRouter } from 'expo-router';

interface BP {
  BPID: string;
  PW: string;
  NAME: string;
  EMAIL: string;
  PHONE: string;
  BRNUM: string;
  COUNTRY: string;
  BPTYPE: string;
  PTERM: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const [data, setData] = useState<BP[]>([]);
  const [searchName, setSearchName] = useState('');
  const [regionFilter, setRegionFilter] = useState<'ALL' | 'DOMESTIC' | 'FOREIGN'>('ALL');

  const countryMap: Record<string, string> = {
    '00': '대한민국(부산/김해)',
    '01': '대한민국(제주)',
    '02': '일본(도쿄)',
    '03': '대만(타이베이)',
    '04': '중국(상하이)',
    '05': '홍콩(홍콩)',
    '06': '싱가포르(싱가포르)',
    '08': '태국(방콕)',
    '09': '오스트레일리아(시드니)',
    '10': '아랍에미리트(두바이)',
  };

  const bpTypeMap: Record<string, string> = {
    'A1': '국내 여행사',
    'A2': '해외 여행사',
    'B1': '국내 컨테이너 고객',
    'B2': '해외 컨테이너 고객(컨테이너 필수 지참)',
    'C1': '항공기 정비소',
  };

  const ptermMap: Record<string, string> = {
    'T001': '즉시지급',
    'T030': '30일',
    'T060': '60일',
  };

  const applyRegionFilter = (items: BP[]) => {
    return items.filter(bp => {
      const code = bp.COUNTRY || '00';
      const fullName = countryMap[code] || '기타';
      return regionFilter === 'ALL'
        || (regionFilter === 'DOMESTIC' && fullName.startsWith('대한민국'))
        || (regionFilter === 'FOREIGN' && !fullName.startsWith('대한민국'));
    });
  };

  const fetchData = async () => {
    try {
      const res = await fetch("http://10.100.0.71:3001/bp");
      const json = await res.json();
      const filtered = applyRegionFilter(json);
      setData(filtered);
    } catch (e) {
      Alert.alert("데이터 로드 실패", "서버에 연결할 수 없습니다.");
    }
  };

  const handleSearch = async () => {
    try {
      const res = await fetch("http://10.100.0.71:3001/bp");
      const json: BP[] = await res.json();

      const keyword = searchName.trim();
      const filteredByName = keyword === ""
        ? json
        : json.filter(bp =>
            bp.NAME.includes(keyword) ||
            bp.NAME.toLowerCase().includes(keyword.toLowerCase())
          );

      const finalFiltered = applyRegionFilter(filteredByName);
      setData(finalFiltered);
    } catch (e) {
      Alert.alert("검색 실패", "검색 요청 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    fetchData();
  }, [regionFilter]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>BP 테이블 목록</Text>

      <View style={styles.filterGroup}>
        <TouchableOpacity
          style={[styles.filterButton, regionFilter === 'ALL' && styles.filterSelected]}
          onPress={() => setRegionFilter('ALL')}
        >
          <Text style={[styles.filterText, regionFilter === 'ALL' && styles.filterTextSelected]}>전체</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, regionFilter === 'DOMESTIC' && styles.filterSelected]}
          onPress={() => setRegionFilter('DOMESTIC')}
        >
          <Text style={[styles.filterText, regionFilter === 'DOMESTIC' && styles.filterTextSelected]}>국내</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, regionFilter === 'FOREIGN' && styles.filterSelected]}
          onPress={() => setRegionFilter('FOREIGN')}
        >
          <Text style={[styles.filterText, regionFilter === 'FOREIGN' && styles.filterTextSelected]}>해외</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchGroup}>
        <TextInput
          style={styles.searchInput}
          placeholder="회사명 검색"
          value={searchName}
          onChangeText={setSearchName}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>조회</Text>
        </TouchableOpacity>
      </View>

      {data.map((bp, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.field}><Text style={styles.label}>BPID:</Text> {bp.BPID}</Text>
          <Text style={styles.field}><Text style={styles.label}>회사명:</Text> {bp.NAME}</Text>
          <Text style={styles.field}><Text style={styles.label}>이메일:</Text> {bp.EMAIL}</Text>
          <Text style={styles.field}><Text style={styles.label}>전화번호:</Text> {bp.PHONE}</Text>
          <Text style={styles.field}><Text style={styles.label}>사업자번호:</Text> {bp.BRNUM}</Text>
          <Text style={styles.field}><Text style={styles.label}>국가:</Text> {countryMap[bp.COUNTRY || '00'] || '기타'}</Text>
          <Text style={styles.field}><Text style={styles.label}>BP유형:</Text> {bpTypeMap[bp.BPTYPE] || bp.BPTYPE}</Text>
          <Text style={styles.field}><Text style={styles.label}>지급조건:</Text> {ptermMap[bp.PTERM] || bp.PTERM}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#eef3fa',
    flexGrow: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
  },
  filterGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  filterSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  filterText: {
    color: '#555',
  },
  filterTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  searchGroup: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  field: {
    fontSize: 14,
    marginBottom: 4,
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
});
