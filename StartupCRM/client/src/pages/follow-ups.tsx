import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIComposeModal from "@/components/modals/ai-compose-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Mail,
  Linkedin,
  Clock,
  AlertCircle,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  NotebookPen,
  CheckCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function FollowUps() {
  const [showAIModal, setShowAIModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: followUps, isLoading } = useQuery({
    queryKey: ["/api/follow-ups"],
  });

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  const sendMutation = useMutation({
    mutationFn: async (followUpId: number) => {
      const followUp = followUps.find((f: any) => f.id === followUpId);
      const client = clients?.find((c: any) => c.id === followUp.clientId);
      
      const response = await apiRequest("POST", "/api/messages/send", {
        clientId: followUp.clientId,
        channel: followUp.channel,
        subject: followUp.subject,
        content: followUp.content || `Follow up regarding: ${followUp.subject}`,
        followUpId: followUpId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Follow-up Sent",
          description: "Your follow-up message has been sent successfully",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/follow-ups"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      } else {
        toast({
          title: "Send Failed",
          description: data.error || "Failed to send follow-up",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Send Failed",
        description: error.message || "Failed to send follow-up",
        variant: "destructive",
      });
    },
  });

  const getFilteredFollowUps = () => {
    if (!followUps) return [];
    
    const now = new Date();
    let filtered = followUps;

    switch (activeTab) {
      case "upcoming":
        filtered = followUps.filter((f: any) => 
          f.status === "pending" && new Date(f.scheduledFor) >= now
        );
        break;
      case "overdue":
        filtered = followUps.filter((f: any) => 
          f.status === "pending" && new Date(f.scheduledFor) < now
        );
        break;
      case "sent":
        filtered = followUps.filter((f: any) => f.status === "sent");
        break;
      default:
        break;
    }

    if (searchTerm) {
      filtered = filtered.filter((f: any) => {
        const client = clients?.find((c: any) => c.id === f.clientId);
        return (
          f.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (client?.name && client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (client?.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
    }

    return filtered.sort((a: any, b: any) => 
      new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
    );
  };

  const filteredFollowUps = getFilteredFollowUps();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-green-100 text-green-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getChannelIcon = (channel: string) => {
    return channel === "email" ? Mail : Linkedin;
  };

  const getStatusColor = (followUp: any) => {
    const now = new Date();
    const scheduledDate = new Date(followUp.scheduledFor);
    
    if (followUp.status === "sent") return "text-green-600";
    if (scheduledDate < now) return "text-red-600";
    return "text-slate-600";
  };

  const getStatusText = (followUp: any) => {
    const now = new Date();
    const scheduledDate = new Date(followUp.scheduledFor);
    
    if (followUp.status === "sent") {
      return followUp.sentAt 
        ? `Sent ${formatDistanceToNow(new Date(followUp.sentAt), { addSuffix: true })}`
        : "Sent";
    }
    
    if (scheduledDate < now) {
      return `${formatDistanceToNow(scheduledDate)} overdue`;
    }
    
    return `Due ${formatDistanceToNow(scheduledDate, { addSuffix: true })}`;
  };

  return (
    <>
      <Header
        title="Follow-ups"
        description="Manage and track your client follow-up communications"
        primaryAction={{
          label: "AI Compose",
          onClick: () => setShowAIModal(true),
        }}
      />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search follow-ups..."
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="border border-slate-200">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-3 w-full" />
                          <div className="flex space-x-2">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-20" />
                          </div>
                        </div>
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredFollowUps.length > 0 ? (
              <div className="space-y-4">
                {filteredFollowUps.map((followUp: any) => {
                  const client = clients?.find((c: any) => c.id === followUp.clientId);
                  const ChannelIcon = getChannelIcon(followUp.channel);
                  const isOverdue = activeTab === "overdue";
                  
                  return (
                    <Card 
                      key={followUp.id} 
                      className={`border transition-shadow hover:shadow-md ${
                        isOverdue ? "border-red-200 bg-red-50" : "border-slate-200"
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-slate-600">
                              {client?.name?.charAt(0) || "?"}
                            </span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium text-slate-900">
                                {client?.name || "Unknown Client"}
                              </h3>
                              <span className={`text-xs font-medium ${getStatusColor(followUp)}`}>
                                {getStatusText(followUp)}
                              </span>
                            </div>
                            
                            <p className="text-sm text-slate-600 mt-1">{followUp.subject}</p>
                            
                            {followUp.context && (
                              <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                                {followUp.context}
                              </p>
                            )}
                            
                            <div className="flex items-center space-x-3 mt-3">
                              <Badge variant="secondary" className="text-xs">
                                <ChannelIcon className="w-3 h-3 mr-1" />
                                {followUp.channel === "email" ? "Email" : "LinkedIn"}
                              </Badge>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getPriorityColor(followUp.priority)}`}
                              >
                                {followUp.priority.charAt(0).toUpperCase() + followUp.priority.slice(1)} Priority
                              </Badge>
                              {client?.company && (
                                <span className="text-xs text-slate-500">{client.company}</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            {followUp.status === "pending" && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => sendMutation.mutate(followUp.id)}
                                disabled={sendMutation.isPending}
                              >
                                <NotebookPen className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                {activeTab === "upcoming" && <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />}
                {activeTab === "overdue" && <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />}
                {activeTab === "sent" && <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />}
                
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No {activeTab} follow-ups
                </h3>
                <p className="text-slate-600 mb-6">
                  {activeTab === "upcoming" && "You're all caught up! No upcoming follow-ups scheduled."}
                  {activeTab === "overdue" && "Great! No overdue follow-ups."}
                  {activeTab === "sent" && "No messages sent yet."}
                </p>
                
                {activeTab === "upcoming" && (
                  <Button onClick={() => setShowAIModal(true)}>
                    Schedule Follow-up
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <AIComposeModal open={showAIModal} onOpenChange={setShowAIModal} />
    </>
  );
}
