import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Search, User, Clock, CheckCheck } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: number;
  message: string;
  senderId: number;
  receiverId: number;
  jobId?: number;
  createdAt: string;
  read: boolean;
  sender: {
    id: number;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  receiver: {
    id: number;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

interface Conversation {
  id: number;
  participantId: number;
  participantName: string;
  participantType: 'customer' | 'tradie';
  profileImage?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  jobTitle?: string;
}

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  // Mock current user ID - in real app this would come from auth context
  const currentUserId = 1;

  // Fetch conversations
  const { data: rawConversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['/api/conversations'],
  });
  const conversations = Array.isArray(rawConversations) ? rawConversations : [];

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/conversations', selectedConversation, 'messages'],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const response = await apiRequest("GET", `/api/conversations/${selectedConversation}/messages`);
      return response.json();
    },
    enabled: !!selectedConversation
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string; receiverId: number; jobId?: number }) => {
      const response = await apiRequest("POST", `/api/conversations/${messageData.receiverId}/messages`, {
        message: messageData.message,
        jobId: messageData.jobId
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', selectedConversation, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      setNewMessage("");
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    const conversation = conversations.find(c => c.participantId === selectedConversation);
    if (!conversation) return;

    sendMessageMutation.mutate({
      message: newMessage.trim(),
      receiverId: conversation.participantId,
      jobId: conversation.jobId
    });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Communicate with customers and tradies about your projects</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Conversations</CardTitle>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)} unread
                </Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[480px]">
                {conversationsLoading ? (
                  <div className="p-4 text-center text-gray-500">Loading conversations...</div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {searchTerm ? "No conversations found" : "No conversations yet"}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.participantId}
                        onClick={() => setSelectedConversation(conversation.participantId)}
                        className={`p-4 cursor-pointer border-b hover:bg-gray-50 transition-colors ${
                          selectedConversation === conversation.participantId ? 'bg-primary/5 border-primary/20' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.profileImage} />
                            <AvatarFallback>
                              {conversation.participantName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm text-gray-900 truncate">
                                {conversation.participantName}
                              </h4>
                              <div className="flex items-center gap-2">
                                {conversation.unreadCount > 0 && (
                                  <Badge className="bg-red-500 text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                                <span className="text-xs text-gray-500">
                                  {formatTime(conversation.lastMessageTime)}
                                </span>
                              </div>
                            </div>
                            {conversation.jobTitle && (
                              <p className="text-xs text-primary font-medium mb-1">
                                Re: {conversation.jobTitle}
                              </p>
                            )}
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.lastMessage}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className="lg:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader className="pb-4 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {conversations.find(c => c.participantId === selectedConversation)?.participantName
                          .split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {conversations.find(c => c.participantId === selectedConversation)?.participantName}
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        {conversations.find(c => c.participantId === selectedConversation)?.participantType === 'tradie' ? 'Tradie' : 'Customer'}
                        {conversations.find(c => c.participantId === selectedConversation)?.jobTitle && 
                          ` • ${conversations.find(c => c.participantId === selectedConversation)?.jobTitle}`
                        }
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[380px] p-4">
                    {messagesLoading ? (
                      <div className="text-center text-gray-500 py-8">Loading messages...</div>
                    ) : ((Array.isArray(messages) ? messages : []).length) === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(Array.isArray(messages) ? messages : []).map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                message.senderId === currentUserId
                                  ? 'bg-primary text-white'
                                  : 'bg-gray-200 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.message}</p>
                              <div className={`flex items-center gap-1 mt-1 ${
                                message.senderId === currentUserId ? 'justify-end' : 'justify-start'
                              }`}>
                                <Clock className="h-3 w-3 opacity-70" />
                                <span className="text-xs opacity-70">
                                  {new Date(message.createdAt).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                                {message.senderId === currentUserId && (
                                  <CheckCheck className={`h-3 w-3 ${message.read ? 'text-green-300' : 'opacity-50'}`} />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        size="sm"
                        className="px-4"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Press Enter to send, Shift+Enter for new line
                    </p>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                  <p className="text-sm">Choose a conversation from the left to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}