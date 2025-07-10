import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AIComposeModal from "@/components/modals/ai-compose-modal";
import ClientModal from "@/components/modals/client-modal";
import { 
  Users, 
  Clock, 
  Send, 
  TrendingUp,
  Mail,
  Linkedin as LinkedinIcon,
  Plus,
  Calendar,
  FileText,
  Upload,
  Bot,
  MoreVertical,
  NotebookPen
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const [showAIModal, setShowAIModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: upcomingFollowUps, isLoading: followUpsLoading } = useQuery({
    queryKey: ["/api/follow-ups/upcoming"],
  });

  const statCards = [
    {
      title: "Total Clients",
      value: stats?.totalClients || 0,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Pending Follow-ups",
      value: stats?.pendingFollowUps || 0,
      icon: Clock,
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: "Sent This Week",
      value: stats?.sentThisWeek || 0,
      icon: Send,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Response Rate",
      value: `${stats?.responseRate || 0}%`,
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const quickActions = [
    {
      title: "Add New Client",
      icon: Plus,
      color: "text-brand-500",
      onClick: () => setShowClientModal(true),
    },
    {
      title: "Create Template",
      icon: FileText,
      color: "text-purple-500",
      onClick: () => {},
    },
    {
      title: "Schedule Follow-up",
      icon: Calendar,
      color: "text-green-500",
      onClick: () => {},
    },
    {
      title: "Import Contacts",
      icon: Upload,
      color: "text-amber-500",
      onClick: () => {},
    },
  ];

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
    return channel === "email" ? Mail : LinkedinIcon;
  };

  return (
    <>
      <Header
        title="Dashboard"
        description="Manage your client relationships and follow-ups"
        primaryAction={{
          label: "AI Compose",
          onClick: () => setShowAIModal(true),
        }}
        secondaryAction={{
          label: "Add Client",
          onClick: () => setShowClientModal(true),
        }}
      />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.title} className="border border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Follow-ups */}
          <div className="lg:col-span-2">
            <Card className="border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800">Upcoming Follow-ups</h3>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                {followUpsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-start space-x-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-3 w-full" />
                          <div className="flex space-x-2">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-20" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : upcomingFollowUps && upcomingFollowUps.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingFollowUps.slice(0, 5).map((followUp: any) => {
                      const isOverdue = new Date(followUp.scheduledFor) < new Date();
                      const ChannelIcon = getChannelIcon(followUp.channel);
                      
                      return (
                        <div 
                          key={followUp.id} 
                          className={`flex items-start space-x-4 p-4 border rounded-lg hover:bg-slate-50 transition-colors ${
                            isOverdue ? "border-red-200 bg-red-50" : "border-slate-200"
                          }`}
                        >
                          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-slate-600">
                              {followUp.client?.name?.charAt(0) || "?"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-slate-900">
                                {followUp.client?.name || "Unknown Client"}
                              </p>
                              <span className={`text-xs ${isOverdue ? "text-red-600 font-medium" : "text-slate-500"}`}>
                                {isOverdue 
                                  ? `${formatDistanceToNow(new Date(followUp.scheduledFor))} overdue`
                                  : `Due ${formatDistanceToNow(new Date(followUp.scheduledFor), { addSuffix: true })}`
                                }
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{followUp.subject}</p>
                            <div className="flex items-center space-x-3 mt-2">
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
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <NotebookPen className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No upcoming follow-ups scheduled</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => setShowAIModal(true)}
                    >
                      Schedule First Follow-up
                    </Button>
                  </div>
                )}
                
                {upcomingFollowUps && upcomingFollowUps.length > 0 && (
                  <div className="mt-6 text-center">
                    <Button variant="link" className="text-brand-500">
                      View all follow-ups
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & AI Insights */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border border-slate-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {quickActions.map((action) => (
                    <Button
                      key={action.title}
                      variant="ghost"
                      className="w-full justify-between p-3 h-auto border border-slate-200 hover:bg-slate-50"
                      onClick={action.onClick}
                    >
                      <div className="flex items-center">
                        <action.icon className={`mr-3 h-4 w-4 ${action.color}`} />
                        <span className="text-sm font-medium text-slate-700">{action.title}</span>
                      </div>
                      <Plus className="h-4 w-4 text-slate-400" />
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="border border-brand-200 bg-gradient-to-br from-brand-50 to-purple-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Bot className="h-4 w-4 text-brand-500" />
                  <h3 className="text-lg font-semibold text-slate-800">AI Insights</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-white bg-opacity-60 rounded-lg p-4">
                    <p className="text-sm text-slate-700 mb-2">📈 <strong>Response Rate Trend</strong></p>
                    <p className="text-xs text-slate-600">
                      Your LinkedIn messages have 23% higher response rates than email this week.
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-60 rounded-lg p-4">
                    <p className="text-sm text-slate-700 mb-2">⏰ <strong>Optimal Send Times</strong></p>
                    <p className="text-xs text-slate-600">
                      Tuesday 10-11 AM shows highest engagement for your client segment.
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-60 rounded-lg p-4">
                    <p className="text-sm text-slate-700 mb-2">🎯 <strong>Follow-up Recommendation</strong></p>
                    <p className="text-xs text-slate-600">
                      3 clients haven't responded in 5+ days. Consider a different approach.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <AIComposeModal open={showAIModal} onOpenChange={setShowAIModal} />
      <ClientModal open={showClientModal} onOpenChange={setShowClientModal} />
    </>
  );
}
