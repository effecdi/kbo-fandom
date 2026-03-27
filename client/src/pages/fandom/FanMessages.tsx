import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { StudioLayout } from "@/components/StudioLayout";
import {
  Send, ArrowLeft, Search, MessageCircle, Check, CheckCheck,
  Circle, Smile, Image,
} from "lucide-react";
import {
  listItems, addItem, seedIfEmpty, STORE_KEYS, getFandomProfile, generateId,
  type FanDM, type FanCreator, type KboTeam,
} from "@/lib/local-store";

interface Conversation {
  peerId: string;
  peerName: string;
  peerAvatar: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  groupColor: string;
}

export function FanMessages() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [dms, setDms] = useState<FanDM[]>([]);
  const [creators, setCreators] = useState<FanCreator[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<string | null>(searchParams.get("to"));
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const profile = getFandomProfile();
  const themeColor = "var(--fandom-primary, #7B2FF7)";

  useEffect(() => {
    seedIfEmpty();
    setDms(listItems<FanDM>(STORE_KEYS.FAN_DMS));
    setCreators(listItems<FanCreator>(STORE_KEYS.FAN_CREATORS));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedPeer, dms]);

  // Build conversation list
  const groups = listItems<KboTeam>(STORE_KEYS.KBO_TEAMS);
  const conversations: Conversation[] = [];
  const seenPeers = new Set<string>();

  dms.forEach((dm) => {
    const peerId = dm.senderId === "me" ? dm.receiverId : dm.senderId;
    if (seenPeers.has(peerId)) return;
    seenPeers.add(peerId);

    const peerDms = dms.filter(
      (d) => (d.senderId === peerId || d.receiverId === peerId) && (d.senderId === "me" || d.receiverId === "me")
    );
    const last = peerDms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    const unread = peerDms.filter((d) => d.senderId !== "me" && !d.read).length;
    const creator = creators.find((c) => c.id === peerId);
    const group = creator ? groups.find((g) => g.id === creator.groupId) : null;

    conversations.push({
      peerId,
      peerName: dm.senderId === "me" ? dm.receiverName : dm.senderName,
      peerAvatar: dm.senderId === "me" ? dm.receiverAvatar : dm.senderAvatar,
      lastMessage: last?.content || "",
      lastTime: last?.createdAt || "",
      unread,
      groupColor: group?.coverColor || "#7B2FF7",
    });
  });

  // If navigating from FanProfile with ?to= and no existing conversation
  const targetParam = searchParams.get("to");
  if (targetParam && !seenPeers.has(targetParam)) {
    const creator = creators.find((c) => c.id === targetParam);
    if (creator) {
      const group = groups.find((g) => g.id === creator.groupId);
      conversations.unshift({
        peerId: creator.id,
        peerName: creator.nickname,
        peerAvatar: creator.avatar,
        lastMessage: "",
        lastTime: "",
        unread: 0,
        groupColor: group?.coverColor || "#7B2FF7",
      });
    }
  }

  conversations.sort((a, b) => {
    if (!a.lastTime) return -1;
    if (!b.lastTime) return 1;
    return new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime();
  });

  const filteredConversations = searchQuery
    ? conversations.filter((c) => c.peerName.includes(searchQuery))
    : conversations;

  // Messages for selected peer
  const peerMessages = selectedPeer
    ? dms
        .filter(
          (d) =>
            (d.senderId === selectedPeer && d.receiverId === "me") ||
            (d.senderId === "me" && d.receiverId === selectedPeer)
        )
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : [];

  const selectedConvo = conversations.find((c) => c.peerId === selectedPeer);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedPeer || !profile) return;
    const peer = conversations.find((c) => c.peerId === selectedPeer);
    const dm: FanDM = {
      id: generateId("dm"),
      senderId: "me",
      senderName: profile.nickname,
      senderAvatar: profile.nickname.charAt(0).toUpperCase(),
      receiverId: selectedPeer,
      receiverName: peer?.peerName || "",
      receiverAvatar: peer?.peerAvatar || "",
      content: newMessage,
      read: true,
      createdAt: new Date().toISOString(),
    };
    addItem(STORE_KEYS.FAN_DMS, dm);
    setDms((prev) => [...prev, dm]);
    setNewMessage("");
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return "오늘";
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "어제";
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <StudioLayout noPadding>
      <div className="flex h-[calc(100vh-4rem)] bg-background">
        {/* Conversation List */}
        <div className={`w-80 border-r border-border flex flex-col bg-card ${selectedPeer ? "hidden md:flex" : "flex"}`}>
          {/* Header */}
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-black text-foreground flex items-center gap-2 mb-3">
              <MessageCircle className="w-5 h-5" style={{ color: themeColor }} />
              메시지
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="크리에이터 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 border-0 text-foreground placeholder-muted-foreground"
                style={{ "--tw-ring-color": themeColor } as any}
              />
            </div>
          </div>

          {/* Conversation items */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((convo) => (
                <button
                  key={convo.peerId}
                  onClick={() => setSelectedPeer(convo.peerId)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-all text-left ${
                    selectedPeer === convo.peerId
                      ? "bg-muted"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="relative">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: convo.groupColor }}
                    >
                      {convo.peerAvatar}
                    </div>
                    {convo.unread > 0 && (
                      <span
                        className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-[10px] text-white font-bold flex items-center justify-center"
                        style={{ background: convo.groupColor }}
                      >
                        {convo.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm truncate ${convo.unread > 0 ? "font-bold text-foreground" : "font-medium text-foreground"}`}>
                        {convo.peerName}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                        {convo.lastTime ? formatDate(convo.lastTime) : "새 대화"}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${convo.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {convo.lastMessage || "메시지를 보내보세요"}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">대화가 없습니다</p>
                <p className="text-xs mt-1">팬 크리에이터 프로필에서 DM을 보내보세요</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!selectedPeer ? "hidden md:flex" : "flex"}`}>
          {selectedPeer && selectedConvo ? (
            <>
              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-card">
                <button
                  onClick={() => setSelectedPeer(null)}
                  className="md:hidden p-1 rounded-lg hover:bg-muted transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate(`/fandom/fans/${selectedPeer}`)}
                  className="flex items-center gap-3 hover:opacity-80 transition-all"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: selectedConvo.groupColor }}
                  >
                    {selectedConvo.peerAvatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selectedConvo.peerName}</p>
                    <p className="text-[11px] text-muted-foreground">프로필 보기</p>
                  </div>
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {peerMessages.length === 0 && (
                  <div className="text-center py-20 text-muted-foreground">
                    <Send className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">첫 메시지를 보내보세요!</p>
                  </div>
                )}
                {peerMessages.map((msg) => {
                  const isMine = msg.senderId === "me";
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] ${isMine ? "order-2" : ""}`}>
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm ${
                            isMine
                              ? "text-white rounded-br-sm"
                              : "bg-muted text-foreground rounded-bl-sm"
                          }`}
                          style={isMine ? { background: selectedConvo.groupColor } : {}}
                        >
                          {msg.content}
                        </div>
                        <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : ""}`}>
                          <span className="text-[10px] text-muted-foreground">{formatTime(msg.createdAt)}</span>
                          {isMine && (
                            msg.read
                              ? <CheckCheck className="w-3 h-3 text-blue-400" />
                              : <Check className="w-3 h-3 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-border bg-card">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="메시지를 입력하세요..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 border-0 text-foreground placeholder-muted-foreground"
                    style={{ "--tw-ring-color": themeColor } as any}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim()}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-50"
                    style={{ background: selectedConvo.groupColor }}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: `${themeColor}15` }}
                >
                  <MessageCircle className="w-8 h-8" style={{ color: themeColor }} />
                </div>
                <p className="text-foreground font-semibold">대화를 선택하세요</p>
                <p className="text-sm text-muted-foreground mt-1">왼쪽에서 대화를 선택하거나 새 DM을 보내보세요</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </StudioLayout>
  );
}
