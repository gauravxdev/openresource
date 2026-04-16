import { db } from "@/server/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function UsagePage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [guestUsage, userUsage, contributorUsage, adminUsage] =
    await Promise.all([
      db.guestUsage.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      db.searchUsage.findMany({
        where: {
          user: { role: "user" },
          date: { gte: today },
        },
        include: { user: { select: { email: true, name: true } } },
        take: 100,
      }),
      db.searchUsage.findMany({
        where: {
          user: { role: "contributor" },
          date: { gte: today },
        },
        include: { user: { select: { email: true, name: true } } },
        take: 100,
      }),
      db.searchUsage.findMany({
        where: {
          user: { role: "admin" },
          date: { gte: today },
        },
        include: { user: { select: { email: true, name: true } } },
        take: 100,
      }),
    ]);

  const renderGuestTable = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>IP Address</TableHead>
            <TableHead>Chat Used</TableHead>
            <TableHead>Chat Limit</TableHead>
            <TableHead>Search Used</TableHead>
            <TableHead>Search Limit</TableHead>
            <TableHead>Expires At</TableHead>
            <TableHead>Last Activity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guestUsage.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No guest usage data.
              </TableCell>
            </TableRow>
          ) : (
            guestUsage.map((guest) => (
              <TableRow key={guest.id}>
                <TableCell className="font-mono text-xs">
                  {guest.ipAddress}
                </TableCell>
                <TableCell>
                  <span
                    className={
                      guest.chatCount >= 10 ? "font-bold text-red-500" : ""
                    }
                  >
                    {guest.chatCount}
                  </span>
                </TableCell>
                <TableCell>10</TableCell>
                <TableCell>
                  <span
                    className={
                      guest.searchCount >= 1 ? "font-bold text-red-500" : ""
                    }
                  >
                    {guest.searchCount}
                  </span>
                </TableCell>
                <TableCell>1</TableCell>
                <TableCell className="text-xs">
                  {guest.expiresAt
                    ? formatDistanceToNow(new Date(guest.expiresAt), {
                        addSuffix: true,
                      })
                    : "-"}
                </TableCell>
                <TableCell className="text-xs">
                  {formatDistanceToNow(new Date(guest.updatedAt), {
                    addSuffix: true,
                  })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  const renderUserTable = (usage: typeof userUsage, role: string) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Chat Used</TableHead>
            <TableHead>Search Used</TableHead>
            <TableHead>Last Activity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usage.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No {role} usage data today.
              </TableCell>
            </TableRow>
          ) : (
            usage.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.user?.name ?? "Unknown"}</TableCell>
                <TableCell className="text-xs">
                  {u.user?.email ?? "N/A"}
                </TableCell>
                <TableCell>{u.chatCount}</TableCell>
                <TableCell>{u.searchCount}</TableCell>
                <TableCell className="text-xs">
                  {formatDistanceToNow(new Date(u.date), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <main className="bg-background w-full flex-1 space-y-6 overflow-auto p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Usage Statistics</h1>
        <p className="text-muted-foreground">
          Track usage for guests and logged-in users.
        </p>
      </div>

      <Tabs defaultValue="guests" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="guests">Guests ({guestUsage.length})</TabsTrigger>
          <TabsTrigger value="users">Users ({userUsage.length})</TabsTrigger>
          <TabsTrigger value="contributors">
            Contributors ({contributorUsage.length})
          </TabsTrigger>
          <TabsTrigger value="admins">Admins ({adminUsage.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="guests" className="mt-4">
          {renderGuestTable()}
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          {renderUserTable(userUsage, "user")}
        </TabsContent>

        <TabsContent value="contributors" className="mt-4">
          {renderUserTable(contributorUsage, "contributor")}
        </TabsContent>

        <TabsContent value="admins" className="mt-4">
          {renderUserTable(adminUsage, "admin")}
        </TabsContent>
      </Tabs>
    </main>
  );
}
