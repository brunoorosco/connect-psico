import { useState } from "react";
import { ChevronDown, ChevronRight, FileText, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tutorial, TutorialCategory } from "@/domain/model/tutorial";

interface TutorialSidebarProps {
  categories: TutorialCategory[];
  selectedTutorial: Tutorial | null;
  onSelectTutorial: (tutorial: Tutorial) => void;
}

export function TutorialSidebar({ categories, selectedTutorial, onSelectTutorial }: TutorialSidebarProps) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(["iniciante"]));

  const toggleCategory = (categoryId: string) => {
    const newOpenCategories = new Set(openCategories);
    if (newOpenCategories.has(categoryId)) {
      newOpenCategories.delete(categoryId);
    } else {
      newOpenCategories.add(categoryId);
    }
    setOpenCategories(newOpenCategories);
  };

  return (
    <div className="w-80 bg-background border-r border-border h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Central de Ajuda</h2>
        <p className="text-sm text-muted-foreground">Tutoriais e guias da plataforma</p>
      </div>

      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="p-4 space-y-2">
          {categories.map((category) => (
            <Collapsible
              key={category.id}
              open={openCategories.has(category.id)}
              onOpenChange={() => toggleCategory(category.id)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-2 h-auto"
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {category.tutorials.length}
                    </span>
                  </div>
                  {openCategories.has(category.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-1 mt-1">
                {category.tutorials.map((tutorial) => (
                  <Button
                    key={tutorial.id}
                    variant={selectedTutorial?.id === tutorial.id ? "secondary" : "ghost"}
                    className="w-full justify-start p-2 h-auto text-left"
                    onClick={() => onSelectTutorial(tutorial)}
                  >
                    <div className="flex items-start space-x-2 w-full">
                      <div className="flex-shrink-0 mt-1">
                        {tutorial.videoUrl ? (
                          <Play className="h-3 w-3 text-muted-foreground" />
                        ) : (
                          <FileText className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm leading-tight">
                          {tutorial.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {tutorial.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}