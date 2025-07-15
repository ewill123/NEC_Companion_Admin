// src/utils/classifyDepartment.jsx
import nlp from "compromise";

export function classifyDepartment(description) {
  const text = description.toLowerCase().replace(/[^\w\s]/g, "");
  const doc = nlp(text);
  const terms = doc.terms().out("array");

  const departmentScores = {
    Logistics: 0,
    Maintenance: 0,
    Security: 0,
    "IT Support": 0,
    "Human Resources": 0,
  };

  const keywordMap = {
    Logistics: [
      "logistics",
      "delivery",
      "truck",
      "vehicle",
      "shipment",
      "transport",
      "driver",
      "cargo",
      "dispatch",
      "fleet",
      "warehouse",
      "load",
      "unload",
      "courier",
      "package",
      "freight",
      "route",
      "shipping",
      "tracking",
      "pallet",
      "van",
      "carrier",
      "consignment",
      "transit",
      "distribution",
      "inventory",
      "parcel",
      "pickup",
      "dropoff",
    ],
    Maintenance: [
      "light",
      "power",
      "electric",
      "generator",
      "repair",
      "fix",
      "broken",
      "plumbing",
      "air conditioning",
      "ac",
      "equipment",
      "machine",
      "wiring",
      "bulb",
      "switch",
      "pipe",
      "valve",
      "heater",
      "cooler",
      "fan",
      "technician",
      "fault",
      "engine",
      "pump",
      "service",
    ],
    Security: [
      "security",
      "violence",
      "fighting",
      "fight",
      "riot",
      "chaos",
      "assault",
      "attack",
      "threat",
      "danger",
      "theft",
      "intrusion",
      "alarm",
      "guard",
      "surveillance",
      "camera",
      "incident",
      "patrol",
      "emergency",
      "checkpoint",
      "unauthorized",
      "intruder",
      "harassment",
      "brawl",
      "disturbance",
      "police",
    ],
    "IT Support": [
      "computer",
      "system",
      "internet",
      "server",
      "network",
      "software",
      "hardware",
      "login",
      "password",
      "bug",
      "error",
      "crash",
      "email",
      "support",
      "printer",
      "wifi",
      "connection",
      "update",
      "install",
      "configuration",
      "technical",
      "helpdesk",
      "remote",
      "database",
      "firewall",
    ],
    "Human Resources": [
      "salary",
      "staff",
      "employee",
      "hr",
      "payroll",
      "hiring",
      "recruit",
      "vacancy",
      "benefits",
      "leave",
      "absence",
      "training",
      "performance",
      "evaluation",
      "contract",
      "promotion",
      "discipline",
      "resignation",
      "termination",
      "recruitment",
      "attendance",
      "overtime",
      "welfare",
      "career",
      "appraisal",
    ],
  };

  for (const [department, keywords] of Object.entries(keywordMap)) {
    for (const word of terms) {
      for (const keyword of keywords) {
        if (word.includes(keyword)) {
          departmentScores[department]++;
        }
      }
    }
  }

  const bestMatch = Object.entries(departmentScores).reduce((a, b) =>
    b[1] > a[1] ? b : a
  );

  return bestMatch[1] > 0 ? bestMatch[0] : null;
}
