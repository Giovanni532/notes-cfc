import * as React from "react"
import { BookOpen, LogOut, Download, Database } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
} from "@/components/ui/sidebar"
import { paths } from "@/paths"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "../ui/button"
import { toast } from "sonner"

// This is sample data.
const data = {
    navMain: [
        {
            title: "Accueil",
            url: paths.home,
        },
        {
            title: "Modules",
            url: paths.modules,
        },
        {
            title: "Competences",
            url: paths.competences,
        },
    ],
}

export function SidebarLayout({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const router = useRouter()

    const handleLogout = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push(paths.login)
                }
            }
        })
    }

    const handleExportExcel = async () => {
        try {
            const response = await fetch('/api/export/excel');
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `notes-cfc-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success("Export Excel téléchargé avec succès");
            } else {
                toast.error("Erreur lors de l'export Excel");
            }
        } catch (error) {
            console.error('Erreur export Excel:', error);
            toast.error("Erreur lors de l'export Excel");
        }
    }

    const handleExportJSON = async () => {
        try {
            const response = await fetch('/api/export/json');
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `seed-data-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success("Export JSON téléchargé avec succès");
            } else {
                toast.error("Erreur lors de l'export JSON");
            }
        } catch (error) {
            console.error('Erreur export JSON:', error);
            toast.error("Erreur lors de l'export JSON");
        }
    }

    return (
        <Sidebar variant="floating" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={paths.home}>
                                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <BookOpen className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-medium">Notes CFC</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu className="gap-2">
                        {data.navMain.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild>
                                    <Link href={item.url} className="font-medium">
                                        {item.title}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu className="gap-2">
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Button variant="outline" onClick={handleExportExcel} className="w-full justify-start">
                                <Download className="size-4 mr-2" />
                                <span>Export Excel</span>
                            </Button>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Button variant="outline" onClick={handleExportJSON} className="w-full justify-start">
                                <Database className="size-4 mr-2" />
                                <span>Export JSON</span>
                            </Button>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild onClick={handleLogout}>
                            <Button variant="outline" className="w-full justify-start">
                                <LogOut className="size-4 mr-2" />
                                <span>Déconnexion</span>
                            </Button>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
