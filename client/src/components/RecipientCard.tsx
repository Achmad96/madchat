import { Card } from '@/components/ui/card';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { Link } from 'react-router';
import type { RecipientType } from '@/types';
import ChatAvatar from '@/components/ChatAvatar';

export default function RecipientCard({ recipient }: { recipient: RecipientType }) {
  let avatar = undefined;
  if (recipient.avatar && recipient.avatar.data) {
    const base64String = btoa(String.fromCharCode(...new Uint8Array(recipient.avatar.data)));
    avatar = `data:image/jpeg;base64,${base64String}`;
  }

  return (
    <Card className="w-full p-4 shadow-md hover:shadow-lg transition-shadow duration-300 absolute rounded-b-none">
      <div className="flex items-center space-x-5">
        <Link to="/chats">
          <IoIosArrowRoundBack className="w-10 h-10" />
        </Link>
        <ChatAvatar avatar={avatar} name={recipient.name} />
        <div>
          <h3 className="text-lg font-semibold">{recipient.name}</h3>
        </div>
      </div>
    </Card>
  );
}
