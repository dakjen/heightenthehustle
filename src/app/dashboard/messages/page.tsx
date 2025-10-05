"use client";

import { useState, useEffect } from "react";
import { sendMessage, sendMassMessage } from "./actions";
import { useFormState } from "react-dom";

interface Message {
  id: number;
  sender: string;
  recipient: string; // Could be 'admin', 'internal', or a specific user ID
  content: string;
  timestamp: string;
}

interface MassMessage {
  id: number;
  adminId: number;
  content: string;
  targetLocations: string;
  timestamp: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

type FormState = {
  message: string;
  error: string;
} | undefined;

interface MessagesPageProps {
  isAdmin: boolean;
  initialInternalUsers: User[];
  initialMassMessages: MassMessage[];
}

export default function MessagesPage({ isAdmin, initialInternalUsers, initialMassMessages }: MessagesPageProps) {
  const [messages, setMessages] = useState<Message[]>([]); // Placeholder for messages
  const [massMessages, setMassMessages] = useState<MassMessage[]>(initialMassMessages); // New state for mass messages
  const [messageContent, setMessageContent] = useState("");
  const [recipient, setRecipient] = useState("admin"); // Default recipient
  const [massMessageLocations, setMassMessageLocations] = useState<string[]>([]); // New state for locations
  const [internalUsers, setInternalUsers] = useState<User[]>(initialInternalUsers); // New state for internal users

  const [sendState, sendFormAction] = useFormState<FormState, FormData>(sendMessage, undefined);
  const [massSendState, massSendFormAction] = useFormState<FormState, FormData>(sendMassMessage, undefined); // New form state for mass messages

  useEffect(() => {
    // Update mass messages when a new one is sent
    if (massSendState?.message && !massSendState.error) {
      // Re-fetch mass messages or update state directly if possible
      // For now, we'll just clear the form
      setMassMessageLocations([]);
      setMessageContent("");
    }
  }, [massSendState]);

  const handleSendMessage = (formData: FormData) => {
    // This will be handled by the server action
    sendFormAction(formData);
    setMessageContent(""); // Clear input after sending
  };

  const handleMassSendMessage = (formData: FormData) => {
    // This will be handled by the server action
    massSendFormAction(formData);
    setMessageContent(""); // Clear input after sending
    setMassMessageLocations([]); // Clear locations after sending
  };

  const [activeTab, setActiveTab] = useState('individual-messages');

  return (
    <div className="flex-1 p-6">
      <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
      <p className="mt-4 text-gray-700">Communicate with admins and internal users.</p>

      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('individual-messages')}
            className={`${activeTab === 'individual-messages' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Individual Messages
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('correspondence')}
              className={`${activeTab === 'correspondence' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Correspondence
            </button>
          )}
        </nav>
      </div>

      {activeTab === 'individual-messages' && (
        <div className="mt-8">
          {/* Message List (Placeholder) */}
          <div className="p-6 bg-white shadow-md rounded-lg h-96 overflow-y-auto">
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
                {internalUsers.map(user => (
                  <option key={user.id} value={user.id.toString()}>{user.name} ({user.email})</option>
                ))}
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
      )}

      {activeTab === 'correspondence' && isAdmin && (
        <form action={handleMassSendMessage} className="mt-8 max-w-2xl p-6 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Send Mass Message</h2>

          {/* Location Selection */}
          <div>
            <label htmlFor="massMessageLocations" className="block text-sm font-medium text-gray-700">
              Target Locations (comma-separated)
            </label>
            <input
              id="massMessageLocations"
              name="massMessageLocations"
              type="text"
              value={massMessageLocations.join(', ')}
              onChange={(e) => setMassMessageLocations(e.target.value.split(', ').map(loc => loc.trim()))}
              placeholder="e.g., New York, Washington, D.C."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
            />
          </div>

          {/* Message Content */}
          <div className="mt-4">
            <label htmlFor="massMessageContent" className="sr-only">Message</label>
            <textarea
              id="massMessageContent"
              name="massMessageContent"
              rows={4}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Type your message here..."
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
            ></textarea>
          </div>

          {massSendState?.message && (
            <p className="text-sm text-green-600 mt-2">{massSendState.message}</p>
          )}
          {massSendState?.error && (
            <p className="text-sm text-red-600 mt-2">{massSendState.error}</p>
          )}

          <div className="mt-6">
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-[#910000] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#7a0000] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Send Mass Message
            </button>
          </div>
        </form>
      )}
    </div>
  );

}
