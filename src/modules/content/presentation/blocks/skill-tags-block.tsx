import { Badge } from "@/components/ui/badge";

interface SkillGroup {
  category: string;
  skills: string[];
}

interface SkillTagsBlockProps {
  content: Record<string, unknown>;
}

export function SkillTagsBlock({ content }: SkillTagsBlockProps) {
  const groups = (content["groups"] as SkillGroup[]) || [];

  if (groups.length === 0) return null;

  return (
    <div className="space-y-4">
      {groups.map((group, idx) => (
        <div key={idx} className="space-y-2">
          <h4 className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
            {group.category}
          </h4>
          <div className="flex flex-wrap gap-2">
            {group.skills.map((skill, sIdx) => (
              <Badge key={sIdx} variant="secondary" size="md">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
