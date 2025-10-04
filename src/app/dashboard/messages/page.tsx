"use client";

import { useState } from "react";
import { sendMessage } from "./actions"; // Will create this action
import { useFormState } from "react-dom";

interface Message {
  id: number;
  sender: string;
  recipient: string; // Could be 'admin', 'internal', or a specific user ID
  content: string;
  timestamp: string;
}

type FormState = {
  message: string;
  error: string;
} | undefined;

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]); // Placeholder for messages
  const [messageContent, setMessageContent] = useState("");
  const [recipient, setRecipient] = useState("admin"); // Default recipient

  const [sendState, sendFormAction] = useFormState<FormState, FormData>(sendMessage, undefined);

  // In a real application, you would fetch messages here
  // useEffect(() => {
  //   async function fetchMessages() {
  //     const fetchedMessages = await getMessages();
  //     setMessages(fetchedMessages);
  //   }
  //   fetchMessages();
  // }, []);

  const handleSendMessage = (formData: FormData) => {
    // This will be handled by the server action
    sendFormAction(formData);
    setMessageContent(""); // Clear input after sending
  };

  return (
    <div className="flex-1 p-6">
      <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
      <p className="mt-4 text-gray-700">Communicate with admins and internal users.</p>

      {/* Message List (Placeholder) */}
      <div className="mt-8 p-6 bg-white shadow-md rounded-lg h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet. Start a conversation!</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="mb-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-sm font-semibold">{msg.sender} to {msg.recipient}:</p>
              <p className="text-gray-800">{msg.content}</p>
              <p className="text-xs text-gray-500 text-right">{msg.timestamp}</p>
            </div>
          ))
        )}
      </div>

      {/* Message Input Form */}
      <form action={handleSendMessage} className="mt-8 max-w-2xl p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">New Message</h2>

        {/* Recipient Selection */}
        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">
            Recipient
          </label>
          <select
            id="recipient"
            name="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
          >
            <option value="admin">Admin</option>
            <option value="internal">Internal Users</option>
            {/* In a real app, this would be dynamic based on permissions/available users */}
          </select>
        </div>

        {/* Message Content */}
        <div className="mt-4">
          <label htmlFor="messageContent" className="sr-only">Message</label>
          <textarea
            id="messageContent"
            name="messageContent"
            rows={4}
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Type your message here..."
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
          ></textarea>
        </div>

        {sendState?.message && (
          <p className="text-sm text-green-600 mt-2">{sendState.message}</p>
        )}
        {sendState?.error && (
          <p className="text-sm text-red-600 mt-2">{sendState.error}</p>
        )}

        <div className="mt-6">
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-[#910000] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#7a0000] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Send Message
          </button>
        </div>
      </form>
    </div>
  );
}
