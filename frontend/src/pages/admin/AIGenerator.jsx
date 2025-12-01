import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Copy, Sparkles } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function AIGenerator() {
  const [deals, setDeals] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/deals/list?limit=50`);
      const data = await response.json();
      setDeals(data.deals || []);
      
      if (data.deals?.length > 0) {
        setSelectedDeal(data.deals[0].id);
      }
    } catch (err) {
      console.error('Error loading deals:', err);
    }
  };

  const generate = async (mode) => {
    if (!selectedDeal) return;

    setGenerating(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${BACKEND_URL}/api/admin/ai/generate?deal_id=${selectedDeal}&mode=${mode}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const data = await response.json();
      
      if (data.ok) {
        // Format content for display
        let text = '';
        if (typeof data.content === 'string') {
          text = data.content;
        } else if (typeof data.content === 'object') {
          text = JSON.stringify(data.content, null, 2);
        }
        
        setGeneratedContent(text);
      }
    } catch (err) {
      console.error('Generate error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
  };

  const selectedDealData = deals.find(d => d.id === selectedDeal);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-yellow-500" />
          AI Deal Generator
        </h1>
        <p className="text-gray-600">Generate marketing content for deals</p>
      </div>

      {/* Deal Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Deal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Select value={selectedDeal} onValueChange={setSelectedDeal}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a deal" />
              </SelectTrigger>
              <SelectContent>
                {deals.map(deal => (
                  <SelectItem key={deal.id} value={deal.id}>
                    {deal.year} {deal.brand} {deal.model} {deal.trim || ''} - ${deal.calculated_payment?.toFixed(0) || 0}/mo
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedDealData && (
            <div className="bg-gray-50 p-4 rounded text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>Brand: <strong>{selectedDealData.brand}</strong></div>
                <div>Model: <strong>{selectedDealData.model}</strong></div>
                <div>Payment: <strong>${selectedDealData.calculated_payment?.toFixed(0)}/mo</strong></div>
                <div>Drive-off: <strong>${selectedDealData.calculated_driveoff?.toFixed(0)}</strong></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generation Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button
              onClick={() => generate('short')}
              disabled={generating || !selectedDeal}
              variant="outline"
            >
              📱 Short Post
            </Button>

            <Button
              onClick={() => generate('long')}
              disabled={generating || !selectedDeal}
              variant="outline"
            >
              📄 Long Description
            </Button>

            <Button
              onClick={() => generate('cta')}
              disabled={generating || !selectedDeal}
              variant="outline"
            >
              🎯 CTA Variants
            </Button>

            <Button
              onClick={() => generate('seo')}
              disabled={generating || !selectedDeal}
              variant="outline"
            >
              🔍 SEO Package
            </Button>

            <Button
              onClick={() => generate('full')}
              disabled={generating || !selectedDeal}
              className="col-span-2 bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Full Bundle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Output */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Generated Content</span>
            {generatedContent && (
              <Button onClick={copyToClipboard} size="sm" variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={generatedContent || 'Generated content will appear here...'}
            readOnly
            rows={20}
            className="font-mono text-sm"
          />
        </CardContent>
      </Card>
    </div>
  );
}
