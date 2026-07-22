"use client";

import * as React from "react";
import { Plus, Calendar, Clock, Video, MoreVertical, ExternalLink } from "lucide-react";
import { getMeetings } from "@/lib/crm/meetings";
import { Meeting } from "@/lib/crm/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CRMDataTable, CRMColumn } from "@/components/shared/crm-data-table";

interface PrepContact {
  name: string;
  role: string;
  linkedin: boolean;
}

interface MeetingPrep {
  company: string;
  industry: string;
  size: string;
  recentNews: string;
  competitors: string[];
  keyContacts: PrepContact[];
  agenda: string[];
}

export default function CRMMeetingsPage() {
  const [meetings, setMeetings] = React.useState<Meeting[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getMeetings()
      .then((d) => {
        setMeetings(d);
        setLoading(false);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-white">Meetings</h1>
            <p className="text-sm text-muted-foreground">Schedule, prep, and track meetings</p>
          </div>
        </div>
        <div className="p-6 text-white text-xs">Loading meetings schedule...</div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500 font-bold">Error loading meetings: {error}</div>;
  }

  const upcomingMeetings = meetings.filter(
    (m) => m.status === "Scheduled" || m.status === "Confirmed"
  );
  const pastMeetings = meetings.filter(
    (m) => m.status === "Completed" || m.status === "Done" || m.status === "Cancelled"
  );
  const conversionRate = meetings.length > 0
    ? ((pastMeetings.filter((m) => m.status === "Completed" || m.status === "Done").length / meetings.length) * 100).toFixed(0)
    : null;
  const displayUpcoming = upcomingMeetings.length > 0 ? upcomingMeetings : meetings.slice(0, 4);
  const displayPast = pastMeetings.length > 0 ? pastMeetings : meetings.slice(0, 3);

  const firstUpcomingAttendees = displayUpcoming[0]?.attendees;
  const meetingPrepCompany: string = Array.isArray(firstUpcomingAttendees)
    ? (firstUpcomingAttendees[0] ?? "N/A")
    : typeof firstUpcomingAttendees === "string"
    ? firstUpcomingAttendees
    : "N/A";

  const firstUpcoming = displayUpcoming[0];
  const keyContactsList: PrepContact[] = firstUpcoming != null
    ? (Array.isArray(firstUpcoming.attendees)
        ? (firstUpcoming.attendees as string[])
        : typeof firstUpcoming.attendees === "string"
        ? [firstUpcoming.attendees as string]
        : []
      ).map((a) => ({
        name: a,
        role: "Contact",
        linkedin: false,
      }))
    : [];

  const meetingPrep: MeetingPrep = {
    company: meetingPrepCompany,
    industry: "N/A",
    size: "N/A",
    recentNews: "N/A",
    competitors: [],
    keyContacts: keyContactsList,
    agenda: [
      "Review current partnership",
      "Discuss upcoming opportunities",
      "Address any concerns",
    ],
  };

  const columns: CRMColumn<Meeting>[] = [
    {
      key: "title",
      header: "Meeting",
      render: (m: Meeting) => <span className="font-semibold text-white">{m.title}</span>,
    },
    { key: "date", header: "Date" },
    { key: "duration", header: "Duration" },
    { key: "outcome", header: "Outcome" },
    { key: "followUp", header: "Follow-up" },
    {
      key: "sentiment",
      header: "Sentiment",
      render: (m: Meeting) => {
        const sent = m.sentiment || "neutral";
        return (
          <Badge
            variant="outline"
            className={`${
              sent === "positive"
                ? "bg-emerald-500 text-white"
                : sent === "neutral"
                ? "bg-amber-500 text-white"
                : "bg-red-500 text-white"
            } border-none text-[9px] px-2 py-0.5 rounded-full`}
          >
            {sent}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">Meetings</h1>
          <p className="text-sm text-muted-foreground">Schedule, prep, and track meetings</p>
        </div>
        <Button className="text-xs font-semibold h-9">
          <Plus className="mr-2 h-4 w-4" />
          Schedule Meeting
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-semibold">This Week</p>
            <p className="text-2xl font-bold text-white mt-1">{upcomingMeetings.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-semibold">Meetings Booked</p>
            <p className="text-2xl font-bold text-white mt-1">{meetings.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-semibold">Conversion Rate</p>
            <p className="text-2xl font-bold text-white mt-1">
              {conversionRate !== null ? `${conversionRate}%` : "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-semibold">Avg Duration</p>
            <p className="text-2xl font-bold text-white mt-1">—</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card border-white/10 shadow-lg">
          <CardHeader className="border-b border-white/5 pb-3">
            <CardTitle className="text-sm font-semibold text-white">Upcoming Meetings</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {displayUpcoming.map((meeting, i) => {
                const attendeesList = Array.isArray(meeting.attendees)
                  ? meeting.attendees
                  : typeof meeting.attendees === "string"
                  ? [meeting.attendees]
                  : [];
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg border border-white/5 bg-secondary/10 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-white truncate">{meeting.title}</p>
                        {meeting.prep && (
                          <Badge variant="default" className="bg-emerald-500 border-none text-[8px] font-bold px-1.5 py-0.2 shrink-0">
                            Prepared
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground font-semibold">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {meeting.time}
                        </span>
                        <span>{meeting.duration}</span>
                        <span className="flex items-center gap-1">
                          <Video className="h-3 w-3" />
                          {meeting.platform}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="border-white/10 text-[9px] font-semibold py-0.2">
                          {meeting.type || "Follow-up"}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground truncate">
                          {attendeesList.join(", ")}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-white shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10 shadow-lg">
          <CardHeader className="border-b border-white/5 pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-white">Meeting Prep</CardTitle>
            <Badge variant="outline" className="border-white/10 font-bold text-[9px]">
              Next: {displayUpcoming[0]?.title || "N/A"}
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-secondary/20 border border-white/5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-white truncate">{meetingPrep.company}</p>
                  <Button variant="ghost" size="sm" className="text-[10px] font-bold text-muted-foreground hover:text-white h-7">
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    LinkedIn
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] text-muted-foreground font-semibold">
                  <span>Industry: {meetingPrep.industry}</span>
                  <span>Size: {meetingPrep.size}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Recent News</p>
                <p className="text-xs mt-1 text-white">{meetingPrep.recentNews}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-white mb-2">Key Contacts</p>
                {meetingPrep.keyContacts.map((contact, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0 text-xs font-medium text-muted-foreground">
                    <span>
                      {contact.name} - {contact.role}
                    </span>
                    {contact.linkedin && (
                      <Badge variant="outline" className="text-[9px] font-bold py-0.2">
                        LinkedIn
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs font-bold text-white mb-2">Agenda</p>
                <ul className="space-y-1 text-xs text-muted-foreground font-medium">
                  {meetingPrep.agenda.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-white/10 shadow-lg">
        <CardHeader className="border-b border-white/5 pb-3">
          <CardTitle className="text-sm font-semibold text-white">Past Meetings</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <CRMDataTable
            columns={columns}
            data={displayPast}
            searchable={false}
            pageSize={10}
          />
        </CardContent>
      </Card>
    </div>
  );
}
