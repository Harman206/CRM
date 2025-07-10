import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Sparkles, Mail, Linkedin, RefreshCw, Edit, Send, Calendar } from "lucide-react";

interface AIComposeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const messageTypes = [
  {
    id: "follow-up",
    title: "Follow-up",
    description: "Check in on previous conversation",
  },
  {
    id: "introduction",
    title: "Introduction", 
    description: "First contact message",
  },
  {
    id: "proposal",
    title: "Proposal",
    description: "Present business opportunity",
  },
  {
    id: "check-in",
    title: "Check-in",
    description: "Casual relationship maintenance",
  },
];

const tones = [
  { value: "professional", label: "Professional & Friendly" },
  { value: "formal", label: "Formal & Business" },
  { value: "casual", label: "Casual & Personal" },
  { value: "direct", label: "Direct & Concise" },
];

export default function AIComposeModal({ open, onOpenChange }: AIComposeModalProps) {
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [channel, setChannel] = useState<"email" | "linkedin">("email");
  const [messageType, setMessageType] = useState<string>("follow-up");
  const [context, setContext] = useState<string>("");
  const [tone, setTone] = useState<string>("professional");
  const [generatedMessage, setGeneratedMessage] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ["/api/clients"],
    enabled: open,
  });

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/ai/generate-message", data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedMessage(data);
      toast({
        title: "Message Generated",
        description: "AI has generated your personalized message",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate message",
        variant: "destructive",
      });
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/messages/send", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Message Sent",
          description: "Your message has been sent successfully",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/follow-ups/upcoming"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        onOpenChange(false);
        resetForm();
      } else {
        toast({
          title: "Send Failed",
          description: data.error || "Failed to send message",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Send Failed",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!selectedClient || !context.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a client and provide context",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({
      clientId: parseInt(selectedClient),
      channel,
      messageType,
      context: context.trim(),
      tone,
    });
  };

  const handleSend = () => {
    if (!generatedMessage || !selectedClient) return;

    sendMutation.mutate({
      clientId: parseInt(selectedClient),
      channel,
      subject: generatedMessage.subject,
      content: generatedMessage.content,
    });
  };

  const resetForm = () => {
    setSelectedClient("");
    setChannel("email");
    setMessageType("follow-up");
    setContext("");
    setTone("professional");
    setGeneratedMessage(null);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-brand-100 rounded-lg">
              <Sparkles className="h-4 w-4 text-brand-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">AI-Powered Message Composer</DialogTitle>
              <p className="text-sm text-slate-600">Generate personalized follow-up messages</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(90vh-180px)]">
          {/* Compose Panel */}
          <div className="space-y-6 overflow-y-auto pr-2">
            {/* Client Selection */}
            <div>
              <Label className="text-sm font-medium text-slate-700">Select Client</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Choose a client..." />
                </SelectTrigger>
                <SelectContent>
                  {clientsLoading ? (
                    <div className="p-2">
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : clients && clients.length > 0 ? (
                    clients.map((client: any) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name} {client.company && `- ${client.company}`}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-slate-500">No clients found</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Channel Selection */}
            <div>
              <Label className="text-sm font-medium text-slate-700">Channel</Label>
              <div className="flex space-x-3 mt-2">
                <Button
                  variant={channel === "email" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setChannel("email")}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button
                  variant={channel === "linkedin" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setChannel("linkedin")}
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
              </div>
            </div>

            {/* Message Type */}
            <div>
              <Label className="text-sm font-medium text-slate-700">Message Type</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {messageTypes.map((type) => (
                  <Button
                    key={type.id}
                    variant={messageType === type.id ? "default" : "outline"}
                    className="p-3 h-auto text-left"
                    onClick={() => setMessageType(type.id)}
                  >
                    <div>
                      <div className="font-semibold">{type.title}</div>
                      <div className="text-xs opacity-75">{type.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Context */}
            <div>
              <Label className="text-sm font-medium text-slate-700">Additional Context</Label>
              <Textarea
                placeholder="Provide any specific details, previous conversation points, or goals for this message..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="mt-2 h-24 resize-none"
              />
            </div>

            {/* Tone Selection */}
            <div>
              <Label className="text-sm font-medium text-slate-700">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((toneOption) => (
                    <SelectItem key={toneOption.value} value={toneOption.value}>
                      {toneOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending || !selectedClient || !context.trim()}
              className="w-full"
            >
              {generateMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Generate Message with AI
            </Button>
          </div>

          {/* Preview Panel */}
          <div className="bg-slate-50 p-6 overflow-y-auto">
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-slate-800 mb-2">Generated Message</h4>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <span>Powered by GPT-4</span>
              </div>
            </div>

            {generateMutation.isPending ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : generatedMessage ? (
              <>
                <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
                  {generatedMessage.subject && (
                    <div className="border-b border-slate-200 pb-3 mb-3">
                      <div className="text-sm text-slate-600 mb-1">Subject:</div>
                      <div className="font-medium text-slate-800">{generatedMessage.subject}</div>
                    </div>
                  )}
                  <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {generatedMessage.content}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <Button variant="outline" className="w-full" onClick={handleGenerate}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Message
                  </Button>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex space-x-3">
                    <Button 
                      className="flex-1" 
                      onClick={handleSend}
                      disabled={sendMutation.isPending}
                    >
                      {sendMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Send Now
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-2">AI message will appear here</p>
                <p className="text-sm text-slate-500">Fill out the form and click "Generate Message with AI"</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
