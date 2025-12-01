import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Upload, Copy, Trash2, Image as ImageIcon } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function AdminMedia() {
  const [media, setMedia] = useState([]);
  const [stats, setStats] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BACKEND_URL}/api/admin/media/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      setMedia(data.media || []);
      setStats(data.stats || {});
    } catch (err) {
      console.error('Error loading media:', err);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BACKEND_URL}/api/admin/media/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();

      if (data.ok) {
        setSelectedFile(null);
        loadMedia();
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (mediaId) => {
    if (!confirm('Delete this media file?')) return;

    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${BACKEND_URL}/api/admin/media/${mediaId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      loadMedia();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const copyUrl = (url) => {
    const fullUrl = `${BACKEND_URL}${url}`;
    navigator.clipboard.writeText(fullUrl);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Media Manager</h1>
        <p className="text-gray-600">Upload and manage images for deals</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total_files || 0}</div>
              <div className="text-sm text-gray-600">Total Files</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total_size_mb || 0} MB</div>
              <div className="text-sm text-gray-600">Storage Used</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600">
                {Object.entries(stats.by_type || {}).map(([ext, count]) => (
                  <span key={ext} className="mr-2">{ext}: {count}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload New Media
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            <p className="text-xs text-gray-500 mt-1">
              Allowed: JPG, PNG, SVG, WebP. Max 10MB.
            </p>
          </div>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </CardContent>
      </Card>

      {/* Media List */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Media ({media.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {media.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No media uploaded yet
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {media.map(item => (
                <div key={item.id} className="border rounded p-3 space-y-2">
                  <div className="aspect-video bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                    {item.extension === '.svg' ? (
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    ) : (
                      <img
                        src={`${BACKEND_URL}${item.url}`}
                        alt={item.filename}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="text-gray-400">Error</div>';
                        }}
                      />
                    )}
                  </div>
                  <div className="text-sm font-medium truncate">{item.filename}</div>
                  <div className="text-xs text-gray-500">
                    {(item.size / 1024).toFixed(1)} KB
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyUrl(item.url)}
                      className="flex-1"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy URL
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
