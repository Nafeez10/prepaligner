import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Building2, Target, Loader2 } from 'lucide-react';
import { useDebounceSave } from '@/hooks/useDebounceSave';
import { useParams } from 'react-router-dom';
import { KitsAPI, useKit } from '@/api/routes/KitsAPI';
import { useState, useEffect } from 'react';

import { ManagedKit } from '@/types/kit';
import { RegenerationStates } from '@/api/routes/KitsAPI/types';

interface Props {
  kitData: ManagedKit;
  regenerationStates?: RegenerationStates;
}

const CompanyBriefTab = ({ kitData, regenerationStates }: Props) => {
  const { id } = useParams<{ id: string }>();
  const { mutate, mutateStatus, setOptimisticGenerating } = useKit(id);
  const { triggerSave, isSaving } = useDebounceSave(id, mutate);

  const [summary, setSummary] = useState(kitData?.company_brief?.summary || '');
  const [whatTheyDo, setWhatTheyDo] = useState(kitData?.company_brief?.what_they_do || '');
  const isRegenerating = regenerationStates?.company_brief === 'generating';

  useEffect(() => {
    setSummary(kitData?.company_brief?.summary || '');
    setWhatTheyDo(kitData?.company_brief?.what_they_do || '');
  }, [kitData?.company_brief]);

  if (!kitData || !kitData.company_brief) return null;

  const { role } = kitData;

  const handleChange = (field: 'summary' | 'what_they_do', value: string) => {
    if (field === 'summary') setSummary(value);
    if (field === 'what_they_do') setWhatTheyDo(value);

    // Build the new kitData
    const updatedKitData = {
      ...kitData,
      company_brief: {
        ...kitData.company_brief,
        [field]: value
      }
    };
    triggerSave(updatedKitData);
  };

  const handleRegenerate = async () => {
    if (!id) return;
    try {
      setOptimisticGenerating('company_brief');
      await KitsAPI.regenerateSection(id, 'company_brief', {});
      await mutateStatus(); // Fetch real status
    } catch (e) {
      console.error('Failed to regenerate company brief', e);
      await mutateStatus(); // Revert on error
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Info */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Building2 className="h-5 w-5" />
                <CardTitle>Company Overview</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                <button 
                  onClick={handleRegenerate} 
                  disabled={isRegenerating}
                  className="text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground px-2 py-1 rounded transition-colors flex items-center gap-1"
                >
                  {isRegenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  Regenerate Brief
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-muted-foreground mb-1">Summary</h4>
              <textarea 
                className="w-full bg-transparent border border-transparent hover:border-white/10 focus:border-primary/50 focus:bg-background/50 rounded-md p-2 transition-colors resize-none leading-relaxed min-h-[100px]"
                value={summary}
                disabled={isRegenerating}
                onChange={(e) => handleChange('summary', e.target.value)}
              />
            </div>
            <div>
              <h4 className="font-semibold text-muted-foreground mb-1">What They Do</h4>
              <textarea 
                className="w-full bg-transparent border border-transparent hover:border-white/10 focus:border-primary/50 focus:bg-background/50 rounded-md p-2 transition-colors resize-none leading-relaxed min-h-[100px]"
                value={whatTheyDo}
                disabled={isRegenerating}
                onChange={(e) => handleChange('what_they_do', e.target.value)}
              />
            </div>
            
            <div className="pt-4 border-t border-white/5">
              <h4 className="font-semibold text-muted-foreground mb-2">Sources Researched</h4>
              <ul className="space-y-1">
                {kitData.company_brief.sources.map((src: string, idx: number) => (
                  <li key={idx}>
                    <a href={src} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-400 hover:underline">
                      {new URL(src).hostname} <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Role Info */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary mb-2">
              <Target className="h-5 w-5" />
              <CardTitle>Role Extraction</CardTitle>
            </div>
            <CardDescription>{role.title} ({role.seniority})</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-muted-foreground mb-2">Key Responsibilities</h4>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                {role.responsibilities.map((r: string, i: number) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-white/5">
              <h4 className="font-semibold text-muted-foreground mb-2">Requirements Assessed</h4>
              <div className="space-y-2">
                {role.requirements.map((req: any) => (
                  <div key={req.id} className="p-3 rounded bg-black/20 border border-white/5">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary/80">{req.kind}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${req.priority === 'must' ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>
                        {req.priority}
                      </span>
                    </div>
                    <p>{req.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyBriefTab;
