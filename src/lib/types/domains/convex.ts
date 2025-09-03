// Convex API types
// Simplified API types to avoid circular type instantiation issues
// Using a more specific type that's compatible with Convex function references

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ConvexFunction = any;

export interface ConvexAPI {
  auth: {
    signIn: ConvexFunction;
    signOut: ConvexFunction;
    [key: string]: ConvexFunction;
  };
  users: {
    getUserProfile: ConvexFunction;
    [key: string]: ConvexFunction;
  };
  userProfiles: {
    getUserProfile: ConvexFunction;
    updateUserProfile: ConvexFunction;
    updateUserSettings: ConvexFunction;
    [key: string]: ConvexFunction;
  };
  securityLog: {
    logSecurityEvent: ConvexFunction;
    [key: string]: ConvexFunction;
  };
  changePassword: {
    default: ConvexFunction;
    [key: string]: ConvexFunction;
  };
  files: {
    generateUploadUrl: ConvexFunction;
    getFileUrl: ConvexFunction;
    [key: string]: ConvexFunction;
  };
  eventApplications: {
    getEventApplications: ConvexFunction;
    respondToApplication: ConvexFunction;
    applyToEvent: ConvexFunction;
    getMyApplications: ConvexFunction;
    [key: string]: ConvexFunction;
  };
  sessions: {
    getUserSessions: ConvexFunction;
    revokeSession: ConvexFunction;
    revokeAllOtherSessions: ConvexFunction;
    [key: string]: ConvexFunction;
  };
  connections: {
    getUserConnections: ConvexFunction;
    getUserConversations: ConvexFunction;
    getMessages: ConvexFunction;
    getConnection: ConvexFunction;
    markMessagesAsRead: ConvexFunction;
    sendMessage: ConvexFunction;
    [key: string]: ConvexFunction;
  };
  events: {
    getEventsNearUser: ConvexFunction;
    getEvent: ConvexFunction;
    updateEvent: ConvexFunction;
    deleteEvent: ConvexFunction;
    getUserEvents: ConvexFunction;
    createEvent: ConvexFunction;
    [key: string]: ConvexFunction;
  };
  rooms: {
    getMyRooms: ConvexFunction;
    getRoom: ConvexFunction;
    updateRoom: ConvexFunction;
    createRoom: ConvexFunction;
    [key: string]: ConvexFunction;
  };
  eventChat: {
    canAccessEventChat: ConvexFunction;
    getEventChatInfo: ConvexFunction;
    getEventMessages: ConvexFunction;
    getEventChatParticipants: ConvexFunction;
    markEventMessagesSeen: ConvexFunction;
    sendEventMessage: ConvexFunction;
    [key: string]: ConvexFunction;
  };
  bookmarks: {
    bookmarkEvent: ConvexFunction;
    unbookmarkEvent: ConvexFunction;
    [key: string]: ConvexFunction;
  };
}
