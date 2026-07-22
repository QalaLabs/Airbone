"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bot, PhoneCall, Play, Pause, FileText, Settings, Sparkles, 
  Search, SlidersHorizontal, CheckCircle2, Clock, PhoneForwarded, User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/use-toast";

const MOCK_CALL_LOGS = [
  { id: "call-101", candidate: "Rajesh Kumar", phone: "+91 98765 43210", duration: "3m 42s", timestamp: "10 mins ago", status: "SUCCESS_CONVERSION", successScore: "95%", transcript: "Vapi: Hello Rajesh! Welcome to Airborne Aviation Academy. I saw your inquiry for the DGCA CPL Ground School. How can I assist you today?\n\nRajesh: Hi, I wanted to know if morning batches are available?\n\nVapi: Absolutely! We have the Alpha Morning Batch starting next Monday from 8 AM to 12 PM at our Delhi Campus. Would you like me to send the syllabus and fee breakdown to your WhatsApp?\n\nRajesh: Yes please, that would be very helpful.", recordingUrl: "https://actions.google.com/sounds/v1/communication/incoming_call_ringtone.ogg" },
  { id: "call-102", candidate: "Meera Nair", phone: "+91 98112 23344", duration: "1m 58s", timestamp: "35 mins ago", status: "SUCCESS_ANSWERED", successScore: "85%", transcript: "Vapi: Hi Meera, this is the AI Assistant from Airborne Aviation Academy. Are you looking for A320 Simulator training or CPL ground papers?\n\nMeera: I am inquiring about the A320 fixed base simulator for cadet prep.\n\nVapi: Excellent choice. We have dedicated screening prep sessions on weekends. I have scheduled a callback from our senior airline counselor to discuss your specific screening dates.", recordingUrl: "https://actions.google.com/sounds/v1/communication/incoming_call_ringtone.ogg" },
  { id: "call-103", candidate: "Amit Sen", phone: "+91 99223 34455", duration: "4m 15s", timestamp: "2 hours ago", status: "SUCCESS_CONVERSION", successScore: "92%", transcript: "Vapi: Hello Amit, welcome to Airborne Aviation Academy. I noticed you completed your 12th board exams. Are you planning to apply for the Cadet Pilot Program?\n\nAmit: Yes, but I am worried about the medical examination.\n\nVapi: No need to worry! We guide all our cadets through the DGCA Class II medical assessment before tuition fee payment. Let me share the medical verification dossier with you.", recordingUrl: "https://actions.google.com/sounds/v1/communication/incoming_call_ringtone.ogg" },
  { id: "call-104", candidate: "Suresh Patel", phone: "+91 98221 15566", duration: "0m 35s", timestamp: "4 hours ago", status: "USER_HUNGUP", successScore: "30%", transcript: "Vapi: Hello Suresh, welcome to Airborne Aviation...\n\nSuresh: Can you call me back later? I am driving right now.\n\nVapi: Of course, Suresh. Have a safe drive. I will arrange a callback for this evening.", recordingUrl: "https://actions.google.com/sounds/v1/communication/incoming_call_ringtone.ogg" },
];

interface VapiCall {
  id: string;
  candidate: string;
  phone: string;
  duration: string;
  timestamp: string;
  status: string;
  successScore: string;
  transcript: string;
  recordingUrl: string;
}

