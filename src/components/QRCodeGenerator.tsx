import React, { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

interface QRCodeGeneratorProps {
  data: string;
  size: number;
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  data,
  size,
  errorCorrectionLevel,
}) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrInstance = useRef<QRCodeStyling | null>(null);
  const [feedback, setFeedback] = React.useState<string>("");
  const feedbackTimeout = useRef<NodeJS.Timeout | null>(null);

  // Helper to show feedback for 1.5s
  const showFeedback = (msg: string) => {
    setFeedback(msg);
    if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    feedbackTimeout.current = setTimeout(() => setFeedback(""), 1500);
  };

  // Create QRCodeStyling instance only once
  useEffect(() => {
    qrInstance.current = new QRCodeStyling({
      width: size,
      height: size,
      type: "svg",
      data: data,
      qrOptions: {
        errorCorrectionLevel: errorCorrectionLevel,
      },
      dotsOptions: {
        color: "#222",
        type: "rounded",
      },
      backgroundOptions: {
        color: "#fff",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 10,
      },
    });
    if (qrRef.current) {
      qrRef.current.innerHTML = "";
      qrInstance.current.append(qrRef.current);
    }
    // eslint-disable-next-line
  }, []); // only on mount

  // Update QR code when props change
  useEffect(() => {
    if (qrInstance.current) {
      qrInstance.current.update({
        width: size,
        height: size,
        data: data,
        qrOptions: { errorCorrectionLevel },
      });
      if (qrRef.current) {
        qrRef.current.innerHTML = "";
        qrInstance.current.append(qrRef.current);
      }
    }
  }, [data, size, errorCorrectionLevel]);

  // Download as PNG
  const handleDownload = () => {
    if (qrInstance.current) {
      qrInstance.current.download({ extension: "png" });
      showFeedback("Zapisano!");
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (qrInstance.current) {
      // Get image as Blob
      const blob = await qrInstance.current.getRawData("png");
      if (blob && blob instanceof Blob) {
        try {
          await navigator.clipboard.write([
            new window.ClipboardItem({ [blob.type]: blob })
          ]);
          showFeedback("Skopiowano!");
        } catch (err) {
          // No alert: silent fail
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <div ref={qrRef} className="mb-4" />
      <div className="flex gap-4">
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow"
          onClick={handleDownload}
          type="button"
        >
          Save
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow"
          onClick={handleCopy}
          type="button"
        >
          Copy
        </button>
      </div>
      {feedback && (
        <div className="mt-2 text-green-600 text-sm font-semibold transition-opacity duration-300">
          {feedback}
        </div>
      )}

    </div>
  );
};
