"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useActionState } from "react";
import {
  sendMessage,
  sendMassMessage,
  getConversations,
  getApplicableBusinesses,
  markConversationRead,
} from "./actions";
import { Demographic, Location } from "@/db/schema";
import { FormState } from "@/types/form-state";
import {
  inputClass,
  checkboxClass,
  primaryButtonClass,
  SubmitButton,
  FormError,
  FormSuccess,
} from "@/app/components/form";

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

interface MessagesPageProps {
  isAdmin: boolean;
  initialInternalUsers: User[];
  initialMassMessages: MassMessage[];
  initialLocations: Location[];
  initialDemographics: Demographic[];
  initialIndividualMessages: Message[];
  currentUserId: number | null;
  defaultConversationUser: User | null;
}

type Tab = "individual-messages" | "team-chat" | "mass-messages";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const timeFmt = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
const dateFmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
const dateYearFmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" });

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** "3:45 PM" today, "Yesterday 3:45 PM", "Sep 12, 3:45 PM", or "Sep 12, 2025, 3:45 PM". */
function formatTimestamp(value: Date | string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const time = timeFmt.format(d);
  if (isSameDay(d, now)) return time;
  if (isSameDay(d, yesterday)) return `Yesterday ${time}`;
  const date = d.getFullYear() === now.getFullYear() ? dateFmt.format(d) : dateYearFmt.format(d);
  return `${date}, ${time}`;
}

/** Short relative-ish stamp for the conversation list. */
function formatListTimestamp(value: Date | string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  if (isSameDay(d, now)) return timeFmt.format(d);
  return d.getFullYear() === now.getFullYear() ? dateFmt.format(d) : dateYearFmt.format(d);
}

function initials(name: string) {
  return (name || "?").trim().charAt(0).toUpperCase();
}

// ---------------------------------------------------------------------------
// Conversation pane (shared by "Individual Messages" and "Team Chat")
// ---------------------------------------------------------------------------

interface ConversationPaneProps {
  title: string;
  emptyText: string;
  conversations: User[];
  messages: Message[];
  currentUserId: number | null;
  selectedUserId: number | null;
  onSelect: (userId: number) => void;
  /** Ids of users whose messages have been marked read locally this session. */
  readLocally: Set<number>;
  sendState: FormState;
  sendAction: (formData: FormData) => void;
  messageContent: string;
  setMessageContent: (value: string) => void;
}