export default function VapiPage() {
  const [activeTab, setActiveTab] = React.useState("logs");
  const [search, setSearch] = React.useState("");
  const [selectedCall, setSelectedCall] = React.useState<VapiCall | null>(null);
  const [playingCallId, setPlayingCallId] = React.useState<string | null>(null);

  // Vapi Assistant Config state
  const [promptConfig, setPromptConfig] = React.useState(`You are Captain Maya, an expert aviation admissions AI assistant for Airborne Aviation Academy. Your goal is to guide candidates through DGCA CPL Ground School, A320 Simulator training, and airline cadet prep. Always maintain a premium, polished, professional airline captain persona.`);
  const [voiceModel, setVoiceModel] = React.useState("elevenlabs/shimmer-premium");
  const [fallbackNumber, setFallbackNumber] = React.useState("+91 98110 09988");

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Vapi Voice AI Configured", description: "Assistant prompt, voice model, and fallback numbers synchronized with Vapi.ai webhooks." });
  };

  const handleTogglePlay = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingCallId === id) {
      setPlayingCallId(null);
      toast({ title: "Playback Paused" });
    } else {
      setPlayingCallId(id);
      toast({ title: "Playing Audio Recording", description: "Streaming secure Vapi audio log..." });
    }
  };

  const filteredLogs = MOCK_CALL_LOGS.filter(log => 
    log.candidate.toLowerCase().includes(search.toLowerCase()) || log.phone.includes(search)
  );

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Vapi Voice AI Counselor & Logs" 
        description="Monitor real-time AI phone call recordings, inspect AI conversation transcripts, evaluate conversion metrics, and tune custom LLM assistant prompts." 
        action={
          <Button onClick={() => setActiveTab("config")} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105">
            <Settings className="h-4 w-4 mr-2" />
            Tune Voice AI Prompt & Model
          </Button>
        }
      />

      {/* AI Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "AI Call Success Rate", value: "88.5%", change: "+5.2% vs last month", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle2 },
          { title: "Average Call Duration", value: "2m 45s", change: "Optimal lead engagement", color: "text-blue-400", bg: "bg-blue-500/10", icon: Clock },
          { title: "Total Voice Handlings", value: "1,248 Calls", change: "Zero counselor fatigue", color: "text-purple-400", bg: "bg-purple-500/10", icon: Bot },
          { title: "Human Fallback Escalate", value: "4.2%", change: "Escalated to master counselors", color: "text-amber-400", bg: "bg-amber-500/10", icon: PhoneForwarded },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.05 }} className="glass-card rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">{kpi.title}</span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${kpi.bg} ${kpi.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-white tracking-tight">{kpi.value}</div>
                <p className="text-[11px] font-medium text-muted-foreground mt-1">{kpi.change}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1">
        {[
          { id: "logs", label: "Call Transcripts & Recording Playbacks", icon: PhoneCall },
          { id: "config", label: "Assistant Prompt & Voice Configuration", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                isActive ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-white/5 hover:text-foreground border-transparent"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-muted-foreground"}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "logs" && (
          <motion.div key="logs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <PhoneCall className="h-5 w-5 text-primary" /> Vapi Voice AI Interception Logs
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">Review live call transcripts, candidate sentiment, and success conversion scores.</p>
                </div>
                <Input placeholder="Search logs by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-secondary/40 border-white/10 text-xs font-semibold w-64 text-white" />
              </div>

              <div className="space-y-3 pt-2">
                {filteredLogs.map((log) => (
                  <div key={log.id} onClick={() => setSelectedCall(log)} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4 min-w-0">
                      <button 
                        onClick={(e) => handleTogglePlay(log.id, e)} 
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all ${
                          playingCallId === log.id ? "bg-primary text-white border-primary shadow-lg shadow-primary/30 animate-pulse" : "bg-secondary/60 text-primary border-white/10 hover:bg-primary hover:text-white"
                        }`}
                        title={playingCallId === log.id ? "Pause Playback" : "Listen to Audio Recording"}
                      >
                        {playingCallId === log.id ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                      </button>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">{log.candidate}</p>
                          <span className="text-[10px] font-mono font-semibold bg-secondary px-2 py-0.5 rounded text-muted-foreground border border-white/5">
                            {log.phone}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Call Duration: <span className="text-white font-medium">{log.duration}</span> • Intercepted {log.timestamp}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] font-bold text-muted-foreground block uppercase">AI Success Score</span>
                        <span className="text-sm font-bold text-emerald-400 mt-0.5 block">{log.successScore}</span>
                      </div>
                      <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${log.status.includes("SUCCESS") ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"}`}>
                        {log.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "config" && (
          <motion.div key="config" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <form onSubmit={handleSaveConfig} className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" /> Vapi Voice Assistant Personality & Model Setup
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Configure system prompt instructions, speech synthesis voice models, and fallback human escalations.</p>
              </div>

              <div className="space-y-4 pt-2 max-w-3xl">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Master Assistant Personality Prompt *</label>
                  <Textarea 
                    value={promptConfig} 
                    onChange={(e) => setPromptConfig(e.target.value)} 
                    rows={6} 
                    required 
                    className="bg-secondary/40 border-white/10 text-xs font-medium text-white leading-relaxed" 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Voice Synthesis Model *</label>
                    <select 
                      value={voiceModel} 
                      onChange={(e) => setVoiceModel(e.target.value)} 
                      className="flex h-9 w-full rounded-lg border border-white/10 bg-secondary/60 px-3 py-1 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    >
                      <option value="elevenlabs/shimmer-premium" className="bg-slate-900">ElevenLabs Shimmer (Female Premium)</option>
                      <option value="elevenlabs/adam-professional" className="bg-slate-900">ElevenLabs Adam (Male Captain)</option>
                      <option value="playht/narration-expert" className="bg-slate-900">Play.ht Expert Counselor</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Fallback Counselor Phone (Escalation) *</label>
                    <Input 
                      value={fallbackNumber} 
                      onChange={(e) => setFallbackNumber(e.target.value)} 
                      required 
                      className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" 
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
                  <span className="text-xs font-bold text-white block flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary" /> Low Latency Deepgram Transcription Enabled
                  </span>
                  <p className="text-[11px] text-muted-foreground">Voice AI uses dedicated edge servers in Mumbai to ensure sub-500ms conversational response times.</p>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
                    Deploy AI Configurations to Webhooks
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call Details Modal */}
      <Dialog open={!!selectedCall} onOpenChange={(o) => !o && setSelectedCall(null)}>
        <DialogContent className="max-w-3xl glass-panel border-white/10 bg-slate-900/95 p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-white/10 bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <PhoneCall className="h-6 w-6 text-primary" />
                  Candidate Interception: {selectedCall?.candidate}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Candidate Phone: <span className="font-mono text-primary font-bold">{selectedCall?.phone}</span> • Duration: <span className="text-white font-semibold">{selectedCall?.duration}</span>
                </p>
              </div>
              <span className="text-xs font-extrabold bg-primary/20 text-emerald-400 border border-primary/30 px-3 py-1 rounded-full">
                Score: {selectedCall?.successScore}
              </span>
            </div>
          </DialogHeader>

          {selectedCall && (
            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Complete Conversation Transcript</h3>
                <div className="p-4 rounded-xl bg-secondary/40 border border-white/5 whitespace-pre-line text-xs font-medium text-white leading-relaxed font-mono">
                  {selectedCall.transcript}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-white/10">
                <div>
                  <span className="text-xs font-bold text-white block">Call Playback Audio Recording</span>
                  <p className="text-[11px] text-muted-foreground">High fidelity dual-channel recording.</p>
                </div>
                <Button onClick={() => toast({ title: "Playing Full Call Recording", description: "Stream started from secure S3 voice vault." })} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold">
                  <Play className="h-3.5 w-3.5 mr-1.5" /> Listen to Audio
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className="p-6 border-t border-white/10 bg-slate-900/80">
            <Button variant="outline" onClick={() => setSelectedCall(null)} className="border-white/10 hover:bg-white/5 text-xs font-bold">
              Close Dossier
            </Button>
            <Button onClick={() => toast({ title: "Escalation Created", description: "Counselor assigned to follow up on this AI call." })} className="bg-secondary text-white hover:bg-secondary/80 text-xs font-bold">
              Escalate to Senior Counselor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
