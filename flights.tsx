import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

interface Flight {
  Carrid: string;
  Connid: number;
  Fldate: string;
  Price: number;
  Currency: string;
  Planetype: string;
  Seatsmax: number;
}

export default function FlightScreen() {
  const router = useRouter();
  const { agentId, agencyName } = useLocalSearchParams();

  const [flights, setFlights] = useState<Flight[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [agencyNameState, setAgencyNameState] = useState(
    typeof agencyName === "string" ? agencyName : ""
  );
  const [agentIdState, setAgentIdState] = useState(
    typeof agentId === "string" ? agentId : ""
  );
  const [seatCount, setSeatCount] = useState("");
  const [isOutbound, setIsOutbound] = useState(true);

  useEffect(() => {
    fetch("http://10.100.0.71:3001/flightData")
      .then((res) => res.json())
      .then((data) => setFlights(data))
      .catch((err) => setError(err.message));
  }, []);

  const handleSeatCountChange = (text: string) => {
    const numericOnly = text.replace(/[^0-9]/g, "");
    setSeatCount(numericOnly);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Select Flight</Text>
        <Ionicons name="filter" size={24} color="gray" />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Travel Agency Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter agency name"
          value={agencyNameState}
          onChangeText={setAgencyNameState}
        />

        <Text style={styles.label}>Travel Agent ID</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter agent ID"
          value={agentIdState}
          onChangeText={setAgentIdState}
        />

        <Text style={styles.label}>Number of Seats</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter number of seats"
          keyboardType="numeric"
          value={seatCount}
          onChangeText={handleSeatCountChange}
        />
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, isOutbound && styles.selectedToggle]}
          onPress={() => setIsOutbound(true)}
        >
          <Text
            style={[styles.toggleText, isOutbound && styles.selectedToggleText]}
          >
            Outbound
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, !isOutbound && styles.selectedToggle]}
          onPress={() => setIsOutbound(false)}
        >
          <Text
            style={[styles.toggleText, !isOutbound && styles.selectedToggleText]}
          >
            Inbound
          </Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.error}>오류: {error}</Text>}

      {isOutbound && flights.length > 0 ? (
        flights.map((flight, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.airline}>항공사: {flight.Carrid}</Text>
              <Text style={styles.price}>
                {flight.Price} {flight.Currency}
              </Text>
            </View>
            <Text style={styles.details}>편명: {flight.Connid}</Text>
            <Text style={styles.details}>
              출발일: {flight.Fldate.split("T")[0]} | 기종: {flight.Planetype} | 좌석:
              {flight.Seatsmax}
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                if (!agencyNameState || !agentIdState || !seatCount) {
                  alert("Please fill in all fields before reserving a flight.");
                  return;
                }

                router.push(
                  `/passenger-details?selectedFlight=${encodeURIComponent(
                    JSON.stringify(flight)
                  )}&agencyName=${encodeURIComponent(
                    agencyNameState
                  )}&agentId=${encodeURIComponent(
                    agentIdState
                  )}&seatCount=${encodeURIComponent(seatCount)}`
                );
              }}
            >
              <Text style={styles.buttonText}>Reserve Flight</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        !isOutbound && (
          <Text style={styles.notice}>🚧 국내선 항공편은 아직 준비 중입니다.</Text>
        )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  inputContainer: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 4,
    color: "#555",
  },
  input: {
    backgroundColor: "#f4f4f4",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  error: {
    color: "red",
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 10,
    overflow: "hidden",
  },
  toggleButton: {
    flex: 1,
    backgroundColor: "#d0d0d0",
    paddingVertical: 10,
    alignItems: "center",
  },
  selectedToggle: {
    backgroundColor: "#007bff",
  },
  toggleText: {
    fontSize: 14,
    color: "#333",
  },
  selectedToggleText: {
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  airline: {
    fontWeight: "bold",
    fontSize: 16,
  },
  price: {
    fontWeight: "bold",
    color: "#007bff",
  },
  details: {
    fontSize: 13,
    color: "#444",
    marginBottom: 4,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
  },
  notice: {
    textAlign: "center",
    fontSize: 14,
    color: "#777",
    marginTop: 20,
  },
});
