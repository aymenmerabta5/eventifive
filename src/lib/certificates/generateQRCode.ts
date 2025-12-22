import QRCode from "qrcode";

/**
 * Generate a QR code as a data URL for use in PDFs
 */
export async function generateQRCodeDataUrl(
  verificationCode: string,
  baseUrl: string
): Promise<string> {
  const verifyUrl = `${baseUrl}/verify/${verificationCode}`;

  const dataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 200,
    margin: 1,
    color: {
      dark: "#1a365d",
      light: "#FFFEF7",
    },
    errorCorrectionLevel: "M",
  });

  return dataUrl;
}
