"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
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
import { cn } from "@/lib/utils";
import {
  IconAward,
  IconLoader2,
  IconSend,
  IconAlertCircle,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconDownload,
  IconBan,
} from "@tabler/icons-react";
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

const getRoleBadgeStyles = (role: string) => {
  switch (role) {
    case "speaker":
      return "border-primary/50 text-primary bg-primary/10";
    case "communicator":
      return "border-chart-2/50 text-chart-2 bg-chart-2/10";
    case "reviewer":
      return "border-chart-3/50 text-chart-3 bg-chart-3/10";
    case "facilitator":
      return "border-chart-4/50 text-chart-4 bg-chart-4/10";
    default:
      return "border-muted-foreground/50 text-muted-foreground bg-muted/10";
  }
};

const getRoleLabel = (role: string): string => {
  switch (role) {
    case "speaker":
      return "Speaker";
    case "communicator":
      return "Communicator";
    case "reviewer":
      return "Reviewer";
    case "facilitator":
      return "Facilitator";
    default:
      return "Participant";
  }
};

export function CertificatesTab({ eventId }: CertificatesTabProps) {
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
        <IconLoader2 className="size-8 animate-spin text-chart-4" />
      </div>
    );
  }

  const statsCards = [
    {
      label: "Eligible",
      value: eligibleData?.recipients.length ?? 0,
      colorClass: "text-chart-2",
      bgClass: "bg-chart-2/10",
    },
    {
      label: "New to Issue",
      value: newRecipientsCount,
      colorClass: "text-chart-4",
      bgClass: "bg-chart-4/10",
    },
    {
      label: "Issued",
      value: activeCertificates.length,
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
    },
    {
      label: "Revoked",
      value: revokedCertificates.length,
      colorClass: "text-destructive",
      bgClass: "bg-destructive/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/50",
          "bg-gradient-to-br from-card via-card to-card/80"
        )}
      >
        {/* Pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Accent strip */}
        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-chart-4 via-chart-4/80 to-primary" />

        {/* Decorative gradient */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-48 rounded-full bg-gradient-to-br from-chart-4/10 via-primary/5 to-transparent blur-3xl" />

        <div className="relative p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex size-12 items-center justify-center rounded-xl",
                "bg-gradient-to-br from-chart-4/10 to-primary/10"
              )}
            >
              <IconAward className="size-6 text-chart-4" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                Certificate Management
              </h3>
              <p className="text-sm text-muted-foreground">
                Generate and manage certificates for event participants
              </p>
            </div>
          </div>

          {/* Event Status */}
          <div className="flex items-center gap-2">
            {eventEnded ? (
              <>
                <IconCircleCheck className="size-5 text-primary" />
                <span className="text-sm text-foreground">
                  Event has ended - Certificates can be generated
                </span>
              </>
            ) : (
              <>
                <IconClock className="size-5 text-chart-4" />
                <span className="text-sm text-muted-foreground">
                  Certificates can only be generated after the event ends
                </span>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {statsCards.map((stat) => (
              <div
                key={stat.label}
                className={cn(
                  "rounded-xl border border-border/30 p-4 text-center",
                  "bg-gradient-to-br from-muted/20 to-muted/5"
                )}
              >
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className={cn("font-display text-2xl font-bold", stat.colorClass)}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Generate Button */}
          {eventEnded && newRecipientsCount > 0 && (
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="w-full gap-2"
            >
              {generateMutation.isPending ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                <IconSend className="size-4" />
              )}
              Generate {newRecipientsCount} Certificate
              {newRecipientsCount > 1 ? "s" : ""}
            </Button>
          )}

          {!eventEnded && (
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg border border-chart-4/30 p-3",
                "bg-chart-4/5"
              )}
            >
              <IconAlertCircle className="size-4 text-chart-4" />
              <p className="text-sm text-chart-4">
                Wait for the event to end before generating certificates
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Eligible Recipients Preview */}
      {eligibleData && eligibleData.recipients.length > 0 && (
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border border-border/50",
            "bg-gradient-to-br from-card via-card to-card/80"
          )}
        >
          {/* Pattern overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: "20px 20px",
            }}
          />

          <div className="relative p-6">
            <div className="mb-6 space-y-1">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Eligible Recipients
              </h3>
              <p className="text-sm text-muted-foreground">
                People who will receive certificates when generated
              </p>
            </div>

            <div className="rounded-lg border border-border/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-medium">Name</TableHead>
                    <TableHead className="font-medium">Email</TableHead>
                    <TableHead className="font-medium">Role</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eligibleData.recipients.map((recipient, index) => (
                    <TableRow
                      key={`${recipient.userId}-${recipient.role}-${index}`}
                      className="hover:bg-muted/20"
                    >
                      <TableCell className="font-medium">
                        {recipient.userName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {recipient.userEmail}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("font-medium", getRoleBadgeStyles(recipient.role))}
                        >
                          {getRoleLabel(recipient.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {recipient.alreadyIssued ? (
                          <Badge
                            variant="outline"
                            className="gap-1 border-primary/50 text-primary bg-primary/10"
                          >
                            <IconCircleCheck className="size-3" />
                            Issued
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="gap-1 border-chart-4/50 text-chart-4 bg-chart-4/10"
                          >
                            <IconClock className="size-3" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* Issued Certificates */}
      {activeCertificates.length > 0 && (
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border border-border/50",
            "bg-gradient-to-br from-card via-card to-card/80"
          )}
        >
          {/* Pattern overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: "20px 20px",
            }}
          />

          {/* Accent strip */}
          <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-chart-2" />

          <div className="relative p-6">
            <div className="mb-6 space-y-1">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Issued Certificates
              </h3>
              <p className="text-sm text-muted-foreground">
                Certificates that have been generated and sent
              </p>
            </div>

            <div className="rounded-lg border border-border/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-medium">Recipient</TableHead>
                    <TableHead className="font-medium">Role</TableHead>
                    <TableHead className="font-medium">Verification Code</TableHead>
                    <TableHead className="font-medium">Issued</TableHead>
                    <TableHead className="font-medium">Downloaded</TableHead>
                    <TableHead className="text-right font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeCertificates.map((cert) => (
                    <TableRow key={cert.id} className="hover:bg-muted/20">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-8 ring-2 ring-primary/10">
                            <AvatarImage src={cert.userImage ?? undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/10 to-chart-2/10 text-xs font-medium">
                              {cert.recipientName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">
                              {cert.recipientName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {cert.recipientEmail}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("font-medium", getRoleBadgeStyles(cert.role))}
                        >
                          {getRoleLabel(cert.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted/50 px-2 py-1 text-xs font-mono text-primary">
                          {cert.verificationCode}
                        </code>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(cert.issuedAt)}
                      </TableCell>
                      <TableCell>
                        {cert.downloadedAt ? (
                          <Badge
                            variant="outline"
                            className="gap-1 border-primary/50 text-primary bg-primary/10"
                          >
                            <IconDownload className="size-3" />
                            Yes
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">No</span>
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
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setRevokingId(cert.id)}
                            >
                              <IconBan className="size-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke Certificate</AlertDialogTitle>
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
                                  <IconLoader2 className="mr-2 size-4 animate-spin" />
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
            </div>
          </div>
        </div>
      )}

      {/* Revoked Certificates */}
      {revokedCertificates.length > 0 && (
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border border-destructive/30",
            "bg-gradient-to-br from-card via-card to-destructive/5"
          )}
        >
          {/* Pattern overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: "20px 20px",
            }}
          />

          <div className="relative p-6">
            <div className="mb-6 flex items-center gap-2">
              <IconCircleX className="size-5 text-destructive" />
              <h3 className="font-display text-lg font-semibold text-foreground">
                Revoked Certificates
              </h3>
            </div>

            <div className="rounded-lg border border-border/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-medium">Recipient</TableHead>
                    <TableHead className="font-medium">Role</TableHead>
                    <TableHead className="font-medium">Revoked On</TableHead>
                    <TableHead className="font-medium">Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revokedCertificates.map((cert) => (
                    <TableRow key={cert.id} className="opacity-60 hover:bg-muted/20">
                      <TableCell className="font-medium">
                        {cert.recipientName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium border-border/50">
                          {getRoleLabel(cert.role)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {cert.revokedAt ? formatDate(cert.revokedAt) : "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {cert.revokeReason || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
