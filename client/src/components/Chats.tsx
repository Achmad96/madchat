import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import AddRecipientButton from '@/components/AddConversationButton';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router';
import { socket } from '@/services/SocketService';
import { fetchData } from '@/services/FetchService';

interface Conversation {
  id: string;
  creator_id: string;
  type_id: number;
  recipients: {
    id: string;
    username: string;
    display_name?: string;
    avatar?: string;
  }[];
  last_message?: {
    content: string;
    sent_at: string;
  };
}

const Recipient = ({ conversation }: { conversation: Conversation }) => {
  const { id, recipients, last_message } = conversation;
  if (!recipients) return <></>;
  const recipient = recipients[0];
  return (
    <Link to={`/chats/${id}`} className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-accent">
      <Avatar>
        <AvatarImage src={recipient.avatar} />
        <AvatarFallback>{recipient.display_name?.[0] || recipient.username[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="font-medium">{recipient.display_name || recipient.username}</div>
        {last_message && <div className="text-xs text-muted-foreground truncate">{last_message.content}</div>}
      </div>
    </Link>
  );
};

export default function Chats() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetchData('conversations', {
          method: 'GET'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }
        const { data } = await response.json();
        setConversations(data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.id) {
      fetchConversations();
      socket.on(`new-conversation-${user.id}`, (data) => {
        setConversations(data);
      });
      return () => {
        socket.off(`new-conversation-${user.id}`);
      };
    }
  }, [user]);

  return (
    <div className="w-[50%] max-md:w-full h-full flex flex-col gap-4">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-bold">Chats</h2>
        <AddRecipientButton />
      </div>
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <div className="w-10 h-10 rounded-full bg-accent animate-pulse" />
                <div className="space-y-1 flex-1">
                  <div className="h-4 w-1/3 bg-accent animate-pulse rounded" />
                  <div className="h-3 w-2/3 bg-accent animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="p-2">
            {conversations.map((conversation, index) => {
              if (conversation.type_id === 1) return <Recipient key={index} conversation={conversation} />;
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <p className="text-muted-foreground mb-4">No conversations yet</p>
            <p className="text-sm text-muted-foreground mb-2">Click the button above to start chatting</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
