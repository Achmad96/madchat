import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { fetchData } from '@/services/FetchService';
import { toast } from 'sonner';
import { socket } from '@/services/SocketService';

interface Message {
  author_id: string;
  content: string;
  created_at: string;
}

interface ChatItemProps {
  data: {
    created_at: string;
    message: string;
    isCurrentUser?: boolean;
  };
}

const ChatItem = ({ data }: ChatItemProps) => {
  const { created_at, message, isCurrentUser } = data;
  return (
    <div className={cn('flex w-full gap-3 mb-3 h-fit', isCurrentUser ? 'flex-row-reverse' : 'flex-row')}>
      <Card className={cn('max-w-[75%] py-3 gap-1 min-w-[30%] w-auto shadow-sm', isCurrentUser ? 'bg-primary text-primary-foreground rounded-tr-none' : 'rounded-tl-none')}>
        <CardContent className="h-fit">
          <div className="text-sm">{message}</div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <span className="text-xs text-muted-foreground">{new Date(created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </CardFooter>
      </Card>
    </div>
  );
};

const ChatThread = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const getLoadedMessages = async () => {
      try {
        const response = await fetchData(`conversations/${conversationId}/messages`, { method: 'GET' });
        const { data } = await response.json();
        setMessages(data);
      } catch (error: any) {
        toast.error('ERROR: ' + error.message);
        navigate('/chats', { replace: true });
      }
    };
    if (user) {
      getLoadedMessages();
    }
  }, [user, conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const handler = (message: Message) => {
      setMessages((prev) => [...prev, message]);
    };
    socket.on(`new-message-${conversationId}`, handler);
    return () => {
      socket.off(`new-message-${conversationId}`, handler);
    };
  }, [conversationId]);

  return (
    <div className="flex flex-col gap-2 p-5 border rounded-t-xl overflow-y-auto h-[75dvh] pt-24">
      {messages.map((data, index) => (
        <ChatItem
          key={index}
          data={{
            isCurrentUser: user?.id === data.author_id,
            message: data.content,
            created_at: data.created_at
          }}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatThread;
