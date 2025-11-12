import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Upload, FileText, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const DocumentUpload = ({ applicationId }) => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const { getApiClient } = useAuth();

  const docTypes = [
    { id: 'drivers_license', label: "Driver's License", required: true },
    { id: 'paystub', label: 'Recent Paystub', required: true },
    { id: 'proof_of_address', label: 'Proof of Address', required: true },
    { id: 'insurance', label: 'Insurance Card', required: true },
    { id: 'other', label: 'Other', required: false }
  ];

  const handleFileSelect = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('doc_type', docType);
      formData.append('application_id', applicationId);

      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('access_token');

      const response = await fetch(`${BACKEND_URL}/api/applications/${applicationId}/upload-document`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments([...documents, { type: docType, url: data.url, name: file.name }]);
        alert('Document uploaded successfully!');
      }
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Required Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {docTypes.map(docType => {
          const uploaded = documents.find(d => d.type === docType.id);
          return (
            <div key={docType.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                {uploaded ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Upload className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-sm">{docType.label}</p>
                  {uploaded && <p className="text-xs text-gray-500">{uploaded.name}</p>}
                </div>
              </div>
              <div>
                {uploaded ? (
                  <Button size="sm" variant="ghost" onClick={() => setDocuments(documents.filter(d => d.type !== docType.id))}>
                    <X className="w-4 h-4" />
                  </Button>
                ) : (
                  <label>
                    <input type="file" className="hidden" onChange={(e) => handleFileSelect(e, docType.id)} accept="image/*,.pdf" />
                    <Button size="sm" variant="outline" disabled={uploading} asChild>
                      <span>Upload</span>
                    </Button>
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;