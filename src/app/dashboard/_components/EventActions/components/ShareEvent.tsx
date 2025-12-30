"use client";

import { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  IconShare,
  IconCopy,
  IconCheck,
  IconDownload,
  IconQrcode,
  IconLink,
  IconBrandTwitter,
  IconBrandLinkedin,
  IconBrandWhatsapp,
  IconMail,
} from "@tabler/icons-react";

interface ShareEventProps {
  eventId: string;
}

export default function ShareEvent({ eventId }: ShareEventProps) {
  const [copied, setCopied] = useState(false);
  const [eventUrl, setEventUrl] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);

  // Get the actual URL from window.location.origin on client side
  useEffect(() => {
    const baseUrl = window.location.origin;
    setEventUrl(`${baseUrl}/events/${eventId}`);
  }, [eventId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      toast.success("Event link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
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

  // Social share handlers
  const shareOnTwitter = () => {
    const text = encodeURIComponent("Check out this event!");
    const url = encodeURIComponent(eventUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank"
    );
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(eventUrl);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      "_blank"
    );
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Check out this event: ${eventUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent("Check out this event!");
    const body = encodeURIComponent(
      `I thought you might be interested in this event:\n\n${eventUrl}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  if (!eventUrl) {
    return (
      <div
        className={cn(
          "mx-auto w-full max-w-lg",
          "relative overflow-hidden rounded-2xl border border-border/50",
          "bg-gradient-to-br from-card via-card to-card/80",
          "p-8"
        )}
      >
        <div className="flex items-center justify-center py-12">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-lg",
        "relative overflow-hidden rounded-2xl border border-border/50",
        "bg-gradient-to-br from-card via-card to-card/80"
      )}
    >
      {/* Background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Decorative gradient */}
      <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-gradient-to-br from-primary/15 via-chart-2/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-gradient-to-tr from-chart-3/10 via-accent/10 to-transparent blur-3xl" />

      {/* Header */}
      <div className="relative border-b border-border/50 p-6 text-center">
        <div
          className={cn(
            "mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl",
            "bg-gradient-to-br from-primary/10 to-chart-2/10",
            "ring-1 ring-border/50"
          )}
        >
          <IconShare className="size-7 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Share Event
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Share this QR code or link with your attendees
        </p>
      </div>

      {/* Content */}
      <div className="relative space-y-6 p-6">
        {/* QR Code Section */}
        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              "relative rounded-2xl border border-border/50 bg-white p-5",
              "shadow-lg shadow-primary/5",
              "transition-transform duration-300 hover:scale-[1.02]"
            )}
          >
            {/* Corner accents */}
            <div className="absolute -left-px -top-px size-4 rounded-tl-2xl border-l-2 border-t-2 border-primary" />
            <div className="absolute -right-px -top-px size-4 rounded-tr-2xl border-r-2 border-t-2 border-primary" />
            <div className="absolute -bottom-px -left-px size-4 rounded-bl-2xl border-b-2 border-l-2 border-primary" />
            <div className="absolute -bottom-px -right-px size-4 rounded-br-2xl border-b-2 border-r-2 border-primary" />

            <QRCodeSVG
              value={eventUrl}
              size={180}
              level="H"
              includeMargin={false}
              ref={svgRef}
              className="h-auto w-full"
              fgColor="#1a1a2e"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <IconQrcode className="size-4" />
            <span>Scan to open event page</span>
          </div>
        </div>

        {/* Link Section */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <IconLink className="size-4 text-primary" />
            Event Link
          </Label>
          <div className="flex items-center gap-2">
            <Input
              value={eventUrl}
              readOnly
              className={cn(
                "h-11 bg-muted/30 font-mono text-sm",
                "border-border/50 focus:border-primary/50 focus:ring-primary/20"
              )}
            />
            <Button
              size="icon"
              variant="outline"
              className={cn(
                "size-11 shrink-0",
                "border-border/50 transition-all duration-200",
                copied && "border-primary/50 bg-primary/10"
              )}
              onClick={handleCopy}
            >
              {copied ? (
                <IconCheck className="size-4 text-primary" />
              ) : (
                <IconCopy className="size-4" />
              )}
              <span className="sr-only">Copy</span>
            </Button>
          </div>
        </div>

        {/* Social Share */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">
            Share on Social
          </Label>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={shareOnTwitter}
              className={cn(
                "size-10 border-border/50",
                "hover:border-[#1DA1F2]/50 hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]"
              )}
            >
              <IconBrandTwitter className="size-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={shareOnLinkedIn}
              className={cn(
                "size-10 border-border/50",
                "hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]"
              )}
            >
              <IconBrandLinkedin className="size-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={shareOnWhatsApp}
              className={cn(
                "size-10 border-border/50",
                "hover:border-[#25D366]/50 hover:bg-[#25D366]/10 hover:text-[#25D366]"
              )}
            >
              <IconBrandWhatsapp className="size-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={shareViaEmail}
              className={cn(
                "size-10 border-border/50",
                "hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
              )}
            >
              <IconMail className="size-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative border-t border-border/50 p-6">
        <Button
          variant="secondary"
          className={cn(
            "w-full gap-2",
            "bg-secondary hover:bg-secondary/80",
            "transition-all duration-200"
          )}
          onClick={handleDownloadQRCode}
        >
          <IconDownload className="size-4" />
          Download QR Code
        </Button>
      </div>
    </div>
  );
}
