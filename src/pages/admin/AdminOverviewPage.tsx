import {
  Users,
  CheckSquare,
  DollarSign,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminOverviewPage() {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-5 w-5 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,245</div>
            <p className="text-xs text-slate-500">+20% from last month</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <CheckSquare className="h-5 w-5 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-slate-500">Clients waiting approval</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Commission Paid</CardTitle>
            <DollarSign className="h-5 w-5 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£12,450</div>
            <p className="text-xs text-slate-500">in the last 30 days</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Manual Reconciliations</CardTitle>
            <FileText className="h-5 w-5 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-slate-500">transactions pending</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
