
"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle, Info, AlertTriangle, XCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from "@/actions/notification";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

export function NotificationDropdown() {
    const [count, setCount] = useState(0);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const fetchData = async () => {
        const [unreadCount, list] = await Promise.all([
            getUnreadCount(),
            getNotifications()
        ]);
        setCount(unreadCount);
        setNotifications(list);
    };

    useEffect(() => {
        fetchData();
        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkRead = async (id: string, link?: string) => {
        await markAsRead(id);
        await fetchData(); // Refresh local state
        // If there's a link, let the browser handle navigation normally
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        await fetchData();
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (open) fetchData();
        }}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {count > 0 && (
                        <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-600 border border-white" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end" forceMount>
                <DropdownMenuLabel className="flex justify-between items-center font-normal">
                    <span className="font-semibold">การแจ้งเตือน</span>
                    {count > 0 && (
                        <Button variant="ghost" size="sm" className="h-auto px-2 text-xs text-blue-600" onClick={handleMarkAllRead}>
                            อ่านทั้งหมด
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            ไม่มีการแจ้งเตือนใหม่
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1 p-1">
                            {notifications.map((notification) => {
                                const Icon =
                                    notification.type === 'success' ? CheckCircle :
                                        notification.type === 'warning' ? AlertTriangle :
                                            notification.type === 'error' ? XCircle : Info;

                                const colorClass =
                                    notification.type === 'success' ? 'text-green-600' :
                                        notification.type === 'warning' ? 'text-orange-500' :
                                            notification.type === 'error' ? 'text-red-600' : 'text-blue-500';

                                return (
                                    <Link
                                        key={notification._id}
                                        href={notification.link || '#'}
                                        onClick={() => handleMarkRead(notification._id, notification.link)}
                                        className={`flex items-start gap-3 p-3 rounded-md hover:bg-accent transition-colors ${!notification.isRead ? 'bg-blue-50/50' : ''}`}
                                    >
                                        <Icon className={`w-4 h-4 mt-1 shrink-0 ${colorClass}`} />
                                        <div className="space-y-1">
                                            <p className={`text-sm leading-none ${!notification.isRead ? 'font-semibold' : ''}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: th })}
                                            </p>
                                        </div>
                                        {!notification.isRead && (
                                            <span className="ml-auto w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
