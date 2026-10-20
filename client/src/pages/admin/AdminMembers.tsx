import { useState, useEffect } from "react";
import { Search, Filter, MoreHorizontal, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface Member {
  id: string | number;
  member_id: string;
  name: string;
  role: string;
  status: string;
  joined_date: string;
  email: string;
}

export default function AdminMembers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    try {
      setLoading(true);
      const data = await api.get<Member[]>('/members');
      setMembers(data || []);
    } catch (error: any) {
      console.error('Error fetching members:', error.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.member_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-serif text-primary tracking-tight">Members Directory</h2>
          <p className="text-muted-foreground mt-1">Manage all registered institute members here.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 font-semibold tracking-wide">
          <UserPlus className="h-4 w-4 mr-2" /> Add Member
        </Button>
      </div>

      <Card className="border-border/60 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <CardTitle className="text-lg font-serif">All Members ({members.length})</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, ID or email..."
                className="pl-9 bg-slate-50 border-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="border-border" onClick={fetchMembers}>
              <Filter className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[800px]">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-slate-50/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Member ID</th>
                  <th className="px-6 py-4 font-semibold">Name & Email</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Joined Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-40" />
                      </td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No members found.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="bg-white border-b border-border/50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{member.member_id}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </td>
                      <td className="px-6 py-4">{member.role}</td>
                      <td className="px-6 py-4">
                        <div className={`px-2.5 py-1 w-fit rounded-full text-[10px] uppercase tracking-wider font-bold ${
                          member.status === 'Active' ? 'bg-green-100 text-green-700' :
                          member.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {member.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{member.joined_date}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border/50 flex justify-end text-sm text-muted-foreground">
            {loading ? 'Loading members...' : `Showing ${filteredMembers.length} of ${members.length} members`}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
