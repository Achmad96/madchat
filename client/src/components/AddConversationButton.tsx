import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { fetchData } from "@/services/FetchService";

interface User {
  id: string;
  username: string;
  display_name?: string;
  avatar?: string;
}

export default function AddConversationButton() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetchData(`users/search?query=${encodeURIComponent(searchTerm)}`, {
        method: "GET"
      });
      if (!response.ok) {
        throw new Error("Failed to search users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startConversation = async (participant_ids: string[]) => {
    try {
      const response = await fetchData("conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ participant_ids })
      });
      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }
      const conversation = await response.json();
      console.log("Conversation created:", conversation);
      toast.success("Conversation started successfully!");
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to start conversation. Please try again later.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <PlusCircle size={16} />
          New Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>Search for a user to start a conversation with.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input placeholder="Search by username or display name" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="flex-1" />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </form>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {users.map((user) => (
              <DialogClose key={user.id} asChild>
                <div className="flex items-center gap-3 p-2 rounded hover:bg-accent cursor-pointer" onClick={() => startConversation([user.id])}>
                  <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.display_name?.[0] || user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.display_name || user.username}</div>
                    {user.display_name && <div className="text-xs text-muted-foreground">@{user.username}</div>}
                  </div>
                </div>
              </DialogClose>
            ))}
            {users.length === 0 && searchTerm && !isLoading && <p className="text-center text-muted-foreground py-4">No users found</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
