import { getFilteredUsers } from "@/actions/admin/users";
import { getLoginHistory } from "@/actions/admin/db-stats";
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
import { UserActionsDropdown } from "./user-actions-dropdown";

export default async function UsersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; tab?: string }>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page ?? "1", 10);
    const activeTab = params.tab ?? "users";

    const [usersResult, contributorsResult, adminsResult, historyResult] = await Promise.all([
        getFilteredUsers("user"),
        getFilteredUsers("contributor"),
        getFilteredUsers("admin"),
        getLoginHistory(page, 50)
    ]);

    const renderUserTable = (result: Awaited<ReturnType<typeof getFilteredUsers>>) => {
        if (!result.success || !result.data) {
            return (
                <div className="p-4 text-center text-red-500 border rounded-md">
                    Failed to load users: {result.error}
                </div>
            );
        }

        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>User</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {result.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No users found in this category.
                                </TableCell>
                            </TableRow>
                        ) : (
                            result.data.map((user) => (
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
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                            user.status === 'ACTIVE' ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-400' :
                                            user.status === 'RESTRICTED' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                            'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-900/20 dark:text-red-400'
                                        }`}>
                                            {user.status}
                                        </span>
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
                                    <TableCell className="text-right">
                                        <UserActionsDropdown 
                                            userId={user.id} 
                                            currentRole={user.role as any} 
                                            currentStatus={user.status as any} 
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        );
    };

    return (
        <main className="flex-1 overflow-auto p-4 sm:p-6 space-y-6 bg-background w-full">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Platform Users & Logins</h1>
                <p className="text-muted-foreground">
                    Manage platform users, contributors, and view recent login activity.
                </p>
            </div>

            <Tabs defaultValue={activeTab} className="w-full">
                <TabsList>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="contributors">Contributors</TabsTrigger>
                    <TabsTrigger value="admins">Admins</TabsTrigger>
                    <TabsTrigger value="logins">Login History</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4 pt-4">
                    {renderUserTable(usersResult)}
                </TabsContent>

                <TabsContent value="contributors" className="space-y-4 pt-4">
                    {renderUserTable(contributorsResult)}
                </TabsContent>

                <TabsContent value="admins" className="space-y-4 pt-4">
                    {renderUserTable(adminsResult)}
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
                                                                <span className="text-sm">{record.user.name || record.user.email}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="font-mono text-xs">{record.userId}</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-mono text-xs">{record.ipAddress || "Unknown"}</span>
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground" title={record.userAgent || "Unknown"}>
                                                        {record.userAgent || "Unknown"}
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
