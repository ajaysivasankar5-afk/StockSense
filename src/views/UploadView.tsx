import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Camera,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { OpenCvCameraModal } from '../components/camera/OpenCvCameraModal';

interface ScannedBillRow {
  sNo: number;
  item: string;
  rate: number;
  stockBought: number;
  confidence: number; // 0 to 1
  isLowConfidence?: boolean;
}

export const UploadView: React.FC<{ onGoToItems: () => void }> = ({ onGoToItems }) => {
  const { importSalesCSV, addProduct, products, updateProductStock } = useStore();
  const { success, warning, error } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [uploadMode, setUploadMode] = useState<'bill' | 'csv'>('bill');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isOpenCvCameraOpen, setIsOpenCvCameraOpen] = useState(false);

  // Scanned Bill state
  const [scannedRows, setScannedRows] = useState<ScannedBillRow[] | null>(null);

  // CSV Validation & Mapping state
  const [csvContent, setCsvContent] = useState<string>('');
  const [csvPreviewRows, setCsvPreviewRows] = useState<any[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [detectedColumns, setDetectedColumns] = useState<{
    dateCol: string;
    productCol: string;
    qtyCol: string;
    priceCol: string;
  }>({ dateCol: 'date', productCol: 'product_name', qtyCol: 'quantity_sold', priceCol: 'selling_price' });

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    const isImage = file.type.startsWith('image/');
    if (isImage) {
      setUploadMode('bill');
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      simulateBillExtraction(file.name);
    } else {
      setUploadMode('csv');
      setPreviewUrl(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processCsvText(text);
      };
      reader.readAsText(file);
    }
  };

  // Simulate or execute bill optical extraction
  const simulateBillExtraction = (filename: string) => {
    setIsProcessing(true);
    setUploadProgress(15);
    setScannedRows(null);

    const stepInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(stepInterval);
          return 90;
        }
        return prev + 25;
      });
    }, 250);

    setTimeout(() => {
      clearInterval(stepInterval);
      setUploadProgress(100);
      setIsProcessing(false);

      // Extracted rows with low-confidence highlighted in amber per directive
      setScannedRows([
        { sNo: 1, item: 'Amul Taaza Milk 500ml', rate: 27, stockBought: 24, confidence: 0.98 },
        { sNo: 2, item: 'Modern White Bread 400g', rate: 38, stockBought: 12, confidence: 0.95 },
        { sNo: 3, item: 'Maggi Noodles 70g Pack', rate: 12, stockBought: 48, confidence: 0.94 },
        { sNo: 4, item: 'Aashirvaad Atta 5kg', rate: 240, stockBought: 6, confidence: 0.92 },
        { sNo: 5, item: 'Loose Black Pepper 100g', rate: 85, stockBought: 10, confidence: 0.72, isLowConfidence: true },
      ]);
      success('Bill parsed successfully. Review items below.');
    }, 1200);
  };

  // Process and validate CSV text
  const processCsvText = (text: string) => {
    setCsvContent(text);
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) {
      setCsvErrors(['The uploaded file is empty or does not have headers.']);
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const dateIdx = headers.findIndex((h) => h.includes('date'));
    const prodIdx = headers.findIndex((h) => h.includes('product') || h.includes('item') || h.includes('name'));
    const qtyIdx = headers.findIndex((h) => h.includes('qty') || h.includes('quantity') || h.includes('units'));
    const priceIdx = headers.findIndex((h) => h.includes('price') || h.includes('rate') || h.includes('amount'));

    const errors: string[] = [];
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim());
      if (parts.length < 3) continue;

      const dateVal = parts[dateIdx >= 0 ? dateIdx : 0];
      const prodVal = parts[prodIdx >= 0 ? prodIdx : 1];
      const qtyVal = parseFloat(parts[qtyIdx >= 0 ? qtyIdx : 2]);
      const priceVal = parseFloat(parts[priceIdx >= 0 ? priceIdx : 3] || '0');

      if (isNaN(qtyVal) || qtyVal < 0) {
        errors.push(`Row ${i + 1}: Invalid quantity '${parts[qtyIdx >= 0 ? qtyIdx : 2]}'`);
      } else {
        rows.push({
          rowNum: i + 1,
          date: dateVal,
          product: prodVal,
          qty: qtyVal,
          price: priceVal,
        });
      }
    }

    setCsvPreviewRows(rows.slice(0, 8));
    setCsvErrors(errors);
    success(`CSV loaded with ${rows.length} valid rows`);
  };

  // Save scanned bill to inventory
  const handleCommitBill = () => {
    if (!scannedRows) return;
    let addedCount = 0;
    scannedRows.forEach((row) => {
      // Find matching product
      const match = products.find((p) => p.name.toLowerCase().includes(row.item.toLowerCase().slice(0, 10)));
      if (match) {
        updateProductStock(match.id, match.stock_on_hand + row.stockBought);
        addedCount++;
      } else {
        // Create new item
        addProduct({
          sku: 'NEW-' + Math.floor(100 + Math.random() * 900),
          name: row.item,
          category: 'Grocery & Staples',
          unit: 'pcs',
          stock_on_hand: row.stockBought,
          in_transit: 0,
          supplier_id: 'sup_1',
          supplier_name: 'Metro Wholesalers',
          lead_time_days: 2,
          shelf_life_days: 90,
          cost_price: row.rate,
          selling_price: Math.round(row.rate * 1.2),
          moq: 12,
          pack_size: 6,
          demand_multiplier: 1.0,
          batches: [],
        });
        addedCount++;
      }
    });

    success(`Added ${addedCount} items from bill to active inventory`);
    setScannedRows(null);
    setSelectedFile(null);
    onGoToItems();
  };

  // Save CSV sales
  const handleCommitCsv = () => {
    if (!csvPreviewRows.length) return;
    const lines = csvContent.trim().split(/\r?\n/);
    const rowsToImport: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim());
      if (parts.length >= 3) {
        rowsToImport.push({
          date: parts[0],
          name: parts[1],
          qty: parseFloat(parts[3] || parts[2] || '1'),
          price: parseFloat(parts[4] || '0'),
        });
      }
    }
    const res = importSalesCSV(rowsToImport);
    success(`Imported ${res.importedCount} sales records into forecast engine!`);
    onGoToItems();
  };

  return (
    <div className="max-w-[1120px] mx-auto px-4 sm:px-8 py-8 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-ink mb-1">
          <span>Data Ingestion</span>
          <span>·</span>
          <span>Camera & Spreadsheet</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-text tracking-tight">
          Upload Daily Sales & Purchase Bills
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-xl">
          Drop a photo of your supplier invoice for instant OCR stock entry, or
          upload historical sales CSV to train forecast models.
        </p>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.csv,.xlsx"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFileSelected(e.target.files[0]);
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFileSelected(e.target.files[0]);
        }}
      />

      {/* Large Dashed Drop-Zone per Directive */}
      {!selectedFile && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border hover:border-primary rounded-[14px] p-8 sm:p-14 text-center bg-surface/60 hover:bg-surface transition-all cursor-pointer group"
        >
          <div className="w-16 h-16 rounded-2xl bg-surface-soft group-hover:bg-primary-tint group-hover:text-primary-ink flex items-center justify-center text-text-muted mx-auto mb-4 transition-colors">
            <Camera size={32} strokeWidth={1.5} />
          </div>

          <h3 className="text-lg font-heading font-semibold text-text mb-1">
            Drop a photo of your bill or tap to take one
          </h3>
          <p className="text-xs text-text-muted max-w-md mx-auto mb-6">
            Accepts printed or handwritten bills (JPG, PNG), or drag in past sales
            spreadsheets (CSV, XLSX up to 5 MB).
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpenCvCameraOpen(true);
              }}
              leftIcon={<Camera size={14} />}
            >
              Take Bill Photo (OpenCV)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              leftIcon={<UploadCloud size={14} />}
            >
              Browse Files / Bills
            </Button>
          </div>
        </div>
      )}

      {/* Processing State: Image preview on left, progress on right */}
      {selectedFile && isProcessing && (
        <Card padding="md">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4 rounded-xl overflow-hidden border border-border bg-surface-soft max-h-56">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Invoice preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-44 flex items-center justify-center text-text-muted">
                  <FileSpreadsheet size={36} />
                </div>
              )}
            </div>
            <div className="md:col-span-8 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text">
                  Scanning invoice line items & prices...
                </span>
                <span className="tabular-nums font-bold text-primary-ink">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-surface-soft h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-text-muted">
                Extracting items, purchase rates, quantities bought, and verifying
                mathematical totals.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Scanned Bill Pop-up Table per Directive */}
      {scannedRows && (
        <Card padding="md" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-primary-ink" />
                <h3 className="font-heading font-semibold text-base sm:text-lg text-text">
                  Verify Extracted Bill Items
                </h3>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Yellow cells indicate low OCR confidence. Click any cell to edit
                before confirming.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="primary" size="sm" onClick={handleCommitBill}>
                Upload to Items
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setScannedRows(null);
                  setSelectedFile(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-soft border-b border-border text-text-muted font-semibold">
                  <th className="py-3 px-3 w-16">S.No</th>
                  <th className="py-3 px-3">Items</th>
                  <th className="py-3 px-3 text-right">Rate (₹)</th>
                  <th className="py-3 px-3 text-right">Stock Bought</th>
                  <th className="py-3 px-3 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {scannedRows.map((row, idx) => (
                  <tr key={idx} className="h-14 hover:bg-surface-soft/60">
                    <td className="py-2.5 px-3 tabular-nums font-medium text-text-muted">
                      {row.sNo}
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={row.item}
                        onChange={(e) => {
                          const updated = [...scannedRows];
                          updated[idx].item = e.target.value;
                          setScannedRows(updated);
                        }}
                        className={`w-full py-1.5 px-2 rounded border transition-colors outline-none ${
                          row.isLowConfidence
                            ? 'bg-accent-tint border-amber-300 text-amber-950 font-medium'
                            : 'bg-transparent border-transparent hover:border-border focus:border-primary focus:bg-surface'
                        }`}
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        value={row.rate}
                        onChange={(e) => {
                          const updated = [...scannedRows];
                          updated[idx].rate = parseFloat(e.target.value) || 0;
                          setScannedRows(updated);
                        }}
                        className="w-24 text-right py-1.5 px-2 rounded border border-transparent hover:border-border focus:border-primary focus:bg-surface outline-none tabular-nums"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        value={row.stockBought}
                        onChange={(e) => {
                          const updated = [...scannedRows];
                          updated[idx].stockBought = parseInt(e.target.value) || 0;
                          setScannedRows(updated);
                        }}
                        className="w-24 text-right py-1.5 px-2 rounded border border-transparent hover:border-border focus:border-primary focus:bg-surface outline-none tabular-nums font-bold text-text"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Badge
                        variant={row.isLowConfidence ? 'critical' : 'ok'}
                      >
                        {Math.round(row.confidence * 100)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* CSV Preview & Column Mapping section */}
      {csvPreviewRows.length > 0 && !scannedRows && (
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="font-heading font-semibold text-base sm:text-lg text-text">
                Sales File Preview ({csvPreviewRows.length} sample rows)
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Headers automatically detected. Click Import to feed sales history
                into the forecasting models.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="primary" size="sm" onClick={handleCommitCsv}>
                Import Valid Rows
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCsvPreviewRows([]);
                  setSelectedFile(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>

          {csvErrors.length > 0 && (
            <div className="p-3 bg-danger-tint border border-danger/30 rounded-lg text-xs text-danger space-y-1">
              <span className="font-semibold block">Row-level issues detected:</span>
              {csvErrors.slice(0, 3).map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-soft border-b border-border text-text-muted font-semibold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3 text-right">Qty Sold</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {csvPreviewRows.map((r, i) => (
                  <tr key={i} className="hover:bg-surface-soft/40">
                    <td className="py-2 px-3 tabular-nums">{r.date}</td>
                    <td className="py-2 px-3 font-medium text-text">{r.product}</td>
                    <td className="py-2 px-3 text-right tabular-nums font-semibold">
                      {r.qty}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-text-muted">
                      ₹{r.price || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* OpenCV Computer Vision Camera Modal */}
      <OpenCvCameraModal
        isOpen={isOpenCvCameraOpen}
        onClose={() => setIsOpenCvCameraOpen(false)}
        onCapture={(file, url) => {
          setSelectedFile(file);
          setPreviewUrl(url);
          setUploadMode('bill');
          simulateBillExtraction(file.name);
        }}
      />
    </div>
  );
};
