import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { MessageCircle, Send } from 'lucide-react';

const TalkToSpecialist = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', question: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Mock submission
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
    }, 2000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl z-40 flex items-center gap-2"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="text-sm font-semibold">Chat with Specialist</span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Talk to a Specialist</DialogTitle>
            <p className="text-sm text-gray-600">We'll call you back within 15 minutes</p>
          </DialogHeader>

          {submitted ? (
            <div className="text-center py-8">
              <Send className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="font-semibold">Message sent! We'll call you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input placeholder="Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <Input type="tel" placeholder="Phone" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <Textarea placeholder="Your question" rows={3} value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} />
              <Button type="submit" className="w-full bg-blue-600">Send Message</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TalkToSpecialist;