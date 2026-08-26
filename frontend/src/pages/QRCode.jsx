import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { FaDownload, FaShareAlt, FaExternalLinkAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const QRCode = () => {
  const { business } = useAuth();
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (business && business.slug) {
      setQrUrl(`${window.location.origin}/listing/${(business.category || 'uncategorized').toLowerCase().replace(/\s+/g, '-')}/${business.slug}/${(business.city || 'unknown').toLowerCase().replace(/\s+/g, '-')}`);
    }
  }, [business]);

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${business?.slug || 'business'}-qrcode.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success('QR Code downloaded!');
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const shareLink = async () => {
    if (navigator.share && qrUrl) {
      try {
        await navigator.share({
          title: business?.name || 'My Business Card',
          url: qrUrl,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(qrUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  if (!business || !business.slug) {
    return (
      <div className="text-center py-12 bg-white rounded-xl">
        <p className="text-gray-500">Please complete your business profile first to generate QR code.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">QR Code</h2>
        <p className="text-gray-600">Download and share your business card QR code</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex flex-col items-center space-y-6">
          <div className="p-8 bg-white rounded-2xl shadow-lg">
            <QRCodeSVG id="qr-code" value={qrUrl} size={200} level="H" />
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800">{business.name}</h3>
            <a
              href={qrUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 hover:underline mt-1 inline-block"
            >
              {qrUrl}
            </a>
          </div>

          <div className="flex gap-4 flex-wrap justify-center">
            <a
              href={qrUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <FaExternalLinkAlt />
              Open Card
            </a>
            <button
              onClick={downloadQR}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <FaDownload />
              Download PNG
            </button>
            <button
              onClick={shareLink}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              <FaShareAlt />
              Share Link
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-sm p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">How to use your QR Code</h3>
        <ul className="space-y-2 text-indigo-100">
          <li>• Print it on business cards, flyers, or brochures</li>
          <li>• Display it at your storefront or reception</li>
          <li>• Add it to your email signature</li>
          <li>• Share it on social media</li>
        </ul>
      </div>
    </div>
  );
};

export default QRCode;
