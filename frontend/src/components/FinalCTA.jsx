import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

export default function FinalCTA() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-to-br from-red-600 to-red-700 text-white">
      <div className="container max-w-5xl mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to get the best lease deal today?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Real bank programs. Transparent pricing. Big savings.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => navigate('/deals')}
            className="bg-white text-red-600 hover:bg-gray-100 px-10 py-6 text-xl font-bold rounded-xl"
          >
            🎯 Find My Deal
          </Button>
          
          <Button
            onClick={() => window.open('https://t.me/SalesAzatAuto', '_blank')}
            variant="outline"
            className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-10 py-6 text-xl font-bold rounded-xl"
          >
            💬 Talk to Expert
          </Button>
        </div>

        <p className="text-sm mt-6 opacity-75">
          No SSN? No credit history? International student? We can help.
        </p>
      </div>
    </section>
  );
}
