import { ChevronDown, Database, LogOut, Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "./ui/button"

function AccountInfo() {
    const router = useRouter();

    const { data: session, isPending } = authClient.useSession();

    const handleLogout = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/");
                    router.refresh();
                },
            },
        });
    };

    if (!session) {
        return (
            <div className="absolute top-4 right-4 hidden xl:flex h-[54px] items-center gap-3 rounded-sm border bg-card px-3 shadow-2xl">
                <Link href="/login">
                    <Button variant="secondary" size="sm">Anmelden</Button>
                </Link>
                <Link href="/signup">
                    <Button size="sm">Registrieren</Button>
                </Link>
            </div>
        )
    }

    const nameParts = session?.user?.name?.trim().split(" ");
    let initials = "BE";
    if (nameParts && nameParts.length > 0) {
        if (nameParts.length === 1) {
            initials = nameParts[0].substring(0, 2).toUpperCase();
        } else {
            initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
        }
    } else if (session?.user?.email) {
        initials = session.user.email.substring(0, 2).toUpperCase();
    }

    return (
        <div className="absolute top-4 right-4 hidden xl:block">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="bg-card flex h-[54px] max-w-96 min-w-56 cursor-pointer items-center justify-between gap-4 rounded-sm border p-2 px-3 shadow-2xl outline-none">
                <div className="flex items-center gap-3">
                    <Avatar className="h-7 w-7">
                        <AvatarImage src="" alt="User" />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                    <span className="text-sm leading-tight font-medium">
                        {session?.user.name}
                    </span>
                    <span className="text-muted-foreground text-[11px] leading-tight">
                        {session?.user.email}
                    </span>
                    </div>
                </div>
                <ChevronDown className="text-muted-foreground h-4 w-4" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                    <Link href="/projects" className="flex w-full items-center gap-2">
                        <Database className="mr-2 h-4 w-4" />
                        <span>Projekte</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                    Einstellungen
                    </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Abmelden
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

export default AccountInfo