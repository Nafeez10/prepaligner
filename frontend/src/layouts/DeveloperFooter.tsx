import { AnimatedUnderline } from '@/components/ui/animated-underline';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Briefcase, Code2, Linkedin } from 'lucide-react';
import { SDE_INFO } from '@/utils/constants/sdeInfo';

export const DeveloperFooter = () => {
  return (
    <div className="mt-8 text-center text-sm text-muted-foreground flex items-center justify-center">
      Developed by
      <HoverCard>
        <HoverCardTrigger asChild>
          <a href={SDE_INFO.linkedinUrl} target="_blank" rel="noopener noreferrer" className="ml-2 cursor-pointer outline-none">
            <AnimatedUnderline className="font-semibold text-foreground">
              {SDE_INFO.name}
            </AnimatedUnderline>
          </a>
        </HoverCardTrigger>
        <HoverCardContent side="top" className="w-64 p-4 shadow-lg border-border/20 rounded-xl mb-1">
          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                <Code2 className="h-4 w-4 text-primary" />
                {SDE_INFO.name}
              </h4>
              <a href={SDE_INFO.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#0A66C2] transition-colors" title="LinkedIn Profile">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
            <p className="text-sm flex items-center gap-1.5 font-medium text-foreground">
              <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
              {SDE_INFO.title}
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};
