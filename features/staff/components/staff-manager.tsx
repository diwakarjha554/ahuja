"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Check, Copy, KeyRound, UserMinus, UserPlus, X } from "lucide-react"

import type { StaffRow } from "@/features/staff/server/staff.service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardBody } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table"
import { BTN_ICON } from "@/components/shared/button-styles"
import { apiFetch, ApiFetchError } from "@/lib/api-fetch"
import { cn } from "@/lib/utils"

type Paginated = { data: StaffRow[]; pagination: unknown }
type Credential = { email: string; password: string; context: "created" | "reset" }

const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" })
const fmtDay = (iso: string) => dateFmt.format(new Date(iso))

export function StaffManager({
  initialStaff,
  roleNames,
}: {
  initialStaff: StaffRow[]
  roleNames: string[]
}) {
  const router = useRouter()
  const [staff, setStaff] = useState<StaffRow[]>(initialStaff)
  const [form, setForm] = useState({ name: "", email: "", roleName: roleNames[0] ?? "Admin" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [adding, setAdding] = useState(false)
  const [credential, setCredential] = useState<Credential | null>(null)
  const [rowBusy, setRowBusy] = useState<string | null>(null)
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function refresh() {
    try {
      const res = await apiFetch<Paginated>("/api/admin/staff")
      setStaff(res.data)
    } catch {
      // A failed refresh leaves the last known list; the mutation toast already reported.
    }
    router.refresh()
  }

  async function onAdd(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setErrors({})
    try {
      const created = await apiFetch<{ id: string; email: string; tempPassword: string }>(
        "/api/admin/staff",
        { method: "POST", body: JSON.stringify(form) },
      )
      setCredential({ email: created.email, password: created.tempPassword, context: "created" })
      setCopied(false)
      setForm({ name: "", email: "", roleName: roleNames[0] ?? "Admin" })
      toast.success(`${created.email} added.`)
      await refresh()
    } catch (err) {
      if (err instanceof ApiFetchError) {
        setErrors(err.fieldErrors)
        toast.error(err.message)
      } else {
        toast.error("That did not work. Try again.")
      }
    } finally {
      setAdding(false)
    }
  }

  async function onReset(member: StaffRow) {
    setRowBusy(member.id)
    try {
      const res = await apiFetch<{ id: string; tempPassword: string }>(
        `/api/admin/staff/${member.id}/password`,
        { method: "POST" },
      )
      setCredential({ email: member.email, password: res.tempPassword, context: "reset" })
      setCopied(false)
      toast.success(`Password reset for ${member.email}.`)
      await refresh()
    } catch (err) {
      toast.error(err instanceof ApiFetchError ? err.message : "That did not work. Try again.")
    } finally {
      setRowBusy(null)
    }
  }

  async function onRevoke(member: StaffRow) {
    setRowBusy(member.id)
    try {
      await apiFetch(`/api/admin/staff/${member.id}`, { method: "DELETE" })
      toast.success(`Access revoked for ${member.email}.`)
      setConfirmRevoke(null)
      await refresh()
    } catch (err) {
      // Surfaces the "last person who can change settings" 409 guard.
      toast.error(err instanceof ApiFetchError ? err.message : "That did not work. Try again.")
    } finally {
      setRowBusy(null)
    }
  }

  async function copyPassword(password: string) {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      toast.success("Temporary password copied.")
    } catch {
      toast.error("Could not copy. Select the password and copy it by hand.")
    }
  }

  return (
    <div>
      <Card>
        <CardBody>
          <h2 className="font-display text-lg text-ink">Add a staff member</h2>
          <p className="mt-1 text-sm text-ink-muted">
            They receive a one-time temporary password and set their own at first sign in.
          </p>
          <form onSubmit={onAdd} className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="Name" htmlFor="staff-name" error={errors.name}>
              <Input
                id="staff-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                autoComplete="off"
                required
              />
            </Field>
            <Field label="Email" htmlFor="staff-email" error={errors.email}>
              <Input
                id="staff-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                autoComplete="off"
                className="font-mono"
                required
              />
            </Field>
            <Field label="Role" htmlFor="staff-role" error={errors.roleName}>
              <Select
                id="staff-role"
                value={form.roleName}
                onChange={(e) => setForm((f) => ({ ...f, roleName: e.target.value }))}
              >
                {roleNames.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="sm:col-span-3">
              <Button type="submit" disabled={adding}>
                <UserPlus className="h-[18px] w-[18px]" strokeWidth={1.75} />
                {adding ? "Adding..." : "Add staff member"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {credential && (
        <div className="mt-4 rounded-sm border border-info bg-info-tint p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink">
                {credential.context === "created"
                  ? "Staff member added."
                  : "Temporary password reset."}
              </p>
              <p className="mt-1 text-sm text-ink-secondary">
                Share this one-time password with {credential.email}. It replaces their old password
                and they set a new one when they next sign in.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <code className="rounded-sm border border-border bg-card px-3 py-2 font-mono text-base text-ink">
                  {credential.password}
                </code>
                <Button variant="secondary" onClick={() => copyPassword(credential.password)}>
                  {copied ? (
                    <Check className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  ) : (
                    <Copy className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setCredential(null)}
              className={cn(BTN_ICON, "text-ink-muted hover:bg-card")}
            >
              <X className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}

      <h2 className="mt-8 mb-4 font-display text-lg text-ink">Staff</h2>
      <Table>
        <THead>
          <TR>
            <TH>Name</TH>
            <TH>Email</TH>
            <TH>Roles</TH>
            <TH>Status</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {staff.map((member) => (
            <TR key={member.id} className="hover:bg-accent">
              <TD className="text-ink">
                {member.name || <span className="text-ink-muted">Not set</span>}
                <span className="mt-0.5 block text-xs text-ink-muted">
                  Added {fmtDay(member.createdAt)}
                </span>
              </TD>
              <TD className="font-mono">{member.email}</TD>
              <TD>
                <span className="flex flex-wrap gap-1">
                  {member.roles.length > 0 ? (
                    member.roles.map((r) => (
                      <Badge key={r} tone="brand">
                        {r}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-ink-muted">No role</span>
                  )}
                </span>
              </TD>
              <TD>
                {member.mustChangePassword ? (
                  <Badge tone="warning">Temporary password</Badge>
                ) : (
                  <Badge tone="success">Active</Badge>
                )}
              </TD>
              <TD>
                <div className="flex items-center justify-end gap-2">
                  {confirmRevoke === member.id ? (
                    <>
                      <span className="text-sm text-ink-secondary">Revoke access?</span>
                      <Button
                        variant="danger"
                        disabled={rowBusy === member.id}
                        onClick={() => onRevoke(member)}
                      >
                        {rowBusy === member.id ? "Revoking..." : "Confirm"}
                      </Button>
                      <Button variant="ghost" onClick={() => setConfirmRevoke(null)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="secondary"
                        disabled={rowBusy === member.id}
                        onClick={() => onReset(member)}
                      >
                        <KeyRound className="h-[18px] w-[18px]" strokeWidth={1.75} />
                        Reset password
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-danger"
                        disabled={rowBusy === member.id}
                        onClick={() => setConfirmRevoke(member.id)}
                      >
                        <UserMinus className="h-[18px] w-[18px]" strokeWidth={1.75} />
                        Revoke
                      </Button>
                    </>
                  )}
                </div>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  )
}
