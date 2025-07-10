import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import ClientModal from "@/components/modals/client-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Mail,
  Linkedin,
  Phone,
  Building,
  MoreVertical,
  Search,
  Filter,
  Edit,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Clients() {
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients, isLoading } = useQuery({
    queryKey: ["/api/clients"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (clientId: number) => {
      const response = await apiRequest("DELETE", `/api/clients/${clientId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Client Deleted",
        description: "Client has been removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete client",
        variant: "destructive",
      });
    },
  });

  const filteredClients = clients?.filter((client: any) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setShowClientModal(true);
  };

  const handleDelete = (clientId: number) => {
    if (confirm("Are you sure you want to delete this client?")) {
      deleteMutation.mutate(clientId);
    }
  };

  const handleCloseModal = () => {
    setShowClientModal(false);
    setEditingClient(null);
  };

  return (
    <>
      <Header
        title="Clients"
        description="Manage your client contacts and information"
        primaryAction={{
          label: "Add Client",
          onClick: () => setShowClientModal(true),
        }}
      />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search clients..."
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

        {/* Clients Grid */}
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
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="flex space-x-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredClients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client: any) => (
              <Card key={client.id} className="border border-slate-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 truncate">
                        {client.name}
                      </h3>
                      {client.company && (
                        <p className="text-sm text-slate-600 truncate">{client.company}</p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(client)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(client.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-slate-600">
                      <Mail className="h-4 w-4 mr-2 text-slate-400" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    
                    {client.phone && (
                      <div className="flex items-center text-sm text-slate-600">
                        <Phone className="h-4 w-4 mr-2 text-slate-400" />
                        <span>{client.phone}</span>
                      </div>
                    )}

                    {client.linkedinUrl && (
                      <div className="flex items-center text-sm text-slate-600">
                        <Linkedin className="h-4 w-4 mr-2 text-slate-400" />
                        <span className="truncate">LinkedIn Profile</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                      <Badge variant="secondary" className="text-xs">
                        {client.preferredChannel === "email" ? (
                          <>
                            <Mail className="h-3 w-3 mr-1" />
                            Email
                          </>
                        ) : (
                          <>
                            <Linkedin className="h-3 w-3 mr-1" />
                            LinkedIn
                          </>
                        )}
                      </Badge>
                      
                      <div className="text-xs text-slate-500">
                        Added {new Date(client.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {client.notes && (
                    <div className="mt-4 pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {client.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchTerm ? "No clients found" : "No clients yet"}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm 
                ? "Try adjusting your search terms" 
                : "Start building your client network by adding your first client"
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowClientModal(true)}>
                Add Your First Client
              </Button>
            )}
          </div>
        )}
      </main>

      <ClientModal 
        open={showClientModal} 
        onOpenChange={handleCloseModal} 
        client={editingClient}
      />
    </>
  );
}
