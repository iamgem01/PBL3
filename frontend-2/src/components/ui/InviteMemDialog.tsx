"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"

export default function InviteMemberDialog({
                                               open,
                                               onOpenChange,
                                           }: {
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const [emails, setEmails] = useState("")
    const [role, setRole] = useState("workspace_owner")
    const [message, setMessage] = useState("")

    const handleSend = () => {
        // Bạn có thể gọi API ở đây
        console.log("Inviting:", emails, "as", role, "with message:", message)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-6">
                <DialogHeader>
                    <DialogTitle className="text-center text-lg font-semibold">
                        Add members
                    </DialogTitle>
                    <p className="text-center text-sm text-muted-foreground">
                        Type or paste emails below, separated by commas
                    </p>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <div>
                        <Label htmlFor="emails">Emails</Label>
                        <Input
                            id="emails"
                            placeholder="Search names or emails"
                            value={emails}
                            onChange={(e) => setEmails(e.target.value)}
                        />
                    </div>

                    <div>
                        <Label>Select role</Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger className="w-full mt-1">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="workspace_owner">Workspace Owner</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                            Different roles have different permissions in the workspace.
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="message">Message (optional)</Label>
                        <Textarea
                            id="message"
                            placeholder="Add a note to your invite..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter className="flex gap-2 mt-6">
                    <Button className="w-full" onClick={handleSend}>
                        Send invite
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
