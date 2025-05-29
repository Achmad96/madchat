import ChatThread from "@/components/ChatThread";
import ChatInput from "@/components/ChatInput";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import RecipientCard from "./RecipientCard";
import { useEffect, useState } from "react";
import { fetchData } from "@/services/FetchService";
import { useAuth } from "@/contexts/AuthContext";
import type { ConversationType, UserType, RecipientType } from "@/types";

export default function ChatWrapper() {
  const [conversation, setConversation] = useState<ConversationType | null>(null);
  const [recipients, setRecipients] = useState<Array<RecipientType>>([]);
  const { user } = useAuth();
  const { conversationId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const getRecipientData = async () => {
      try {
        const response = await fetchData(`conversations/${conversationId}`, { method: "GET" });
        const { data } = await response.json();
        if (!data) {
          throw new Error("No recipient data found");
        }
        setConversation(data);
      } catch (error: any) {
        toast.error("ERROR: " + error.message);
        console.error("Failed to load recipient data:", error);
        navigate("/chats", { replace: true });
      }
    };
    getRecipientData();
  }, [user]);

  useEffect(() => {
    if (!conversation || !user) return;
    if (conversation.type_id === 1) {
      const recipient = conversation.recipients.find((recipient: UserType) => recipient.id !== user.id);
      if (!recipient) {
        throw new Error("Recipient not found in conversation");
      }
      const { id, username, display_name, avatar } = recipient;
      setRecipients([{ id, name: display_name || username, avatar }]);
    }
  }, [user, conversation]);

  return (
    <main className="flex flex-col max-md:p-2 w-full h-[90dvh] items-center justify-center">
      <div className="w-[50%] max-md:w-full relative">
        {recipients && recipients.length > 0 && <RecipientCard recipient={recipients[0]} />}
        <ChatThread />
        <ChatInput />
      </div>
    </main>
  );
}
