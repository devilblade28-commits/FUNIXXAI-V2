'use client';

import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatArea } from '@/components/chat/ChatArea';
import { ChatInput } from '@/components/chat/ChatInput';

export default function Home() {
  return (
    <div className="relative flex h-dvh flex-col bg-background text-foreground overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="bg-mesh" />
      {/* App content */}
      <ChatHeader />
      <ChatArea />
      <ChatInput />
    </div>
  );
}
