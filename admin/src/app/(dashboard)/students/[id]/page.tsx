"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, Calendar, User, BookOpen, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { formatDate, getInitials } from "@/lib/utils";

interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  dateOfBirth?: string;
  address?: string;
  course?: { id: string; title: string };
  campus?: { name: string };
  enrolledAt?: string;
  avatarUrl?: string;
  admission?: { applicationNo: string; stage: string };
}

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: student, isLoading } = useQuery({
    queryKey: ["student", id],
    queryFn: () => apiFetch<Student>(`/students/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="lg:col-span-2 h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/students")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            {student.avatarUrl && <AvatarImage src={student.avatarUrl} />}
            <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{student.name}</h1>
            <p className="text-sm text-muted-foreground">{student.studentId}</p>
          </div>
          <StatusBadge status={student.status} domain="student" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {student.email}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Phone</p>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    {student.phone}
                  </div>
                </div>
                {student.dateOfBirth && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Date of Birth</p>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {formatDate(student.dateOfBirth)}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Enrolled</p>
                  <p className="text-sm font-medium">{formatDate(student.enrolledAt)}</p>
                </div>
                {student.address && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Address</p>
                    <p className="text-sm font-medium">{student.address}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Course</p>
                  <p className="text-sm font-medium">{student.course?.title ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Campus</p>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    {student.campus?.name ?? "—"}
                  </div>
                </div>
                {student.admission && (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Application No</p>
                      <p className="text-sm font-medium">{student.admission.applicationNo}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Admission Stage</p>
                      <StatusBadge status={student.admission.stage} domain="admission" />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Student ID", value: student.studentId },
                { label: "Status", value: <StatusBadge status={student.status} domain="student" /> },
                { label: "Enrolled", value: formatDate(student.enrolledAt) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <div className="mt-0.5 text-sm font-medium">{value}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
