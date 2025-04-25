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
    }
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <div ref={qrRef} className="mb-4" />
      <button
        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow"
        onClick={handleDownload}
        type="button"
      >
        Download as PNG
      </button>
    </div>
  );
};
