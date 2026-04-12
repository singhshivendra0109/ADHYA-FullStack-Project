import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, User, ShieldCheck, Clock, MessageCircle } from 'lucide-react';
import api from '../api/api';

const ChatPage = ({ currentUser }) => {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [tutor, setTutor] = useState(null);
  const [inputText, setInputText] = useState("");
  const [status, setStatus] = useState("new");
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const socket = useRef(null);
  const scrollRef = useRef();

  // 1. Initial Data Load
  useEffect(() => {
    const initChat = async () => {
      try {
        setLoading(true);
        const [historyRes, permRes] = await Promise.all([
          api.get(`/chat/messages/${tutorId}`),
          api.get(`/chat/check-permission/${tutorId}`)
        ]);

        setMessages(historyRes.data);
        setStatus(permRes.data.status);

        try {
          let profileRes;
          if (currentUser?.role === 'student') {
            profileRes = await api.get(`/profiles/user/${tutorId}`);
          } else {
            profileRes = await api.get(`/student/${tutorId}`);
          }
          setTutor(profileRes.data);
        } catch (profileErr) {
          try {
            const fallbackRes = await api.get(`/profiles/user/${tutorId}`);
            setTutor(fallbackRes.data);
          } catch (e) {
            setTutor({ full_name: "User " + tutorId, profile_picture: null });
          }
        }
      } catch (err) {
        console.error("Chat Init Failed:", err);
      } finally {
        setLoading(false);
      }
    };

    if (tutorId && currentUser) initChat();
  }, [tutorId, currentUser]);

  // 2. WebSocket Connection Logic
  useEffect(() => {
    if (!currentUser?.id) return;

    let ws;
    const connect = () => {
      const wsUrl = `ws://127.0.0.1:8000/api/chat/ws/${currentUser.id}`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.sender_id === parseInt(tutorId) || data.sender_id === currentUser.id) {
          setMessages((prev) => {

            const exists = prev.some(m => m.id === data.id);
            if (exists) return prev;
            return [...prev, data];
          });
          if (data.status) setStatus(data.status);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setTimeout(connect, 3000);
      };

      socket.current = ws;
    };

    connect();
    return () => {
      if (socket.current) socket.current.close();
    };
  }, [currentUser, tutorId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    if (!socket.current || socket.current.readyState !== WebSocket.OPEN) {
      alert("Still connecting to server... Please wait a few seconds.");
      return;
    }

    const payload = { receiver_id: parseInt(tutorId), content: inputText };
    socket.current.send(JSON.stringify(payload));

    setInputText("");
    if (status === 'new') setStatus('pending');
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#fcfefd]">
      <div className="w-10 h-10 border-4 border-[#1F6666] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfefd] font-sans pb-10 text-left">
      <div className="max-w-5xl mx-auto px-6 pt-12">
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-black text-[#0F172A] uppercase text-[10px] tracking-widest hover:text-[#1F6666] transition-all">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-gray-100 shadow-sm">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></span>
            <span className="text-[9px] font-black uppercase text-gray-400">{isConnected ? 'Online' : 'Connecting...'}</span>
          </div>
        </div>

        <div className="bg-white rounded-[4rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-[75vh]">
          <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between bg-white">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-inner flex items-center justify-center">
                {tutor?.profile_picture ? (
                  <img src={tutor.profile_picture} className="w-full h-full object-cover" alt="User" />
                ) : (
                  <User size={30} className="text-gray-300" />
                )}
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#0F172A] uppercase tracking-tighter">
                  {tutor?.full_name || tutor?.name || "Chat User"}
                </h3>
                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                  {status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-10 space-y-6">
            {messages.map((msg, idx) => {
              const isMe = msg.sender_id === currentUser?.id;
              return (
                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-6 py-4 rounded-[2rem] shadow-sm ${isMe ? 'bg-[#1F6666] text-white rounded-tr-none' : 'bg-gray-50 text-[#0F172A] rounded-tl-none'}`}>
                    <p className="text-[15px] font-medium">{msg.content}</p>
                    <span className="text-[8px] opacity-40 block mt-1 text-right font-bold uppercase">
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>

          <div className="p-8 bg-white border-t border-gray-50">
            {status === 'pending' && currentUser?.role === 'student' ? (
              <div className="bg-orange-50 p-6 rounded-[2.5rem] text-center border border-orange-100">
                <p className="text-orange-700 font-black uppercase text-[10px] tracking-[2px]">
                  Waiting for mentor approval to unlock full session chat.
                </p>
              </div>
            ) : (
              <div className="flex gap-4 items-center max-w-4xl mx-auto w-full">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isConnected ? "Write a message..." : "Waiting for connection..."}
                  className="flex-1 bg-gray-50 border border-gray-100 py-5 px-8 rounded-[2rem] text-[#0F172A] font-bold outline-none focus:border-[#1F6666]/40 focus:bg-white transition-all shadow-inner"
                />
                <button
                  onClick={handleSend}
                  disabled={!isConnected}
                  className={`p-5 rounded-[1.5rem] shadow-xl transition-all active:scale-90 ${isConnected ? 'bg-[#1F6666] text-white hover:bg-[#0F172A]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  <Send size={24} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;