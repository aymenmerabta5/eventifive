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
        <Card className="w-full max-w-md mx-auto overflow-hidden border-2">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
            <CardHeader className="text-center pb-2 relative z-10">
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                    <Share2 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Share Event</CardTitle>
                <CardDescription>
                    Share this QR code or link with your attendees
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6 relative z-10">
                <div className="p-4 bg-white rounded-xl shadow-sm border border-border/50">
                    <QRCodeSVG
                        value={eventUrl}
                        size={200}
                        level="H"
                        includeMargin={true}
                        ref={svgRef}
                        className="w-full h-auto"
                    />
                </div>

                <div className="grid w-full gap-2">
                    <Label htmlFor="link" className="text-sm font-semibold text-muted-foreground">
                        Event Link
                    </Label>
                    <div className="flex items-center space-x-2">
                        <Input
                            id="link"
                            value={eventUrl}
                            readOnly
                            className="bg-muted/50 font-mono text-sm h-10"
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
            <CardFooter className="flex justify-center pb-6 relative z-10">
                <Button variant="secondary" className="w-full gap-2" onClick={handleDownloadQRCode}>
                    <Download className="w-4 h-4" />
                    Download QR Code
                </Button>
            </CardFooter>
        </Card>
    );
}