function ConversationPane({
  title,
  emptyText,
  conversations,
  messages,
  currentUserId,
  selectedUserId,
  onSelect,
  readLocally,
  sendState,
  sendAction,
  messageContent,
  setMessageContent,
}: ConversationPaneProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Per-conversation summary: last message, unread count.
  const summaries = useMemo(() => {
    const map = new Map<number, { last: Message | null; unread: number }>();
    for (const convo of conversations) {
      let last: Message | null = null;
      let unread = 0;
      for (const msg of messages) {
        const involves =
          (msg.senderId === currentUserId && msg.recipientId === convo.id) ||
          (msg.senderId === convo.id && msg.recipientId === currentUserId);
        if (!involves) continue;
        if (!last || new Date(msg.timestamp) > new Date(last.timestamp)) last = msg;
        if (msg.senderId === convo.id && msg.recipientId === currentUserId && !msg.read && !readLocally.has(convo.id)) {
          unread += 1;
        }
      }
      map.set(convo.id, { last, unread });
    }
    return map;
  }, [conversations, messages, currentUserId, readLocally]);

  // Most recent conversations first; ones with no messages yet at the bottom.
  const orderedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      const ta = summaries.get(a.id)?.last?.timestamp;
      const tb = summaries.get(b.id)?.last?.timestamp;
      if (!ta && !tb) return 0;
      if (!ta) return 1;
      if (!tb) return -1;
      return new Date(tb).getTime() - new Date(ta).getTime();
    });
  }, [conversations, summaries]);

  const thread = useMemo(
    () =>
      selectedUserId === null
        ? []
        : messages
            .filter(
              (msg) =>
                (msg.senderId === currentUserId && msg.recipientId === selectedUserId) ||
                (msg.senderId === selectedUserId && msg.recipientId === currentUserId),
            )
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [messages, currentUserId, selectedUserId],
  );

  const selectedUser = conversations.find((c) => c.id === selectedUserId) ?? null;

  // Auto-scroll to the latest message whenever the thread changes.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread.length, selectedUserId]);

  // Focus the composer when a conversation is opened.
  useEffect(() => {
    if (selectedUserId !== null) textareaRef.current?.focus();
  }, [selectedUserId]);

  const submitIfReady = useCallback(() => {
    if (messageContent.trim().length === 0) return;
    formRef.current?.requestSubmit();
  }, [messageContent]);

  return (
    <div className="hth-card flex h-[calc(100vh-15rem)] min-h-[28rem] overflow-hidden">
      {/* Conversation list */}
      <aside className="flex w-full max-w-[18rem] shrink-0 flex-col border-r border-gray-200 bg-[#fafafa] sm:w-1/3">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">{title}</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {orderedConversations.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">{emptyText}</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {orderedConversations.map((convoUser) => {
                const summary = summaries.get(convoUser.id);
                const unread = summary?.unread ?? 0;
                const last = summary?.last ?? null;
                const active = selectedUserId === convoUser.id;
                return (
                  <li key={convoUser.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(convoUser.id)}
                      aria-current={active ? "true" : undefined}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                        active ? "bg-white shadow-[inset_3px_0_0_#910000]" : "hover:bg-white"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-base leading-none ${
                          active ? "bg-[#910000] text-white" : "bg-[#2b2b2b] text-white"
                        }`}
                      >
                        {initials(convoUser.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`truncate text-sm text-gray-900 ${unread > 0 ? "font-bold" : "font-medium"}`}
                          >
                            {convoUser.name}
                          </span>
                          {last && (
                            <span className="shrink-0 text-[11px] text-gray-400">{formatListTimestamp(last.timestamp)}</span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2">
                          <p className={`truncate text-xs ${unread > 0 ? "text-gray-800" : "text-gray-500"}`}>
                            {last
                              ? `${last.senderId === currentUserId ? "You: " : ""}${last.content}`
                              : "No messages yet"}
                          </p>
                          {unread > 0 && (
                            <span
                              className="ml-auto h-2.5 w-2.5 shrink-0 rounded-full bg-[#910000]"
                              aria-label={`${unread} unread`}
                              title={`${unread} unread`}
                            />
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* Thread */}
      <section className="flex min-w-0 flex-1 flex-col bg-[#f6f6f6]">
        {selectedUser ? (
          <>
            <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-5 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2b2b2b] font-display text-base leading-none text-white">
                {initials(selectedUser.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900">{selectedUser.name}</p>
                <p className="truncate text-xs text-gray-500">{selectedUser.email}</p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {thread.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-500">
                  No messages yet. Say hello to {selectedUser.name.split(" ")[0]}.
                </p>
              ) : (
                thread.map((msg) => {
                  const mine = msg.senderId === currentUserId;
                  return (
                    <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                          mine
                            ? "rounded-br-sm bg-[#910000] text-white"
                            : "rounded-bl-sm border border-gray-200 bg-white text-gray-900"
                        }`}
                      >
                        {!mine && (
                          <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#910000]">
                            {msg.sender.name}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        <p className={`mt-1 text-right text-[11px] ${mine ? "text-white/70" : "text-gray-400"}`}>
                          {formatTimestamp(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form ref={formRef} action={sendAction} className="border-t border-gray-200 bg-white p-4">
              <input type="hidden" name="recipient" value={selectedUser.id} />
              <label htmlFor="messageContent" className="sr-only">
                Message
              </label>
              <div className="flex items-end gap-3">
                <textarea
                  ref={textareaRef}
                  id="messageContent"
                  name="messageContent"
                  rows={2}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      submitIfReady();
                    }
                  }}
                  placeholder={`Message ${selectedUser.name.split(" ")[0]}…`}
                  required
                  className={`${inputClass} resize-none`}
                />
                <SubmitButton pendingText="Sending…" className={`${primaryButtonClass} shrink-0 px-5 py-2.5`}>
                  Send
                </SubmitButton>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-gray-400">Enter to send · Shift+Enter for a new line</p>
                <div className="flex-1 min-w-[12rem]">
                  <FormError message={sendState?.error} />
                </div>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#910000]/10 font-display text-xl text-[#910000]">
              ✉
            </div>
            <p className="font-semibold text-gray-900">Pick a conversation</p>
            <p className="mt-1 max-w-xs text-sm text-gray-500">Select someone on the left to read and reply.</p>
          </div>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MessagesPage({
  isAdmin,
  initialInternalUsers,
  initialMassMessages,
  initialLocations,
  initialDemographics,
  initialIndividualMessages,
  currentUserId,
  defaultConversationUser,
}: MessagesPageProps) {
  const [massSendState, massSendAction] = useActionState<FormState, FormData>(sendMassMessage, { message: "" });
  const [sendState, sendAction] = useActionState<FormState, FormData>(sendMessage, { message: "" });
  const [messageContent, setMessageContent] = useState("");
  const [massMessageContent, setMassMessageContent] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("individual-messages");
  const individualMessages: Message[] = initialIndividualMessages;
  const [selectedLocations, setSelectedLocations] = useState<number[]>([]);
  const [selectedDemographics, setSelectedDemographics] = useState<number[]>([]);
  const [excludeOptedOut, setExcludeOptedOut] = useState(true);
  const [conversations, setConversations] = useState<User[]>([]);
  const [selectedConversationUserId, setSelectedConversationUserId] = useState<number | null>(null);
  const [teamConversations, setTeamConversations] = useState<User[]>([]);
  const [readLocally, setReadLocally] = useState<Set<number>>(() => new Set());
  const [applicableBusinesses, setApplicableBusinesses] = useState<
    { id: number; businessName: string; ownerName: string }[]
  >([]);

  const canSeeTeamChat = isAdmin || (currentUserId !== null && initialInternalUsers.some((u) => u.id === currentUserId));

  useEffect(() => {
    if (currentUserId) {
      if (activeTab === "team-chat") {
        getConversations(currentUserId, true).then(setTeamConversations);
      } else {
        getConversations(currentUserId).then((convos) => {
          // Always ensure user id=1 is in the conversations list
          if (defaultConversationUser && !convos.find((c) => c.id === defaultConversationUser.id)) {
            setConversations([defaultConversationUser, ...convos]);
          } else {
            setConversations(convos);
          }
        });
      }
    }
  }, [activeTab, currentUserId, defaultConversationUser]);

  useEffect(() => {
    getApplicableBusinesses(selectedLocations, selectedDemographics).then(setApplicableBusinesses);
  }, [selectedLocations, selectedDemographics]);

  // Opening a conversation marks everything they sent us as read.
  useEffect(() => {
    if (selectedConversationUserId === null || !currentUserId) return;
    const otherUserId = selectedConversationUserId;
    const hasUnread = individualMessages.some(
      (m) => m.senderId === otherUserId && m.recipientId === currentUserId && !m.read,
    );
    if (!hasUnread) return;
    setReadLocally((prev) => {
      if (prev.has(otherUserId)) return prev;
      const next = new Set(prev);
      next.add(otherUserId);
      return next;
    });
    void markConversationRead(otherUserId);
  }, [selectedConversationUserId, currentUserId, individualMessages]);

  // Clear the composer once a message goes through.
  useEffect(() => {
    if (sendState?.message && !sendState.error) setMessageContent("");
  }, [sendState]);

  // Clear the mass composer once a mass message goes through.
  useEffect(() => {
    if (massSendState?.message && !massSendState.error) setMassMessageContent("");
  }, [massSendState]);

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setSelectedConversationUserId(null);
  };

  const handleLocationChange = (locationId: number) => {
    setSelectedLocations((prev) =>
      prev.includes(locationId) ? prev.filter((id) => id !== locationId) : [...prev, locationId],
    );
  };

  const handleDemographicChange = (demographicId: number) => {
    setSelectedDemographics((prev) =>
      prev.includes(demographicId) ? prev.filter((id) => id !== demographicId) : [...prev, demographicId],
    );
  };

  const tabButtonClass = (tab: Tab) =>
    `rounded-lg px-4 py-2 text-sm font-semibold transition ${
      activeTab === tab
        ? "bg-[#910000] text-white shadow-sm"
        : "border-2 border-gray-200 bg-white text-gray-700 hover:border-gray-400"
    }`;

  const demographicGroup = (category: string, keyPrefix: string) => (
    <div className="mt-1 rounded-lg border border-gray-300 p-3">
      <h4 className="mb-2 text-sm font-semibold text-gray-800">{category}</h4>
      <div className="max-h-40 space-y-1 overflow-y-auto">
        {initialDemographics
          .filter((d) => d.category === category)
          .map((demographic) => (
            <div key={demographic.id} className="flex items-center">
              <input
                id={`demographic-${keyPrefix}-${demographic.id}`}
                name="demographics"
                type="checkbox"
                value={demographic.id}
                checked={selectedDemographics.includes(demographic.id)}
                onChange={() => handleDemographicChange(demographic.id)}
                className={checkboxClass}
              />
              <label htmlFor={`demographic-${keyPrefix}-${demographic.id}`} className="ml-2 text-sm text-gray-900">
                {demographic.name}
              </label>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between hth-fade-up">
        <div>
          <p className="text-[#910000] uppercase tracking-[0.3em] text-xs font-semibold mb-2">Support</p>
          <h1 className="text-5xl text-gray-900 leading-none">Messages</h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-600">
            Ongoing conversations with the Heighten The Hustle team. You&apos;ll get an email whenever someone replies.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => switchTab("individual-messages")} className={tabButtonClass("individual-messages")}>
            Messages
          </button>
          {canSeeTeamChat && (
            <button type="button" onClick={() => switchTab("team-chat")} className={tabButtonClass("team-chat")}>
              Team Chat
            </button>
          )}
          {isAdmin && (
            <button type="button" onClick={() => switchTab("mass-messages")} className={tabButtonClass("mass-messages")}>
              Mass Messages
            </button>
          )}
        </div>
      </header>

      <div className="hth-fade-up hth-fade-up-delay-1">
        {activeTab === "individual-messages" && (
          <ConversationPane
            title="Conversations"
            emptyText="No conversations yet."
            conversations={conversations}
            messages={individualMessages}
            currentUserId={currentUserId}
            selectedUserId={selectedConversationUserId}
            onSelect={setSelectedConversationUserId}
            readLocally={readLocally}
            sendState={sendState}
            sendAction={sendAction}
            messageContent={messageContent}
            setMessageContent={setMessageContent}
          />
        )}

        {activeTab === "team-chat" && (
          <ConversationPane
            title="Team"
            emptyText="No team conversations yet."
            conversations={teamConversations}
            messages={individualMessages}
            currentUserId={currentUserId}
            selectedUserId={selectedConversationUserId}
            onSelect={setSelectedConversationUserId}
            readLocally={readLocally}
            sendState={sendState}
            sendAction={sendAction}
            messageContent={messageContent}
            setMessageContent={setMessageContent}
          />
        )}

        {activeTab === "mass-messages" && isAdmin && (
          <div className="space-y-6">
            <section className="hth-card p-6 lg:p-8">
              <h2 className="text-2xl leading-tight text-gray-900">Send a mass message</h2>
              <p className="mt-1 text-sm text-gray-600">
                Every targeted member gets the message in their inbox here and an email copy (members who opted out are
                not emailed).
              </p>

              <div className="mt-5">
                <p className="text-sm font-medium text-gray-800">
                  Applicable businesses:{" "}
                  <span className="font-display text-lg text-[#910000]">{applicableBusinesses.length}</span>
                </p>
                {applicableBusinesses.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-gray-200">
                    <ul className="divide-y divide-gray-100">
                      {applicableBusinesses.map((biz) => (
                        <li key={biz.id} className="px-3 py-2 text-sm text-gray-800">
                          <span className="font-medium">{biz.businessName}</span>
                          <span className="text-gray-500"> — {biz.ownerName}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <form action={massSendAction} className="mt-5 space-y-5">
                <div>
                  <label htmlFor="massMessageContent" className="block text-sm font-medium text-gray-800">
                    Message <span className="text-[#910000]">*</span>
                  </label>
                  <textarea
                    id="massMessageContent"
                    name="massMessageContent"
                    rows={4}
                    value={massMessageContent}
                    onChange={(e) => setMassMessageContent(e.target.value)}
                    placeholder="Type your message here..."
                    required
                    className={`${inputClass} mt-1`}
                  />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-800">Target locations</label>
                    <div className="mt-1 max-h-48 space-y-1 overflow-y-auto rounded-lg border border-gray-300 p-3">
                      {initialLocations.map((location) => (
                        <div key={location.id} className="flex items-center">
                          <input
                            id={`location-${location.id}`}
                            name="locations"
                            type="checkbox"
                            value={location.id}
                            checked={selectedLocations.includes(location.id)}
                            onChange={() => handleLocationChange(location.id)}
                            className={checkboxClass}
                          />
                          <label htmlFor={`location-${location.id}`} className="ml-2 text-sm text-gray-900">
                            {location.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800">Target demographics</label>
                    <div className="space-y-3">
                      {demographicGroup("Gender", "gender")}
                      {demographicGroup("Race", "race")}
                      {demographicGroup("Religion", "religion")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="excludeOptedOut"
                    name="excludeOptedOut"
                    type="checkbox"
                    checked={excludeOptedOut}
                    onChange={(e) => setExcludeOptedOut(e.target.checked)}
                    className={checkboxClass}
                  />
                  <label htmlFor="excludeOptedOut" className="ml-2 text-sm text-gray-900">
                    Exclude users who have opted out
                  </label>
                </div>

                <FormSuccess message={massSendState?.message} />
                <FormError message={massSendState?.error} />

                <div>
                  <SubmitButton pendingText="Sending…">Send mass message</SubmitButton>
                </div>
              </form>
            </section>

            <section className="hth-card p-6 lg:p-8">
              <h2 className="text-2xl leading-tight text-gray-900">Sent mass messages</h2>
              <div className="mt-4 max-h-96 space-y-3 overflow-y-auto">
                {initialMassMessages.length === 0 ? (
                  <p className="text-sm text-gray-500">No mass messages sent yet.</p>
                ) : (
                  [...initialMassMessages]
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((msg) => (
                      <div key={msg.id} className="rounded-xl border border-gray-200 bg-[#fafafa] p-4">
                        <p className="whitespace-pre-wrap text-sm text-gray-800">{msg.content}</p>
                        <p className="mt-2 text-right text-xs text-gray-400">{formatTimestamp(msg.timestamp)}</p>
                      </div>
                    ))
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
