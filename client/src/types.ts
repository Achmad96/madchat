type UserType = {
  id: string;
  username: string;
  display_name: string;
  avatar: {
    data: ArrayBuffer;
    type: "Buffer";
  };
};

type RecipientType = {
  id: string;
  name: string;
  avatar: {
    data: ArrayBuffer;
    type: "Buffer";
  };
};

interface JwtPayload {
  id: string;
  username: string;
  iat: number;
  exp: number;
}

type ConversationType = {
  id: number;
  creator_id: string;
  created_at: Date;
  type_id: number;
  recipients: Array<UserType>;
};
export type { UserType, RecipientType, JwtPayload, ConversationType };
