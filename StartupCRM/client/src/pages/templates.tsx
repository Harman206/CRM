import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import TemplateModal from "@/components/modals/template-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Mail,
  Linkedin,
  FileText,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Templates() {
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["/api/templates"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (templateId: number) => {
      const response = await apiRequest("DELETE", `/api/templates/${templateId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Template Deleted",
        description: "Template has been removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete template",
        variant: "destructive",
      });
    },
  });

  const filteredTemplates = templates?.filter((template: any) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = (templateId: number) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteMutation.mutate(templateId);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "follow-up":
        return "bg-blue-100 text-blue-800";
      case "introduction":
        return "bg-green-100 text-green-800";
      case "proposal":
        return "bg-purple-100 text-purple-800";
      case "check-in":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getChannelIcon = (channel: string) => {
    if (channel === "email") return Mail;
    if (channel === "linkedin") return Linkedin;
    return FileText; // for "both"
  };

  const getChannelText = (channel: string) => {
    if (channel === "email") return "Email";
    if (channel === "linkedin") return "LinkedIn";
    return "Both Channels";
  };

  return (
    <>
      <Header
        title="Templates"
        description="Create and manage your message templates"
        primaryAction={{
          label: "Create Template",
          onClick: () => setShowTemplateModal(true),
        }}
      />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border border-slate-200">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <Skeleton className="h-8 w-8" />
                    </div>
                    <Skeleton className="h-20 w-full" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template: any) => {
              const ChannelIcon = getChannelIcon(template.channel);
              
              return (
                <Card key={template.id} className="border border-slate-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-slate-900 truncate">
                          {template.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getCategoryColor(template.category)}`}
                          >
                            {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <ChannelIcon className="w-3 h-3 mr-1" />
                            {getChannelText(template.channel)}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(template.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {template.subject && (
                      <div className="mb-3">
                        <p className="text-xs text-slate-500 mb-1">Subject:</p>
                        <p className="text-sm font-medium text-slate-700 line-clamp-1">
                          {template.subject}
                        </p>
                      </div>
                    )}

                    <div className="mb-4">
                      <p className="text-xs text-slate-500 mb-1">Content:</p>
                      <div className="bg-slate-50 rounded-lg p-3 max-h-24 overflow-hidden">
                        <p className="text-sm text-slate-700 line-clamp-3">
                          {template.content}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>
                        Created {new Date(template.createdAt).toLocaleDateString()}
                      </span>
                      <Button variant="outline" size="sm">
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchTerm ? "No templates found" : "No templates yet"}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm 
                ? "Try adjusting your search terms" 
                : "Create your first template to streamline your messaging"
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowTemplateModal(true)}>
                Create Your First Template
              </Button>
            )}
          </div>
        )}
      </main>

      <TemplateModal 
        open={showTemplateModal} 
        onOpenChange={setShowTemplateModal} 
      />
    </>
  );
}
