import { getLoginHistory, getRecentUsers } from "@/actions/admin/db-stats";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function UsersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; tab?: string }>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page ?? "1", 10);
    const activeTab = params.tab ?? "users";

    const [usersResult, historyResult] = await Promise.all([
        getRecentUsers(50),
        getLoginHistory(page, 50)
    ]);

    return (
        <main className="flex-1 overflow-auto p-4 sm:p-6 space-y-6 bg-background w-full">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Platform Users & Logins</h1>
                <p className="text-muted-foreground">
                    Manage platform users and view recent login activity.
                </p>
            </div>

            <Tabs defaultValue={activeTab} className="w-full">
                <TabsList>
                    <TabsTrigger value="users">Recent Users</TabsTrigger>
                    <TabsTrigger value="logins">Login History</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4 pt-4">
                    {!usersResult.success || !usersResult.data ? (
                        <div className="p-4 text-center text-red-500 border rounded-md">
                            Failed to load users: {usersResult.error}
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>User</TableHead>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead>Last Login</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {usersResult.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                No users found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        usersResult.data.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={user.image ?? ""} alt={user.name ?? "User"} />
                                                        <AvatarFallback>{user.name?.charAt(0) ?? "U"}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{user.name}</span>
                                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs text-muted-foreground">
                                                    {user.id}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                                                </TableCell>
                                                <TableCell>
                                                    {user.lastLoginAt ? (
                                                        formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })
                                                    ) : (
                                                        <span className="text-muted-foreground italic">Never</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="logins" className="space-y-4 pt-4">
                    {!historyResult.success || !historyResult.data ? (
                        <div className="p-4 text-center text-red-500 border rounded-md">
                            Failed to load login history: {historyResult.error}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead>Time</TableHead>
                                            <TableHead>User</TableHead>
                                            <TableHead>IP Address</TableHead>
                                            <TableHead>User Agent</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {historyResult.data.history.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center">
                                                    No login history found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            historyResult.data.history.map((record) => (
                                                <TableRow key={record.id}>
                                                    <TableCell className="whitespace-nowrap">
                                                        {formatDistanceToNow(new Date(record.createdAt), { addSuffix: true })}
                                                    </TableCell>
                                                    <TableCell>
                                                        {record.user ? (
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="h-6 w-6">
                                                                    <AvatarImage src={record.user.image ?? ""} alt={record.user.name ?? "User"} />
                                                                    <AvatarFallback>{record.user.name?.charAt(0) ?? "U"}</AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-sm">{record.user.name ?? record.user.email}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="font-mono text-xs">{record.userId}</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-mono text-xs">{record.ipAddress ?? "Unknown"}</span>
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground" title={record.userAgent ?? "Unknown"}>
                                                        {record.userAgent ?? "Unknown"}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="text-sm text-muted-foreground text-right w-full">
                                Showing {historyResult.data.history.length} of {historyResult.data.metadata.total} logins
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </main>
    );
}
