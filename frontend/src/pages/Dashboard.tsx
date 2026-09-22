import { Link } from 'react-router-dom';
import { useKits } from '@/api/routes/KitsAPI';
import { KitSummary } from '@/api/routes/KitsAPI/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePlus2, Sparkles, AlertCircle } from 'lucide-react';
import KitCard from '@/components/kit/cards/KitCard';

const Dashboard = () => {
  const { kits, error, isLoading, mutate } = useKits();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-destructive">
        <AlertCircle className="h-10 w-10 mb-4" />
        <p>Failed to load your kits. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Prep Kits</h1>
          <p className="text-muted-foreground mt-1">Manage your generated interview preparation kits.</p>
        </div>
        <Link to="/kits/new">
          <Button className="gap-2 shadow-lg shadow-primary/20">
            <Sparkles className="h-4 w-4" />
            Generate New Kit
          </Button>
        </Link>
      </div>

      {!kits || kits.length === 0 ? (
        <Card className="glass border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <FilePlus2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No kits generated yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Paste a Job Description and a Company URL to let Trao AI build your personalized interview study plan.
            </p>
            <Link to="/kits/new">
              <Button variant="outline">Create your first kit</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kits.map((kit: KitSummary) => (
            <KitCard 
              key={kit._id} 
              kit={kit} 
              onDeleteSuccess={() => mutate()} 
              onStatusChange={() => mutate()}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
