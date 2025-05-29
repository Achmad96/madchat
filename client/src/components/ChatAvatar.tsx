import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function ChatAvatar({ avatar, name }: { avatar?: string; name: string }) {
  return (
    <Avatar className="h-10 w-10">
      <AvatarImage src={avatar} alt={name} />
      <AvatarFallback>{name[0]?.toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}
