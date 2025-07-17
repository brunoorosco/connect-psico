"use client"
import { useChatStore } from "./useChatStore"
import Sidebar from "./Sidebar"
import NoChatSelected from "./NoChatSelected"
import ChatContainer from "./ChatContainer"

const HomePage = () => {
  const { selectedUser } = useChatStore()

  return (
    <div className="h-screen">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />

            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  )
}
export default HomePage
