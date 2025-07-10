import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Users, 
  ChartLine, 
  Calendar, 
  FileText, 
  Settings, 
  Mail, 
  Linkedin,
  Bot
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: ChartLine },
  { name: "Clients", href: "/clients", icon: Users, badge: "247" },
  { name: "Follow-ups", href: "/follow-ups", icon: Calendar, badge: "12", badgeColor: "bg-amber-100 text-amber-600" },
  { name: "Templates", href: "/templates", icon: FileText },
  { name: "AI Settings", href: "/ai-settings", icon: Bot },
];

const channels = [
  { name: "Email", icon: Mail, status: "online" },
  { name: "LinkedIn", icon: Linkedin, status: "online" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex-shrink-0">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-slate-800">ClientFlow</h1>
        </div>
      </div>
      
      <nav className="px-3 pb-6">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-lg cursor-pointer",
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-50"
                )}>
                  <item.icon className={cn(
                    "mr-3 h-4 w-4",
                    isActive ? "text-brand-500" : "text-slate-400"
                  )} />
                  {item.name}
                  {item.badge && (
                    <span className={cn(
                      "ml-auto text-xs px-2 py-1 rounded-full",
                      item.badgeColor || "bg-slate-100 text-slate-600"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
        
        <div className="mt-8">
          <h3 className="px-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
            Channels
          </h3>
          <div className="mt-2 space-y-1">
            {channels.map((channel) => (
              <div key={channel.name} className="flex items-center px-3 py-2">
                <channel.icon className="mr-3 h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600">{channel.name}</span>
                <div className="ml-auto w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-slate-600">SC</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700">Sarah Chen</p>
            <p className="text-xs text-slate-500">sarah@startup.com</p>
          </div>
          <button className="text-slate-400 hover:text-slate-600">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
