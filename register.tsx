import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    BPID: "",
    PW: "",
    NAME: "",
    EMAIL_ID: "",
    EMAIL_DOMAIN: "",
    EMAIL_CUSTOM: "",
    PHOME: "",
    BRNUM: "",
    COUNTRY: "",
    BPTYPE: "",
    PTERM: "",
  });

  const [region, setRegion] = useState<"DOMESTIC" | "FOREIGN" | "">("");
  const [errorMessage, setErrorMessage] = useState("");
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [toggle, setToggle] = useState({ COUNTRY: false, BPTYPE: false, PTERM: false });

  const handleChange = (field: keyof typeof form, value: string) => {
    if ((field === "BPID" || field === "PW") && /[\u3131-\u318E\uAC00-\uD7A3]/.test(value)) return;
    setForm({ ...form, [field]: value });
    setInvalidFields(prev => prev.filter(f => f !== field));
    if (errorMessage) setErrorMessage("");
  };

  const handleBrnumChange = (value: string) => {
    const onlyDigits = value.replace(/[^0-9]/g, "");
    let formatted = onlyDigits;
    if (onlyDigits.length >= 6) {
      formatted = `${onlyDigits.slice(0, 3)}-${onlyDigits.slice(3, 5)}-${onlyDigits.slice(5, 10)}`;
    }
    handleChange("BRNUM", formatted);
  };

  const handleSubmit = async () => {
    const required = ["BPID", "PW", "NAME", "EMAIL_ID", "EMAIL_DOMAIN", "PHOME", "BRNUM", "COUNTRY", "PTERM"];
    const empty = required.filter(
      key =>
        form[key as keyof typeof form].trim() === "" ||
        (key === "EMAIL_DOMAIN" && form.EMAIL_DOMAIN === "기타입력" && form.EMAIL_CUSTOM.trim() === "")
    );
    if (empty.length > 0) {
      setInvalidFields(empty);
      setErrorMessage("⚠ 모든 필드를 입력해 주세요.");
      return;
    }

    const fullEmail =
    form.EMAIL_ID + "@" + (form.EMAIL_DOMAIN === "기타입력" ? form.EMAIL_CUSTOM : form.EMAIL_DOMAIN);

  try {
    const res = await fetch("http://10.100.0.71:3001/bp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        BPID: form.BPID,
        PW: form.PW,
        NAME: form.NAME,
        EMAIL: fullEmail,
        PHOME: form.PHOME,
        BRNUM: form.BRNUM,
        COUNTRY: form.COUNTRY,
        BPTYPE: form.BPTYPE,
        PTERM: form.PTERM,
      }),
    });

    if (!res.ok) throw new Error("등록 실패");

    Alert.alert("등록 완료", "회원 정보가 저장되었습니다.");

    // ✅ 회원가입 완료 후 index.tsx로 이동
    router.replace("/");  // ✅ 이렇게 해야 합니다.


  } catch {
    Alert.alert("오류", "서버 오류가 발생했습니다.");
  }
};

  const renderInput = (
    label: string,
    field: keyof typeof form,
    secure = false,
    keyboardType?: any,
    customOnChange?: (val: string) => void
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={`${label} 입력`}
        placeholderTextColor={invalidFields.includes(field) ? "#ff3333" : "#aaa"}
        secureTextEntry={secure}
        value={form[field]}
        keyboardType={keyboardType}
        onChangeText={(text) =>
          customOnChange ? customOnChange(text) : handleChange(field, text)
        }
      />
    </View>
  );

  const renderToggleRadio = (
    title: string,
    field: keyof typeof toggle,
    options: { label: string; value: string }[]
  ) => (
    <View style={styles.inputGroup}>
      <TouchableOpacity onPress={() => setToggle({ ...toggle, [field]: !toggle[field] })}>
        <Text style={styles.label}>{title} ▾</Text>
      </TouchableOpacity>
      {toggle[field] && (
        <View style={styles.radioGroup}>
          {options.map(({ label, value }) => (
            <TouchableOpacity
              key={value}
              style={[styles.radioItem, form[field] === value && styles.radioItemSelected]}
              onPress={() => handleChange(field as keyof typeof form, value)}
            >
              <Text style={[styles.radioText, form[field] === value && styles.radioTextSelected]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
  const styles = StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: "#fff",
    },
    logo: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      textAlign: "center",
    },
    inputGroup: {
      marginBottom: 15,
    },
    label: {
      fontSize: 16,
      marginBottom: 8,
      color: "#333",
      fontWeight: "600",
    },
    input: {
      height: 48,
      borderColor: "#ccc",
      borderWidth: 1,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    radioGroup: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 8,
    },
    radioItem: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    radioItemSelected: {
      backgroundColor: "#484A70",
      borderColor: "#484A70",
    },
    radioText: {
      color: "#555",
    },
    radioTextSelected: {
      color: "#fff",
    },
    button: {
      backgroundColor: "#484A70",
      paddingVertical: 15,
      alignItems: "center",
      borderRadius: 8,
      marginTop: 20,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    messageBox: {
      padding: 10,
      backgroundColor: "#fee2e2",
      borderRadius: 8,
      marginVertical: 10,
    },
    messageText: {
      color: "#b91c1c",
      fontSize: 14,
    },
  });
  
  const domesticCountries = [
    { label: "대한민국(부산/김해)", value: "00" },
    { label: "대한민국(제주)", value: "01" },
  ];

  const foreignCountries = [
    { label: "일본(도쿄)", value: "02" },
    { label: "대만(타이베이)", value: "03" },
    { label: "중국(상하이)", value: "04" },
    { label: "홍콩(홍콩)", value: "05" },
    { label: "싱가포르(싱가포르)", value: "06" },
    { label: "태국(방콕)", value: "08" },
    { label: "오스트레일리아(시드니)", value: "09" },
    { label: "아랍에미리트(두바이)", value: "10" },
  ];

  const domesticTypes = [
    { label: "A1: 국내 여행사", value: "A1" },
    { label: "B1: 국내 컨테이너 고객", value: "B1" },
    { label: "C1: 항공기 정비소", value: "C1" },
  ];

  const foreignTypes = [
    { label: "A2: 해외 여행사", value: "A2" },
    { label: "B2: 해외 컨테이너 고객", value: "B2" },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logo}>회원가입</Text>
      {renderInput("협력사 ID (BPID)", "BPID")}
      {renderInput("비밀번호 (PW)", "PW", true)}
      {renderInput("회사명 (NAME)", "NAME")}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>이메일</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="아이디"
            placeholderTextColor="#aaa"
            value={form.EMAIL_ID}
            onChangeText={(text) => handleChange("EMAIL_ID", text)}
          />
          <Text style={{ marginHorizontal: 6 }}>@</Text>
        </View>
        <View style={styles.radioGroup}>
          {["gmail.com", "naver.com", "기타입력"].map((domain) => (
            <TouchableOpacity
              key={domain}
              style={[styles.radioItem, form.EMAIL_DOMAIN === domain && styles.radioItemSelected]}
              onPress={() => handleChange("EMAIL_DOMAIN", domain)}
            >
              <Text
                style={[styles.radioText, form.EMAIL_DOMAIN === domain && styles.radioTextSelected]}
              >
                {domain}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {form.EMAIL_DOMAIN === "기타입력" && renderInput("직접 입력", "EMAIL_CUSTOM")}
      </View>

      {renderInput("전화번호", "PHOME", false, "phone-pad")}
      {renderInput("사업자 등록 번호", "BRNUM", false, "number-pad", handleBrnumChange)}

      {/* 지역 구분 추가 */}
      {/* 지역 구분 선택 */}
<View style={styles.inputGroup}>
  <Text style={styles.label}>국내 / 해외</Text>
  <View style={styles.radioGroup}>
    <TouchableOpacity
      style={[styles.radioItem, region === "DOMESTIC" && styles.radioItemSelected]}
      onPress={() => {
        setRegion("DOMESTIC");
        setForm({ ...form, COUNTRY: "", BPTYPE: "" });
      }}
    >
      <Text style={[styles.radioText, region === "DOMESTIC" && styles.radioTextSelected]}>
        국내
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.radioItem, region === "FOREIGN" && styles.radioItemSelected]}
      onPress={() => {
        setRegion("FOREIGN");
        setForm({ ...form, COUNTRY: "", BPTYPE: "" });
      }}
    >
      <Text style={[styles.radioText, region === "FOREIGN" && styles.radioTextSelected]}>
        해외
      </Text>
    </TouchableOpacity>
  </View>
</View>

{/* 국가 선택 버튼 */}
{region !== "" && (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>국가</Text>
    <View style={styles.radioGroup}>
      {(region === "DOMESTIC" ? domesticCountries : foreignCountries).map(({ label, value }) => (
        <TouchableOpacity
          key={value}
          style={[
            styles.radioItem,
            form.COUNTRY === value && styles.radioItemSelected,
          ]}
          onPress={() => handleChange("COUNTRY", value)}
        >
          <Text
            style={[
              styles.radioText,
              form.COUNTRY === value && styles.radioTextSelected,
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
)}

{/* BP 유형 선택 버튼 */}
{region !== "" && (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>BP유형</Text>
    <View style={styles.radioGroup}>
      {(region === "DOMESTIC" ? domesticTypes : foreignTypes).map(({ label, value }) => (
        <TouchableOpacity
          key={value}
          style={[
            styles.radioItem,
            form.BPTYPE === value && styles.radioItemSelected,
          ]}
          onPress={() => handleChange("BPTYPE", value)}
        >
          <Text
            style={[
              styles.radioText,
              form.BPTYPE === value && styles.radioTextSelected,
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      ))}
      
    </View>
  </View>
)}
{/* 지급 조건 선택 버튼 추가 */}
<View style={styles.inputGroup}>
  <Text style={styles.label}>지급 조건</Text>
  <View style={styles.radioGroup}>
    {[
      { label: "T001: 즉시지급", value: "T001" },
      { label: "T030: 30일", value: "T030" },
      { label: "T060: 60일", value: "T060" },
    ].map(({ label, value }) => (
      <TouchableOpacity
        key={value}
        style={[
          styles.radioItem,
          form.PTERM === value && styles.radioItemSelected,
        ]}
        onPress={() => handleChange("PTERM", value)}
      >
        <Text
          style={[
            styles.radioText,
            form.PTERM === value && styles.radioTextSelected,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
</View>


      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>회원가입 완료</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
