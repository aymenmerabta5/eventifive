import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

interface ShareEventProps {
  eventId: string;
}

export default function ShareEvent({ eventId }: ShareEventProps) {
  const [copied, setCopied] = useState(false);
  const eventUrl = `https://eventifive.com/event/${eventId}`;
  const svgRef = useRef<SVGSVGElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      toast.success("Event link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleDownloadQRCode = () => {
    const svg = svgRef.current;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `event-${eventId}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success("QR Code downloaded");
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <Card className="mx-auto w-full max-w-md overflow-hidden border-2">
      <div className="from-primary/5 to-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent" />
      <CardHeader className="relative z-10 pb-2 text-center">
        <div className="bg-primary/10 mx-auto mb-2 w-fit rounded-full p-3">
          <Share2 className="text-primary h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold">Share Event</CardTitle>
        <CardDescription>
          Share this QR code or link with your attendees
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10 flex flex-col items-center gap-6">
        <div className="border-border/50 rounded-xl border bg-white p-4 shadow-sm">
          <QRCodeSVG
            value={eventUrl}
            size={200}
            level="H"
            includeMargin={true}
            ref={svgRef}
            className="h-auto w-full"
          />
        </div>

        <div className="grid w-full gap-2">
          <Label
            htmlFor="link"
            className="text-muted-foreground text-sm font-semibold"
          >
            Event Link
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id="link"
              value={eventUrl}
              readOnly
              className="bg-muted/50 h-10 font-mono text-sm"
            />
            <Button
              size="icon"
              variant="outline"
              className="h-10 w-10 shrink-0 transition-all duration-200"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="sr-only">Copy</span>
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="relative z-10 flex justify-center pb-6">
        <Button
          variant="secondary"
          className="w-full gap-2"
          onClick={handleDownloadQRCode}
        >
          <Download className="h-4 w-4" />
          Download QR Code
        </Button>
      </CardFooter>
    </Card>
  );
}
