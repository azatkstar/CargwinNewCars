import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function UploadPDF() {
  const [file, setFile] = useState(null);
  const [brand, setBrand] = useState('Toyota');
  const [model, setModel] = useState('');
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [parseResult, setParseResult] = useState(null);
  const [error, setError] = useState(null);

  const brands = ['Toyota', 'Lexus', 'Honda', 'Acura', 'Kia', 'Hyundai', 'BMW', 'Mercedes'];

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadResult(null);
    setParseResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BACKEND_URL}/api/admin/lease-programs/import-pdf`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Upload failed');
      }

      setUploadResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleParse = async () => {
    if (!uploadResult) return;

    setParsing(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${BACKEND_URL}/api/admin/lease-programs/parse-from-pdf?pdf_id=${uploadResult.pdf_id}&brand=${brand}&model=${model}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Parse failed');
      }

      setParseResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Upload Lease Program PDF</h1>
        <p className="text-gray-600">Upload and parse bank lease programs (Toyota, Honda, BMW, etc.)</p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Step 1: Upload PDF
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>PDF File</Label>
            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
            />
            <p className="text-sm text-gray-500 mt-1">
              Upload bank lease program PDF (TFS, AHFC, BMW FS, etc.)
            </p>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload & Extract Text'}
          </Button>

          {uploadResult && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription>
                <strong>Upload successful!</strong><br />
                Extracted {uploadResult.char_count} characters from {uploadResult.page_count} pages
                using {uploadResult.extraction_method} method.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Parse Section */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Step 2: Parse Program Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Brand</Label>
                <Select value={brand} onValueChange={setBrand}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map(b => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Model (optional)</Label>
                <Input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g., Camry"
                />
              </div>
            </div>

            <Button
              onClick={handleParse}
              disabled={parsing}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {parsing ? 'Parsing...' : 'Parse Now'}
            </Button>

            {parseResult && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription>
                  <strong>Parse successful!</strong><br />
                  Created program: {parseResult.parsed_program.brand} {parseResult.parsed_program.model}<br />
                  MF: {Object.keys(parseResult.parsed_program.mf).length} terms<br />
                  Residuals: {Object.keys(parseResult.parsed_program.residual).length} terms<br />
                  <a href="/admin/parsed-programs" className="text-blue-600 underline">View all programs →</a>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription>
            <strong>Error:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Extracted Text Preview */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle>Extracted Text Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded text-xs overflow-auto max-h-96">
              {uploadResult.text}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
