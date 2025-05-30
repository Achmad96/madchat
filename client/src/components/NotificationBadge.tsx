import { useNotifications } from "@/contexts/NotificationContext";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "react-router";

export function NotificationBadge() {
  const { notifications, markAsRead, clearNotifications } = useNotifications();

  const groupedNotifications = notifications.reduce((acc, notification) => {
    if (!acc[notification.conversation_id]) {
      acc[notification.conversation_id] = [];
    }
    acc[notification.conversation_id].push(notification);
    return acc;
  }, {} as Record<string, typeof notifications>);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative">
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">{notifications.length}</Badge>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {notifications.length > 0 && (
            <button onClick={clearNotifications} className="text-xs text-muted-foreground hover:text-foreground">
              Clear all
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-4 px-2 text-center text-muted-foreground">No new notifications</div>
          ) : (
            <DropdownMenuGroup>
              {Object.entries(groupedNotifications).map(([conversationId, msgs]) => (
                <Link key={conversationId} to={`/chats/${conversationId}`} onClick={() => msgs.forEach((msg) => markAsRead(msg.id))}>
                  <DropdownMenuItem className="cursor-pointer">
                    <div className="flex flex-col w-full">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{msgs[0].display_name || msgs[0].username || "Someone"}</span>
                        {/* <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(msgs[0].created_at), { addSuffix: true })}</span> */}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {msgs.length} new message{msgs.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  </DropdownMenuItem>
                </Link>
              ))}
            </DropdownMenuGroup>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
