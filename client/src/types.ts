type ParticipantType = {
  id: string;
  username: string;
  display_name: string;
  avatar: {
    data: ArrayBuffer;
    type: 'Buffer';
  };
};

type RecipientType = {
  id: string;
  name: string;
  avatar: {
    data: ArrayBuffer;
    type: 'Buffer';
  };
};

type ConversationType = {
  id: number;
  creator_id: string;
  created_at: Date;
  type_id: number;
  recipients: Array<ParticipantType>;
};
export type { ParticipantType, RecipientType, ConversationType };
