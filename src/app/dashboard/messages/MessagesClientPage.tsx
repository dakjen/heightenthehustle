"use client";

import { useState, useEffect } from "react";
import { sendMessage, sendMassMessage, getIndividualMessages, getPendingRequests } from "./actions";
import { useFormState } from "react-dom";

interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  content: string;
  timestamp: Date;
  read: boolean;
  replyToMessageId: number | null;
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
  sender: { name: string; email: string };
  recipient: { name: string; email: string };
}

type FormState = {
  message: string;
  error: string;
} | undefined;

interface MessagesPageProps {
  isAdmin: boolean;
  initialInternalUsers: User[];
  initialMassMessages: MassMessage[];
  initialLocations: Location[];
  initialDemographics: Demographic[];
  currentUserId: number | null;
}

export default function MessagesPage({ isAdmin, initialInternalUsers, initialMassMessages, initialLocations, initialDemographics, currentUserId }: MessagesPageProps) {
  const [messages, setMessages] = useState<Message[]>([]); // Placeholder for messages
  const [massMessages, setMassMessages] = useState<MassMessage[]>(initialMassMessages); // New state for mass messages
  const [messageContent, setMessageContent] = useState("");
  const [recipient, setRecipient] = useState("admin"); // Default recipient
  const [selectedRecipientId, setSelectedRecipientId] = useState<number | null>(null); // New state for selected recipient
  const [massMessageLocations, setMassMessageLocations] = useState<string[]>([]); // New state for locations
  const [internalUsers, setInternalUsers] = useState<User[]>(initialInternalUsers); // New state for internal users
  const [selectedLocations, setSelectedLocations] = useState<number[]>([]);
  const [selectedDemographics, setSelectedDemographics] = useState<number[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]); // New state for pending requests

  const [sendState, sendFormAction] = useFormState<FormState, FormData>(sendMessage, undefined);
  const [massSendState, massSendFormAction] = useFormState<FormState, FormData>(sendMassMessage, undefined); // New form state for mass messages

  useEffect(() => {
    // Update mass messages when a new one is sent
    if (massSendState?.message && !massSendState.error) {
      // Re-fetch mass messages or update state directly if possible
      // For now, we'll just clear the form
      setMassMessageLocations([]);
      setMessageContent("");
      setSelectedLocations([]);
      setSelectedDemographics([]);
    }
  }, [massSendState]);

  // Fetch individual messages when selectedRecipientId changes
  useEffect(() => {
    async function fetchMessages() {
      if (selectedRecipientId && currentUserId) {
        const fetchedMessages = await getIndividualMessages(currentUserId, selectedRecipientId);
        setMessages(fetchedMessages);
      }
    }
    fetchMessages();
  }, [selectedRecipientId, currentUserId]);

  // Fetch pending requests when the tab is active and the user is not an admin
  useEffect(() => {
    async function fetchPendingRequests() {
      if (activeTab === 'pending-requests' && !isAdmin) {
        const fetchedPendingRequests = await getPendingRequests();
        setPendingRequests(fetchedPendingRequests);
      }
    }
    fetchPendingRequests();
  }, [activeTab, isAdmin]);

  const handleSendMessage = (formData: FormData) => {
    const formDataWithRecipient = new FormData();
    formDataWithRecipient.append("messageContent", messageContent);
    formDataWithRecipient.append("recipient", selectedRecipientId ? selectedRecipientId.toString() : recipient);
    sendFormAction(formDataWithRecipient);
    setMessageContent(""); // Clear input after sending
  };

  const handleMassSendMessage = (formData: FormData) => {
    const formDataWithSelections = new FormData();
    formDataWithSelections.append("massMessageContent", messageContent);
    formDataWithSelections.append("targetLocationIds", JSON.stringify(selectedLocations));
    formDataWithSelections.append("targetDemographicIds", JSON.stringify(selectedDemographics));
    massSendFormAction(formDataWithSelections);
    setMessageContent(""); // Clear input after sending
    setSelectedLocations([]); // Clear selections after sending
    setSelectedDemographics([]);
  };

  const handleLocationChange = (locationId: number) => {
    setSelectedLocations(prev =>
      prev.includes(locationId) ? prev.filter(id => id !== locationId) : [...prev, locationId]
    );
  };

  const handleDemographicChange = (demographicId: number) => {
    setSelectedDemographics(prev =>
      prev.includes(demographicId) ? prev.filter(id => id !== demographicId) : [...prev, demographicId]
    );
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
          {!isAdmin && (
            <button
              onClick={() => setActiveTab('pending-requests')}
              className={`${activeTab === 'pending-requests' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Pending Requests
            </button>
          )}
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
                <div key={msg.id} className="mb-4 p-3 bg-gray-100 rounded-lg cursor-pointer"
                  onClick={() => {
                    setSelectedRecipientId(msg.senderId === currentUserId ? msg.recipientId : msg.senderId);
                    setRecipient(msg.senderId === currentUserId ? msg.recipientId.toString() : msg.senderId.toString());
                  }}>
                  <p className="text-sm font-semibold">{msg.senderId === currentUserId ? "You" : "User"} to {msg.senderId === currentUserId ? "User" : "You"}:</p>
                  <p className="text-gray-800">{msg.content}</p>
                  <p className="text-xs text-gray-500 text-right">{msg.timestamp.toLocaleString()}</p>
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

      {activeTab === 'pending-requests' && !isAdmin && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pending Requests</h2>
          <div className="p-6 bg-white shadow-md rounded-lg h-96 overflow-y-auto">
            {pendingRequests.length === 0 ? (
              <p className="text-gray-500">No pending requests.</p>
            ) : (
              pendingRequests.map((req) => (
                <div key={req.id} className="mb-4 p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm font-semibold">From: {req.sender.name} ({req.sender.email})</p>
                  <p className="text-gray-800">{req.content}</p>
                  <p className="text-xs text-gray-500 text-right">{req.timestamp.toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'correspondence' && isAdmin && (
        <form action={handleMassSendMessage} className="mt-8 max-w-2xl p-6 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Send Mass Message</h2>

          {/* Location Selection */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Target Locations</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {initialLocations.map(location => (
                <div key={location.id} className="flex items-center">
                  <input
                    id={`location-${location.id}`}
                    name="locations"
                    type="checkbox"
                    checked={selectedLocations.includes(location.id)}
                    onChange={() => handleLocationChange(location.id)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor={`location-${location.id}`} className="ml-2 text-sm text-gray-900">
                    {location.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Demographic Selection */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Target Demographics</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {initialDemographics.map(demographic => (
                <div key={demographic.id} className="flex items-center">
                  <input
                    id={`demographic-${demographic.id}`}
                    name="demographics"
                    type="checkbox"
                    checked={selectedDemographics.includes(demographic.id)}
                    onChange={() => handleDemographicChange(demographic.id)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor={`demographic-${demographic.id}`} className="ml-2 text-sm text-gray-900">
                    {demographic.name}
                  </label>
                </div>
              ))}
            </div>
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
