import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid,ClipboardList,ListTodo,HistoryIcon,Archive,CheckCircle2 ,User2, DollarSign } from 'lucide-react';
import AppLogo from './app-logo';


export function AppSidebar() {
const { auth } = usePage().props;
const userRole = auth?.user?.role || 'user';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Personnel',
        href: '/personnel',
        icon: ClipboardList,
    },
    {
        title: 'Avancement',
        href: '/avancement',
        icon: ListTodo,
    },
     {
    title: 'Historique',
    href: '/historique',
    icon: Archive,
    id: 'nav-historique',
},
    {
        title: 'Decision',
        href: '/decision',
        icon: CheckCircle2,
    },

];
const adminNavItems: NavItem[] = [
    {
        title: 'Users',
        href: '/admin/users',
        icon: User2,
    },
    {
        title: 'Salaire',
        href: '/admin/salaire',
        icon: DollarSign,
    }
];


let roleBasedNavItems=[...mainNavItems];
if (userRole === 'admin') {
    roleBasedNavItems = [...roleBasedNavItems, ...adminNavItems];
}
const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];


    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={roleBasedNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
