import { useState } from "react";
import { QRCodeGenerator } from "./components/QRCodeGenerator";
import {
  FaGlobe,
  FaUser,
  FaWifi,
  FaCalendarAlt,
  FaEnvelope,
} from "react-icons/fa";

// --- Types ---
type QRType = "url" | "vcard" | "wifi" | "event" | "message";

interface URLForm {
  url: string;
}
interface VCardForm {
  firstName: string;
  lastName: string;
  org: string;
  title: string;
  phone: string;
  email: string;
}
interface WifiForm {
  ssid: string;
  password: string;
  hidden: boolean;
}
interface EventForm {
  summary: string;
  location: string;
  description: string;
  start: string;
  end: string;
}
type MessageFormType = "email" | "sms" | "phone";
interface MessageForm {
  type: MessageFormType;
  email: string;
  subject: string;
  body: string;
  phone: string;
}

type FormsState = {
  url: URLForm;
  vcard: VCardForm;
  wifi: WifiForm;
  event: EventForm;
  message: MessageForm;
};

// --- Data ---
const QR_TYPES: { key: QRType; icon: React.ReactElement; label: string }[] = [
  { key: "url", icon: <FaGlobe />, label: "URL" },
  { key: "vcard", icon: <FaUser />, label: "Contact" },
  { key: "wifi", icon: <FaWifi />, label: "Wi-Fi" },
  { key: "event", icon: <FaCalendarAlt />, label: "Event" },
  { key: "message", icon: <FaEnvelope />, label: "Message" },
];

const ERROR_LEVELS = [
  { label: "Low (7%)", value: "L" },
  { label: "Medium (15%)", value: "M" },
  { label: "Quartile (25%)", value: "Q" },
  { label: "High (30%)", value: "H" },
];

const SIZES = [
  { label: "Small (150x150)", value: 150 },
  { label: "Medium (200x200)", value: 200 },
  { label: "Large (300x300)", value: 300 },
];

// --- Helper ---
function getQRData(type: QRType, form: FormsState[QRType]) {
  switch (type) {
    case "url": {
      return (form as URLForm).url || "";
    }
    case "vcard": {
      const v = form as VCardForm;
      return `BEGIN:VCARD\nVERSION:3.0\nN:${v.lastName};${v.firstName};;;\nFN:${v.firstName} ${v.lastName}\nORG:${v.org}\nTITLE:${v.title}\nTEL:${v.phone}\nEMAIL:${v.email}\nEND:VCARD`;
    }
    case "wifi": {
      const w = form as WifiForm;
      return `WIFI:T:WPA;S:${w.ssid};P:${w.password};H:${
        w.hidden ? "true" : "false"
      };;`;
    }
    case "event": {
      const e = form as EventForm;
      return `BEGIN:VEVENT\nSUMMARY:${e.summary}\nLOCATION:${e.location}\nDESCRIPTION:${e.description}\nDTSTART:${e.start}\nDTEND:${e.end}\nEND:VEVENT`;
    }
    case "message": {
      const m = form as MessageForm;
      if (m.type === "email") {
        return `mailto:${m.email}?subject=${encodeURIComponent(
          m.subject
        )}&body=${encodeURIComponent(m.body)}`;
      } else if (m.type === "sms") {
        return `SMSTO:${m.phone}:${m.body}`;
      } else {
        return `tel:${m.phone}`;
      }
    }
    default:
      return "";
  }
}

