# ArtistMessages Component

## Overview
The `ArtistMessages` component provides a comprehensive messaging interface for artists to communicate with their clients and potential buyers. It features a real-time chat interface with conversation management and message history.

## Features

### Conversation Management
- **Conversation List**: Sidebar with all active conversations
- **Unread Counts**: Visual indicators for unread messages
- **Last Message Preview**: Quick preview of the latest message
- **Participant Information**: User details and contact information

### Real-time Messaging
- **Message History**: Complete conversation history
- **Message Status**: Read/unread indicators for sent messages
- **Auto-scroll**: Automatic scrolling to latest messages
- **Message Timestamps**: Relative time formatting (now, minutes, hours, days)

### User Experience
- **Responsive Design**: Mobile-first approach with adaptive layout
- **Smooth Animations**: Framer Motion for message transitions
- **Loading States**: Spinners and skeleton loading
- **Error Handling**: Comprehensive error states and recovery

## Technical Implementation

### State Management
- Uses SWR for data fetching and caching
- Local state for UI interactions and form data
- Real-time updates with polling intervals

### Data Flow
- **Conversations**: Fetched from `/api/artist/messages`
- **Messages**: Fetched from `/api/artist/messages/[conversationId]`
- **Auto-refresh**: 30s for conversations, 5s for messages

### Message Handling
- **Send Messages**: POST to `/api/artist/messages`
- **Mark as Read**: PATCH to `/api/artist/messages/[conversationId]`
- **Optimistic Updates**: Immediate UI updates with server sync

## API Integration

### Endpoints Used
- `GET /api/artist/messages` - Fetch conversations list
- `GET /api/artist/messages/[conversationId]` - Fetch messages in conversation
- `POST /api/artist/messages` - Send new message
- `PATCH /api/artist/messages/[conversationId]` - Mark messages as read

### Data Structures
```typescript
interface Conversation {
    id: string;
    participant: {
        id: string;
        name: string;
        email: string;
        image: string | null;
    };
    lastMessage: {
        content: string;
        createdAt: string;
        senderType: 'USER' | 'ARTIST';
    } | null;
    unreadCount: number;
    updatedAt: string;
}

interface Message {
    id: string;
    content: string;
    senderId: string;
    senderType: 'USER' | 'ARTIST';
    senderName: string;
    senderImage: string | null;
    createdAt: string;
    isRead: boolean;
}
```

## Component Structure

### Layout
1. **Header**: Title and description
2. **Container**: Two-column layout (conversations + messages)
3. **Sidebar**: Conversations list with search and filters
4. **Main Area**: Chat interface with message history

### Key Components
- **ConversationItem**: Individual conversation in sidebar
- **MessageItem**: Individual message in chat
- **MessageInput**: Form for sending new messages
- **ChatHeader**: Participant information and actions

## Styling

### CSS Architecture
- Component-scoped CSS modules
- CSS custom properties for theming
- Mobile-first responsive design
- Consistent spacing and typography

### Key Design Elements
- **Message Bubbles**: Different styles for sent/received
- **Avatar System**: Consistent avatar display with fallbacks
- **Unread Indicators**: Badge system for unread counts
- **Status Indicators**: Read/unread status for sent messages

### Responsive Behavior
- **Desktop**: Side-by-side layout
- **Tablet**: Collapsible sidebar
- **Mobile**: Stacked layout with horizontal conversation scroll

## Usage

```tsx
import ArtistMessages from '@/components/artist/ArtistMessages/ArtistMessages';

export default function MessagesPage() {
    return <ArtistMessages />;
}
```

## Real-time Features

### Auto-refresh
- **Conversations**: 30-second polling interval
- **Messages**: 5-second polling interval
- **Optimistic Updates**: Immediate UI feedback

### Message Status
- **Sent**: Single checkmark (✓)
- **Read**: Double checkmark (✓✓)
- **Timestamps**: Relative time formatting

### Unread Management
- **Visual Indicators**: Red badges with count
- **Auto-mark Read**: Messages marked as read when conversation opened
- **Real-time Updates**: Unread counts update automatically

## Performance Optimizations

### Data Fetching
- **SWR Caching**: Intelligent caching and revalidation
- **Conditional Fetching**: Messages only fetched when conversation selected
- **Polling Intervals**: Optimized refresh rates

### UI Optimizations
- **Virtual Scrolling**: For large message lists (future enhancement)
- **Message Batching**: Group messages by date
- **Lazy Loading**: Load older messages on demand

## Accessibility

### Keyboard Navigation
- **Tab Order**: Logical tab sequence
- **Enter to Send**: Submit form with Enter key
- **Focus Management**: Proper focus handling

### Screen Reader Support
- **ARIA Labels**: Proper labeling for interactive elements
- **Message Announcements**: New message notifications
- **Status Updates**: Read/unread status announcements

## Future Enhancements
- [ ] Message search functionality
- [ ] File/image sharing
- [ ] Message reactions and emojis
- [ ] Typing indicators
- [ ] Message encryption
- [ ] Conversation archiving
- [ ] Bulk message actions
- [ ] Message templates
- [ ] Auto-translation
- [ ] Voice messages
- [ ] Video calls integration
- [ ] Message scheduling
- [ ] Conversation analytics
