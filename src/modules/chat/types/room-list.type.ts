export interface RoomListItem {
  membershipId: string;
  role: string;
  joinedAt: string;
  room: {
    id: string;
    name: string;
    aiTitle: string | null;
    maxPrompts: number;
    promptUsed: number;
    lastActive: string | null;
    capacity: number | null;
    location: string | null;
    createdAt: string;
    chatCount: number;
  };
}

export interface RoomListResponse {
  success: true;
  data: RoomListItem[];
}