// --- Main Component ---
export default function App() {
  const [selectedType, setSelectedType] = useState<QRType>("url");
  const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">(
    "M"
  );
  const [size, setSize] = useState<number>(200);

  const [forms, setForms] = useState<FormsState>({
    url: { url: "https://example.com" },
    vcard: {
      firstName: "",
      lastName: "",
      org: "",
      title: "",
      phone: "",
      email: "",
    },
    wifi: { ssid: "", password: "", hidden: false },
    event: { summary: "", location: "", description: "", start: "", end: "" },
    message: { type: "email", email: "", subject: "", body: "", phone: "" },
  });

  function handleFormChange<T extends QRType, K extends keyof FormsState[T]>(
    type: T,
    field: K,
    value: FormsState[T][K]
  ) {
    setForms((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  }

  // For message type, switch between email, sms, phone
  function handleMsgTypeChange(msgType: MessageFormType) {
    setForms((prev) => ({
      ...prev,
      message: { ...prev.message, type: msgType },
    }));
  }

  const qrData = getQRData(selectedType, forms[selectedType]);

  const isEventDateValid =
    !forms.event.start ||
    !forms.event.end ||
    new Date(forms.event.start) <= new Date(forms.event.end);

  return (
    <div className="min-h-screen w-screen flex justify-center items-center bg-[#14122b]">
      <div
        className="bg-[#232046] rounded-2xl shadow-xl p-4 md:p-8 min-w-[400px] max-w-[1200px] min-h-[700px] flex flex-col md:flex-row items-start mx-auto"
        style={{ columnGap: "5vw" }}
      >
        {/* Left Column: Function selection and input */}
        <div className="md:w-1/2 w-full flex flex-col items-start">
          <h1 className="text-4xl font-bold text-white mb-2 w-full">
            QR Code Generator
          </h1>
          <hr className="my-4 border-[#232046] w-full" />
          {/* Icon row */}
          <div className="flex justify-center md:justify-start gap-6 mb-3 w-full">
            {QR_TYPES.map((type) => (
              <button
                key={type.key}
                className={`text-3xl p-4 rounded-full border-2 transition focus:outline-none ${
                  selectedType === type.key
                    ? "border-blue-500 bg-blue-100 text-[#232046] font-bold"
                    : "border-[#232046] text-white/90 hover:bg-[#232046]/80"
                }`}
                onClick={() => setSelectedType(type.key)}
                aria-label={type.label}
                type="button"
              >
                {type.icon}
              </button>
            ))}
          </div>
          {/* Function name */}
          <div className="text-2xl font-semibold text-white mb-6 w-full text-center md:text-left">
            {QR_TYPES.find((t) => t.key === selectedType)?.label}
          </div>
          {/* Dynamic form */}
          <div className="mb-6 w-full">
            {selectedType === "url" && (
              <div>
                <label className="block font-bold mb-2 text-white" htmlFor="url">
                  Website URL:
                </label>
                <input
                  id="url"
                  className="w-full border rounded p-2"
                  type="url"
                  value={forms.url.url}
                  onChange={(e) =>
                    handleFormChange("url", "url", e.target.value)
                  }
                  placeholder="https://example.com"
                />
              </div>
            )}
            {selectedType === "vcard" && (
              <div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold mb-1 text-white">
                      First Name:
                    </label>
                    <input
                      className="w-full border rounded p-2"
                      value={forms.vcard.firstName}
                      onChange={(e) =>
                        handleFormChange("vcard", "firstName", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-white">
                      Last Name:
                    </label>
                    <input
                      className="w-full border rounded p-2"
                      value={forms.vcard.lastName}
                      onChange={(e) =>
                        handleFormChange("vcard", "lastName", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-bold mb-1 text-white">
                      Organization:
                    </label>
                    <input
                      className="w-full border rounded p-2"
                      value={forms.vcard.org}
                      onChange={(e) =>
                        handleFormChange("vcard", "org", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-bold mb-1 text-white">Title:</label>
                    <input
                      className="w-full border rounded p-2"
                      value={forms.vcard.title}
                      onChange={(e) =>
                        handleFormChange("vcard", "title", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-bold mb-1 text-white">Phone:</label>
                    <input
                      className="w-full border rounded p-2"
                      value={forms.vcard.phone}
                      onChange={(e) =>
                        handleFormChange("vcard", "phone", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-bold mb-1 text-white">Email:</label>
                    <input
                      className="w-full border rounded p-2"
                      value={forms.vcard.email}
                      onChange={(e) =>
                        handleFormChange("vcard", "email", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            )}
            {selectedType === "wifi" && (
              <div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <label className="block font-bold mb-1 text-white">SSID:</label>
                    <input
                      className="w-full border rounded p-2"
                      value={forms.wifi.ssid}
                      onChange={(e) =>
                        handleFormChange("wifi", "ssid", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-bold mb-1 text-white">
                      Password:
                    </label>
                    <input
                      className="w-full border rounded p-2"
                      value={forms.wifi.password}
                      onChange={(e) =>
                        handleFormChange("wifi", "password", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2 flex items-center mt-2">
                    <input
                      id="hidden"
                      type="checkbox"
                      checked={forms.wifi.hidden}
                      onChange={(e) =>
                        handleFormChange("wifi", "hidden", e.target.checked)
                      }
                      className="mr-2"
                    />
                    <label className="font-bold text-white" htmlFor="hidden">
                      Hidden network
                    </label>
                  </div>
                </div>
              </div>
            )}
            {selectedType === "event" && (
              <div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <label className="block font-bold mb-1 text-white">Title:</label>
                    <input
                      className="w-full border rounded p-2"
                      value={forms.event.summary}
                      onChange={(e) =>
                        handleFormChange("event", "summary", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-bold mb-1 text-white">
                      Location:
                    </label>
                    <input
                      className="w-full border rounded p-2"
                      value={forms.event.location}
                      onChange={(e) =>
                        handleFormChange("event", "location", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-bold mb-1 text-white">
                      Description:
                    </label>
                    <input
                      className="w-full border rounded p-2"
                      value={forms.event.description}
                      onChange={(e) =>
                        handleFormChange("event", "description", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-white">Start:</label>
                    <input
                      type="datetime-local"
                      step="900"
                      className="w-full border rounded p-2"
                      value={forms.event.start}
                      onChange={(e) =>
                        handleFormChange("event", "start", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-white">End:</label>
                    <input
                      type="datetime-local"
                      step="900"
                      className="w-full border rounded p-2"
                      value={forms.event.end}
                      onChange={(e) =>
                        handleFormChange("event", "end", e.target.value)
                      }
                    />
                  </div>
                </div>
                {!isEventDateValid && (
                  <p className="text-red-500 text-sm mt-2">
                    Data początkowa nie może być późniejsza niż końcowa.
                  </p>
                )}
              </div>
            )}
            {selectedType === "message" && (
              <div>
                <div className="flex gap-2 mb-2">
                  <button
                    className={`px-3 py-1 rounded ${
                      forms.message.type === "email"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                    onClick={() => handleMsgTypeChange("email")}
                    type="button"
                  >
                    Email
                  </button>
                  <button
                    className={`px-3 py-1 rounded ${
                      forms.message.type === "sms"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                    onClick={() => handleMsgTypeChange("sms")}
                    type="button"
                  >
                    SMS
                  </button>
                  <button
                    className={`px-3 py-1 rounded ${
                      forms.message.type === "phone"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                    onClick={() => handleMsgTypeChange("phone")}
                    type="button"
                  >
                    Phone
                  </button>
                </div>
                {forms.message.type === "email" && (
                  <div>
                    <label className="block font-bold mb-1 text-white">Email:</label>
                    <input
                      className="w-full border rounded p-2 mb-1"
                      value={forms.message.email}
                      onChange={(e) =>
                        handleFormChange("message", "email", e.target.value)
                      }
                    />
                    <label className="block font-bold mb-1 text-white">Subject:</label>
                    <input
                      className="w-full border rounded p-2 mb-1"
                      value={forms.message.subject}
                      onChange={(e) =>
                        handleFormChange("message", "subject", e.target.value)
                      }
                    />
                    <label className="block font-bold mb-1 text-white">Body:</label>
                    <textarea
                      className="w-full border rounded p-2 h-40"
                      value={forms.message.body}
                      onChange={(e) =>
                        handleFormChange("message", "body", e.target.value)
                      }
                    />
                  </div>
                )}
                {forms.message.type === "sms" && (
                  <div>
                    <label className="block font-bold mb-1 text-white">Phone:</label>
                    <input
                      className="w-full border rounded p-2 mb-1"
                      value={forms.message.phone}
                      onChange={(e) =>
                        handleFormChange("message", "phone", e.target.value)
                      }
                    />
                    <label className="block font-bold mb-1 text-white">Message:</label>
                    <textarea
                      className="w-full border rounded p-2 h-40"
                      value={forms.message.body}
                      onChange={(e) =>
                        handleFormChange("message", "body", e.target.value)
                      }
                    />
                  </div>
                )}
                {forms.message.type === "phone" && (
                  <div>
                    <label className="block font-bold mb-1 text-white">Phone:</label>
                    <input
                      className="w-full border rounded p-2"
                      value={forms.message.phone}
                      onChange={(e) =>
                        handleFormChange("message", "phone", e.target.value)
                      }
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Right Column: QR details and code */}
        <div className="md:w-1/2 w-full flex flex-col items-center md:items-start md:mt-20">
          <div className="flex flex-col md:flex-row gap-4 mb-6 w-full">
            <div className="flex-1">
              <label className="block font-bold mb-2 text-white" htmlFor="error-correction">Error Correction:</label>
              <select
                id="error-correction"
                className="w-full border rounded p-2"
                value={errorCorrection}
                onChange={(e) =>
                  setErrorCorrection(e.target.value as "L" | "M" | "Q" | "H")
                }
              >
                {ERROR_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block font-bold mb-2 text-white" htmlFor="qr-size">
                QR Size:
              </label>
              <select
                id="qr-size"
                className="w-full border rounded p-2"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              >
                {SIZES.map((sz) => (
                  <option key={sz.value} value={sz.value}>
                    {sz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* QR Code output */}
          <div className="flex flex-col items-center w-full">
            <QRCodeGenerator
              data={qrData}
              size={size}
              errorCorrectionLevel={errorCorrection}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
