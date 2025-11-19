"use client";

import { useState, useEffect } from "react";
import { sendMessage, sendMassMessage, getIndividualMessages } from "./actions";
import { searchBusinesses } from "../businesses/actions";
import { Business } from "@/db/schema";
import { useFormState } from "react-dom";
import { FormState } from "@/types/form-state";

interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  content: string;
  timestamp: Date;
  read: boolean;
  replyToMessageId: number | null;
  sender: { id: number; name: string; email: string };
  recipient: { id: number; name: string; email: string };
}

interface MassMessage {
  id: number;
  adminId: number;
  content: string;
  targetLocationIds: number[] | null;
  targetDemographicIds: number[] | null;
  timestamp: Date;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Location {
  id: number;
  name: string;
}

interface Demographic {
  id: number;
  name: string;
}

interface PendingRequest extends Message {
  sender: { id: number; name: string; email: string };
  recipient: { id: number; name: string; email: string };
}

interface MessagesPageProps {
  isAdmin: boolean;
  initialInternalUsers: User[];
  initialMassMessages: MassMessage[];
  initialLocations: Location[];
  initialDemographics: Demographic[];
  initialIndividualMessages: Message[];
  currentUserId: number | null;
}

export default function MessagesPage({
  isAdmin,
  initialInternalUsers,
  initialMassMessages,
  initialLocations,
  initialDemographics,
  initialIndividualMessages,
  currentUserId,
}: MessagesPageProps) {
  const [massSendState, massSendAction] = useFormState<FormState, FormData>(sendMassMessage, { message: "" });
  const [sendState, sendAction] = useFormState<FormState, FormData>(sendMessage, { message: "" });
  const [selectedRecipientId, setSelectedRecipientId] = useState<number | null>(null);
  const [recipient, setRecipient] = useState("admin");
  const [messageContent, setMessageContent] = useState("");
  const [activeTab, setActiveTab] = useState("individual-messages");
  const [individualMessages, setIndividualMessages] = useState<Message[]>(initialIndividualMessages);
  const [selectedLocations, setSelectedLocations] = useState<number[]>([]);
  const [selectedDemographics, setSelectedDemographics] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Business[]>([]);
  const [excludeOptedOut, setExcludeOptedOut] = useState(true);

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchBusinesses(searchQuery).then(setSearchResults);
    }
  }, [searchQuery]);

  const handleLocationChange = (locationId: number) => {
    setSelectedLocations(prev =>
      prev.includes(locationId)
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  const handleDemographicChange = (demographicId: number) => {
    setSelectedDemographics(prev =>
      prev.includes(demographicId)
        ? prev.filter(id => id !== demographicId)
        : [...prev, demographicId]
    );
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <div className="flex space-x-4">
          {isAdmin && (
            <button
              onClick={() => setActiveTab('mass-messages')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'mass-messages' ? 'bg-[#910000] text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Mass Messages
            </button>
          )}
          <button
            onClick={() => setActiveTab('individual-messages')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'individual-messages' ? 'bg-[#910000] text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Individual Messages
          </button>
        </div>
      </div>

      {activeTab === 'individual-messages' && (
        <div className="mt-8 flex flex-col h-[calc(100vh-200px)]">
          <div className="flex-grow overflow-y-auto p-6 bg-white shadow-md rounded-lg">
            {individualMessages.length === 0 ? (
              <p className="text-gray-500">No messages yet.</p>
            ) : (
              individualMessages.map((msg) => (
                <div key={msg.id} className={`mb-4 p-3 rounded-lg max-w-xs ${msg.senderId === currentUserId ? 'bg-gray-100 self-start' : 'bg-blue-100 self-end'}`}>
                  <p className="text-sm font-semibold">{msg.senderId === currentUserId ? "You" : msg.sender.name}:</p>
                  <p className="text-gray-800">{msg.content}</p>
                  <p className="text-xs text-gray-500 text-right">{msg.timestamp.toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
          <form action={sendAction} className="mt-4 p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">New Message</h2>

            {/* Recipient Selection */}
            <div>
              <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">
                Recipient
              </label>
              <select
                id="recipient"
                name="recipient"
                value={selectedRecipientId ? selectedRecipientId.toString() : recipient}
                onChange={(e) => {
                  setRecipient(e.target.value);
                  setSelectedRecipientId(parseInt(e.target.value));
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
              >
                <option value="admin">Admin</option>
                {isAdmin && (
                  <>
                    <option value="internal">Internal Users</option>
                    {initialInternalUsers.map(user => (
                      <option key={user.id} value={user.id.toString()}>{user.name} ({user.email})</option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {/* Message Content */}
            <div className="mt-4">
              <label htmlFor="messageContent" className="sr-only">Message</label>
              <textarea
                id="messageContent"
                name="messageContent"
                rows={2}
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

      {activeTab === 'mass-messages' && isAdmin && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Mass Messages</h2>
          <div className="p-6 bg-white shadow-md rounded-lg h-96 overflow-y-auto">
            {initialMassMessages.length === 0 ? (
              <p className="text-gray-500">No mass messages sent yet.</p>
            ) : (
              initialMassMessages.map((msg) => (
                <div key={msg.id} className="mb-4 p-3 bg-gray-100 rounded-lg">
                  <p className="text-gray-800">{msg.content}</p>
                  <p className="text-xs text-gray-500 text-right">{msg.timestamp.toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}