import { useRef, type FormEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useParams } from 'react-router';
import { Send } from 'lucide-react';
import { fetchData } from '@/services/FetchService';

export default function InputChat() {
  const { conversationId } = useParams();
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const content = formData.get('message') as string;
    try {
      const response = await fetchData('messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ conversation_id: conversationId, content })
      });
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error:', error);
    }
    ref.current!.value = '';
  };

  return (
    <form onSubmit={handleSubmit} className="w-full relative">
      <Textarea ref={ref} id="message" name="message" placeholder="Enter your message here..." autoComplete="off" className="resize-none w-full rounded-none rounded-b-xl" />
      <Button type="submit" variant="default" className="absolute top-3 right-5">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
