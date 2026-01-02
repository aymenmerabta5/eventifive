import QRCode from "qrcode";

/**
 * Generate a QR code as a data URL for use in badge PDFs
 */
export async function generateBadgeQRCodeDataUrl(
  verificationCode: string,
  baseUrl: string,
): Promise<string> {
  const verifyUrl = `${baseUrl}/verify-badge/${verificationCode}`;

  const dataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 200,
    margin: 1,
    color: {
      dark: "#1e293b", // slate-800
      light: "#ffffff",
    },
    errorCorrectionLevel: "M",
  });

  return dataUrl;
}
