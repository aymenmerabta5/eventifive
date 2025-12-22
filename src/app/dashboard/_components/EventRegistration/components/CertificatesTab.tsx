"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Award,
  Loader2,
  Send,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Ban,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CertificatesTabProps {
  eventId: string;
}

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case "speaker":
      return "default";
    case "committee":
      return "secondary";
    case "reviewer":
      return "outline";
    case "facilitator":
      return "default";
    default:
      return "secondary";
  }
};

const getRoleLabel = (role: string): string => {
  switch (role) {
    case "speaker":
      return "Speaker";
    case "committee":
      return "Committee";
    case "reviewer":
      return "Reviewer";
    case "facilitator":
      return "Facilitator";
    default:
      return "Participant";
  }
};

export function CertificatesTab({ eventId }: CertificatesTabProps) {
  const queryClient = useQueryClient();
  const [revokeReason, setRevokeReason] = useState("");
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Fetch eligible recipients for preview
  const {
    data: eligibleData,
    isLoading: isEligibleLoading,
    refetch: refetchEligible,
  } = useQuery({
    ...orpc.certificates.getEligibleRecipients.queryOptions({
      input: { eventId },
    }),
  });

  // Fetch issued certificates
  const {
    data: certificates,
    isLoading: isCertificatesLoading,
    refetch: refetchCertificates,
  } = useQuery({
    ...orpc.certificates.listByEvent.queryOptions({
      input: { eventId },
    }),
  });

  // Generate certificates mutation
  const generateMutation = useMutation({
    mutationFn: () => orpc.certificates.generate.call({ eventId }),
    onSuccess: (result) => {
      toast.success(result.message);
      refetchEligible();
      refetchCertificates();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate certificates");
    },
  });

  // Revoke certificate mutation
  const revokeMutation = useMutation({
    mutationFn: ({
      certificateId,
      reason,
    }: {
      certificateId: string;
      reason: string;
    }) => orpc.certificates.revoke.call({ certificateId, reason }),
    onSuccess: (result) => {
      toast.success(result.message);
      refetchCertificates();
      setRevokingId(null);
      setRevokeReason("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to revoke certificate");
    },
  });

  const isLoading = isEligibleLoading || isCertificatesLoading;
  const eventEnded = eligibleData?.eventEnded ?? false;
  const newRecipientsCount = eligibleData?.newRecipientsCount ?? 0;
  const issuedCertificates = certificates ?? [];
  const activeCertificates = issuedCertificates.filter((c) => !c.revokedAt);
  const revokedCertificates = issuedCertificates.filter((c) => c.revokedAt);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certificate Management
          </CardTitle>
          <CardDescription>
            Generate and manage certificates for event participants
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Event Status */}
          <div className="flex items-center gap-2">
            {eventEnded ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">
                  Event has ended - Certificates can be generated
                </span>
              </>
            ) : (
              <>
                <Clock className="text-muted-foreground h-5 w-5" />
                <span className="text-muted-foreground text-sm">
                  Certificates can only be generated after the event ends
                </span>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-muted-foreground text-xs">Eligible</p>
              <p className="text-2xl font-bold">
                {eligibleData?.recipients.length ?? 0}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-muted-foreground text-xs">New to Issue</p>
              <p className="text-2xl font-bold">{newRecipientsCount}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-muted-foreground text-xs">Issued</p>
              <p className="text-2xl font-bold">{activeCertificates.length}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-muted-foreground text-xs">Revoked</p>
              <p className="text-2xl font-bold">{revokedCertificates.length}</p>
            </div>
          </div>

          {/* Generate Button */}
          {eventEnded && newRecipientsCount > 0 && (
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="w-full"
            >
              {generateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Generate {newRecipientsCount} Certificate
              {newRecipientsCount > 1 ? "s" : ""}
            </Button>
          )}

          {!eventEnded && (
            <div className="bg-muted/30 flex items-center gap-2 rounded-lg p-3">
              <AlertCircle className="text-muted-foreground h-4 w-4" />
              <p className="text-muted-foreground text-sm">
                Wait for the event to end before generating certificates
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Eligible Recipients Preview */}
      {eligibleData && eligibleData.recipients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Eligible Recipients</CardTitle>
            <CardDescription>
              People who will receive certificates when generated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eligibleData.recipients.map((recipient, index) => (
                  <TableRow key={`${recipient.userId}-${recipient.role}-${index}`}>
                    <TableCell className="font-medium">
                      {recipient.userName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {recipient.userEmail}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(recipient.role)}>
                        {getRoleLabel(recipient.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {recipient.alreadyIssued ? (
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Issued
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Issued Certificates */}
      {activeCertificates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Issued Certificates</CardTitle>
            <CardDescription>
              Certificates that have been generated and sent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Verification Code</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Downloaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeCertificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={cert.userImage ?? undefined} />
                          <AvatarFallback>
                            {cert.recipientName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{cert.recipientName}</p>
                          <p className="text-muted-foreground text-xs">
                            {cert.recipientEmail}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(cert.role)}>
                        {getRoleLabel(cert.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-primary text-xs">
                        {cert.verificationCode}
                      </code>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(cert.issuedAt)}
                    </TableCell>
                    <TableCell>
                      {cert.downloadedAt ? (
                        <Badge variant="outline" className="gap-1">
                          <Download className="h-3 w-3" />
                          Yes
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog
                        open={revokingId === cert.id}
                        onOpenChange={(open: boolean) => {
                          if (!open) {
                            setRevokingId(null);
                            setRevokeReason("");
                          }
                        }}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setRevokingId(cert.id)}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Revoke Certificate
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will invalidate the certificate for{" "}
                              <strong>{cert.recipientName}</strong>. The
                              verification page will show it as revoked.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="space-y-2 py-4">
                            <Label htmlFor="reason">Reason for revocation</Label>
                            <Input
                              id="reason"
                              placeholder="Enter reason..."
                              value={revokeReason}
                              onChange={(e) => setRevokeReason(e.target.value)}
                            />
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              disabled={
                                !revokeReason.trim() || revokeMutation.isPending
                              }
                              onClick={() => {
                                revokeMutation.mutate({
                                  certificateId: cert.id,
                                  reason: revokeReason,
                                });
                              }}
                            >
                              {revokeMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null}
                              Revoke
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Revoked Certificates */}
      {revokedCertificates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <XCircle className="text-destructive h-5 w-5" />
              Revoked Certificates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Revoked On</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revokedCertificates.map((cert) => (
                  <TableRow key={cert.id} className="opacity-60">
                    <TableCell className="font-medium">
                      {cert.recipientName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getRoleLabel(cert.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {cert.revokedAt ? formatDate(cert.revokedAt) : "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {cert.revokeReason || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
