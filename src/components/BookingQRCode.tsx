import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";

interface BookingQRCodeProps {
  bookingLink: string;
  businessName: string;
}

const BookingQRCode = ({ bookingLink, businessName }: BookingQRCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrGenerated, setQrGenerated] = useState(false);
  
  // Always point the QR at the live public booking route (never a preview/localhost URL)
  const origin =
    typeof window !== "undefined" &&
    !/localhost|127\.0\.0\.1|lovableproject\.com|lovable\.app/.test(window.location.hostname)
      ? window.location.origin
      : "https://bojiapp.me";

  const fullUrl = `${origin}/book/${bookingLink}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        fullUrl,
        {
          width: 256,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error) => {
          if (error) {
            console.error("QR Code generation error:", error);
            toast.error("Failed to generate QR code");
          } else {
            setQrGenerated(true);
          }
        }
      );
    }
  }, [fullUrl]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const url = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${businessName.replace(/\s+/g, "-")}-booking-qr.png`;
    link.href = url;
    link.click();
    toast.success("QR code downloaded!");
  };

  const handleShare = async () => {
    if (!canvasRef.current) return;
    
    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current?.toBlob((blob) => {
          if (blob) resolve(blob);
        });
      });

      const file = new File([blob], `${businessName}-qr.png`, {
        type: "image/png",
      });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Book with ${businessName}`,
          text: `Scan to book an appointment with ${businessName}`,
          files: [file],
        });
        toast.success("QR code shared!");
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(fullUrl);
        toast.success("Booking link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share failed:", error);
      toast.error("Failed to share QR code");
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">Booking QR Code</CardTitle>
        <p className="text-sm text-muted-foreground">
          Share this QR code so customers can quickly book appointments
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center p-4 bg-white rounded-lg">
          <canvas ref={canvasRef} />
        </div>
        
        {qrGenerated && (
          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex-1"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground text-center">
          <p className="font-medium mb-1">Booking URL:</p>
          <p className="break-all">{fullUrl}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingQRCode;
