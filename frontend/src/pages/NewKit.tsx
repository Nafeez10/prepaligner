import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KitsAPI } from '@/api/routes/KitsAPI';
import { useLLMProviders } from '@/api/routes/LLMAPI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, BrainCircuit } from 'lucide-react';

const NewKit = () => {
  const [url, setUrl] = useState('');
  const [roleName, setRoleName] = useState('');
  const [jd, setJd] = useState('');
  const [days, setDays] = useState('7');
  const [provider, setProvider] = useState('gemini');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { providers, isLoading: isLoadingProviders } = useLLMProviders();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await KitsAPI.create({
        company_url: url,
        role_name: roleName.trim(),
        job_description: jd,
        study_days: parseInt(days, 10),
        provider: provider
      });
      // The backend creates the kit and immediately starts generation.
      // Redirect to the viewer or dashboard. The viewer will show a loading state if it's still generating.
      navigate(`/kits/${response._id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate kit');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generate Prep Kit</h1>
        <p className="text-muted-foreground mt-1">
          Provide the role details and we'll research the company, generate technical and behavioral questions, and build a study schedule.
        </p>
      </div>

      <Card className="bg-card border-border/15 shadow-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Role Requirements</CardTitle>
            <CardDescription>
              Paste the Job Description and the target company's URL.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company_url">Company URL</Label>
              <Input
                id="company_url"
                type="url"
                placeholder="https://www.example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role_name">Role Name</Label>
              <Input
                id="role_name"
                type="text"
                placeholder="e.g., Senior Frontend Engineer"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                The exact job title you're preparing for. This helps us find targeted interview questions.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jd">Job Description</Label>
              <textarea
                id="jd"
                className="flex min-h-[200px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                placeholder="Paste the full job description here..."
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="days">Preparation Timeline (Days)</Label>
              <Input
                id="days"
                type="number"
                min="1"
                max="30"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                We will distribute the topics evenly across this many days.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">AI Model Provider</Label>
              <Select disabled={isLoadingProviders} value={provider} onValueChange={setProvider}>
                <SelectTrigger id="provider" className="w-full bg-background/50">
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Make sure you have added the correct API Key to your .env file for the provider you select.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end border-t border-white/5 pt-6">
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <BrainCircuit className="h-4 w-4 animate-pulse" />
                  Initializing AI Pipeline...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Prep Kit
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default NewKit;
