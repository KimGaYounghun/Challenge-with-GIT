// index.js (proxy server)

const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const { XMLParser } = require("fast-xml-parser");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const username = "LSYN-A-04";
const password = "Map135135*";
const auth = Buffer.from(`${username}:${password}`).toString("base64");
const headers = {
  Authorization: `Basic ${auth}`,
  Accept: "application/xml",
};

// ✈ 항공편 목록 조회
app.get("/flightData", async (req, res) => {
  try {
    const response = await fetch("http://bgissap1.bgissap.co.kr:8000/sap/opu/odata/sap/ZFLIGHT_ODATA_SRV/ZSFLIGHT_CL1Set", {
      method: "GET",
      headers,
    });

    const xml = await response.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const jsonData = parser.parse(xml);
    const entries = jsonData.feed?.entry || [];

    const flights = entries.map(entry => {
      const props = entry?.content?.["m:properties"];
      return {
        Carrid: props?.["d:Carrid"] || "",
        Connid: props?.["d:Connid"] || "",
        Fldate: props?.["d:Fldate"] || "",
        Price: props?.["d:Price"] || "",
        Currency: props?.["d:Currency"] || "",
        Planetype: props?.["d:Planetype"] || "",
        Seatsmax: props?.["d:Seatsmax"] || "",
      };
    });

    res.json(flights);
  } catch (error) {
    console.error("SAP 요청 실패:", error.message);
    res.status(500).send("SAP 요청 실패: " + error.message);
  }
});

// 🧾 BP 목록 조회
app.get("/bp", async (req, res) => {
  try {
    const response = await fetch("http://bgissap1.bgissap.co.kr:8000/sap/opu/odata/sap/ZC103SG_BPMANAGER_SRV/MANAGEBPSet", {
      method: "GET",
      headers,
    });

    const xml = await response.text();
const parser = new XMLParser({ ignoreAttributes: false });
const jsonData = parser.parse(xml);
const rawEntry = jsonData.feed?.entry;
const entries = Array.isArray(rawEntry) ? rawEntry : rawEntry ? [rawEntry] : [];

const bpList = entries.map(entry => {
  const props = entry?.content?.["m:properties"];
  return {
    BPID: props?.["d:Bpid"] || "",
    PW: props?.["d:Pw"] || "",
    NAME: props?.["d:Name"] || "",
    EMAIL: props?.["d:Email"] || "",
    PHONE: props?.["d:Phome"] || "",
    BRNUM: props?.["d:Brnum"] || "",
    COUNTRY: props?.["d:Country"] || "",
    BPTYPE: props?.["d:Bptype"] || "",
    PTERM: props?.["d:Pterm"] || "",
  };
});


    res.json(bpList);
  } catch (error) {
    console.error("BP 목록 조회 실패:", error.message);
    res.status(500).send("BP 목록 조회 실패: " + error.message);
  }
});
// 📝 BP 데이터 생성
app.post("/bp", async (req, res) => {
  const bpData = req.body;

  try {
    const response = await fetch("http://bgissap1.bgissap.co.kr:8000/sap/opu/odata/sap/ZC103SG_BPMANAGER_SRV/MANAGEBPSet", {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
        "X-Requested-With": "X",
      },
      body: JSON.stringify({
        Bpid: bpData.BPID,
        Pw: bpData.PW,
        Name: bpData.NAME,
        Email: bpData.EMAIL,
        Phone: bpData.PHOME,
        Brnum: bpData.BRNUM,
        Country: bpData.COUNTRY,
        Bptype: bpData.BPTYPE,
        Pterm: bpData.PTERM,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SAP CREATE 요청 실패: ${response.statusText}, ${errorText}`);
    }

    res.status(201).json({ message: "BP 데이터 생성 완료" });
  } catch (error) {
    console.error("BP 데이터 생성 중 오류 발생:", error.message);
    res.status(500).send("BP 데이터 생성 실패: " + error.message);
  }
});

// 서버 실행 (기존 유지)
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
