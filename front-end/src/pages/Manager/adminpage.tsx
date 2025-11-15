import React from  'react';
import { Database, Activity, Clock, UserPlus, Edit, Trash2, Search, Download, TrendingUp, HardDrive, Eye, Ban, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 
import { Area, AreaChart, Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';


const RC = ResponsiveContainer as unknown as React.FC<any>;
const AreaChartC = AreaChart as unknown as React.FC<any>;
const XAxisC = XAxis as unknown as React.FC<any>;
const YAxisC = YAxis as unknown as React.FC<any>;
const LegendC = Legend as unknown as React.FC<any>;
const AreaC = Area as unknown as React.FC<any>;
const PieChartC = PieChart as unknown as React.FC<any>;
const PieC = Pie as unknown as React.FC<any>;
const CellC = Cell as unknown as React.FC<any>;
const BarChartC = BarChart as unknown as React.FC<any>;
const BarC = Bar as unknown as React.FC<any>;
const LineChartC = LineChart as unknown as React.FC<any>;
const LineC = Line as unknown as React.FC<any>;
const CartesianGridC = CartesianGrid as unknown as React.FC<any>;

const AdminPage: React.FC = () => {
  const [searchUser, setSearchUser] = React.useState('');
  const [isAddUserOpen, setIsAddUserOpen] = React.useState(false);
  
  const [activeTab, setActiveTab] = React.useState('overview');

  // Mock data for admin dashboard
  const systemStats = {
    storage: { used: 247, total: 500, unit: 'GB' },
    dailyVisitors: 1847,
    avgUsageTime: '24.5 min',
    activeUsers: 342
  };

  const visitorData = [
    { date: 'Mon', visitors: 1200, activeUsers: 320 },
    { date: 'Tue', visitors: 1500, activeUsers: 380 },
    { date: 'Wed', visitors: 1800, activeUsers: 420 },
    { date: 'Thu', visitors: 1600, activeUsers: 350 },
    { date: 'Fri', visitors: 2100, activeUsers: 480 },
    { date: 'Sat', visitors: 1400, activeUsers: 290 },
    { date: 'Sun', visitors: 1847, activeUsers: 342 }
  ];

  const storageByCategory = [
    { name: 'Documents', value: 125, color: '#3b82f6' },
    { name: 'Images', value: 82, color: '#10b981' },
    { name: 'Videos', value: 35, color: '#f59e0b' },
    { name: 'Other', value: 5, color: '#6b7280' }
  ];

  const aiUsageData = [
    { month: 'Jan', calls: 12500 },
    { month: 'Feb', calls: 15200 },
    { month: 'Mar', calls: 18900 },
    { month: 'Apr', calls: 22100 },
    { month: 'May', calls: 25800 },
    { month: 'Jun', calls: 28400 }
  ];

  const userGrowthData = [
    { month: 'Jan', free: 450, pro: 120, team: 35 },
    { month: 'Feb', free: 520, pro: 145, team: 42 },
    { month: 'Mar', free: 610, pro: 178, team: 48 },
    { month: 'Apr', free: 720, pro: 205, team: 55 },
    { month: 'May', free: 850, pro: 242, team: 63 },
    { month: 'Jun', free: 980, pro: 285, team: 72 }
  ];

  const systemLogs = [
    { id: 1, time: '2024-01-20 14:23:45', type: 'INFO', message: 'User login successful', user: 'admin@smartnotes.com' },
    { id: 2, time: '2024-01-20 14:22:10', type: 'WARNING', message: 'High memory usage detected', user: 'system' },
    { id: 3, time: '2024-01-20 14:20:33', type: 'ERROR', message: 'Failed to sync notes', user: 'user@example.com' },
    { id: 4, time: '2024-01-20 14:18:22', type: 'INFO', message: 'Backup completed successfully', user: 'system' },
    { id: 5, time: '2024-01-20 14:15:01', type: 'INFO', message: 'New user registered', user: 'newuser@example.com' }
  ];

  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Pro', aiUsage: 1250, storage: '12.5 GB', status: 'active', joinDate: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Team', aiUsage: 3400, storage: '28.3 GB', status: 'active', joinDate: '2024-01-10' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'Free', aiUsage: 45, storage: '2.1 GB', status: 'active', joinDate: '2024-01-18' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Pro', aiUsage: 890, storage: '8.7 GB', status: 'suspended', joinDate: '2024-01-12' },
    { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', role: 'Team', aiUsage: 2100, storage: '15.2 GB', status: 'active', joinDate: '2024-01-08' }
  ];

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    user.email.toLowerCase().includes(searchUser.toLowerCase())
  );


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Manage your Aeternus platform</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="logs">System Logs</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
                  <HardDrive className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.storage.used} / {systemStats.storage.total} {systemStats.storage.unit}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {((systemStats.storage.used / systemStats.storage.total) * 100).toFixed(1)}% used
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daily Visitors</CardTitle>
                  <Activity className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.dailyVisitors.toLocaleString()}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +12.5% from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Usage Time</CardTitle>
                  <Clock className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.avgUsageTime}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Per session average
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Database className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.activeUsers}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Currently online
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Visitor Trends</CardTitle>
                  <CardDescription>Daily visitors and active users</CardDescription>
                </CardHeader>
                <CardContent>
                  <RC width="100%" height={300}>
                    <AreaChartC data={visitorData}>
                      <CartesianGridC strokeDasharray="3 3" />
                      <XAxisC dataKey="date" />
                      <YAxisC />
                      <LegendC />
                      <AreaC type="monotone" dataKey="visitors" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      <AreaC type="monotone" dataKey="activeUsers" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    </AreaChartC>
                  </RC>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Storage by Category</CardTitle>
                  <CardDescription>Storage distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <RC width="100%" height={300}>
                    <PieChartC>
                      <PieC
                        data={storageByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                      label={({ name, percent }: { name: string; percent?: number }) => `${name} ${((percent || 0)* 100).toFixed(0)}%`}

                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {storageByCategory.map((entry, index) => (
                          <CellC key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </PieC>
                      <LegendC />
                    </PieChartC>
                  </RC>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Usage</CardTitle>
                  <CardDescription>Monthly API calls</CardDescription>
                </CardHeader>
                <CardContent>
                  <RC width="100%" height={300}>
                    <BarChartC data={aiUsageData}>
                      <CartesianGridC strokeDasharray="3 3" />
                      <XAxisC dataKey="month" />
                      <YAxisC />
                      <LegendC />
                      <BarC dataKey="calls" fill="#3b82f6" />
                    </BarChartC>
                  </RC>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>Users by plan type</CardDescription>
                </CardHeader>
                <CardContent>
                  <RC width="100%" height={300}>
                    <LineChartC data={userGrowthData}>
                      <CartesianGridC strokeDasharray="3 3" />
                      <XAxisC dataKey="month" />
                      <YAxisC />
                      <LegendC />
                      <LineC type="monotone" dataKey="free" stroke="#6b7280" strokeWidth={2} />
                      <LineC type="monotone" dataKey="pro" stroke="#3b82f6" strokeWidth={2} />
                      <LineC type="monotone" dataKey="team" stroke="#10b981" strokeWidth={2} />
                    </LineChartC>
                  </RC>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage all platform users</CardDescription>
                  </div>
                  <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>Create a new user account</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input type="email" placeholder="john@example.com" />
                        </div>
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="pro">Pro</SelectItem>
                              <SelectItem value="team">Team</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button className="w-full">Create User</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>AI Usage</TableHead>
                      <TableHead>Storage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'Team' ? 'default' : user.role === 'Pro' ? 'secondary' : 'outline'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.aiUsage.toLocaleString()}</TableCell>
                        <TableCell>{user.storage}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              {user.status === 'active' ? (
                                <Ban className="h-4 w-4 text-red-500" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Usage Trends</CardTitle>
                  <CardDescription>Monthly API call statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <RC width="100%" height={300}>
                      <AreaChartC data={aiUsageData}>
                        <CartesianGridC strokeDasharray="3 3" />
                        <XAxisC dataKey="month" />
                        <YAxisC />
                        <LegendC />
                        <AreaC type="monotone" dataKey="calls" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      </AreaChartC>
                  </RC>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Growth by Plan</CardTitle>
                  <CardDescription>Subscription trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <RC width="100%" height={300}>
                    <LineChartC data={userGrowthData}>
                      <CartesianGridC strokeDasharray="3 3" />
                      <XAxisC dataKey="month" />
                      <YAxisC />
                      <LegendC />
                      <LineC type="monotone" dataKey="free" stroke="#6b7280" strokeWidth={2} />
                      <LineC type="monotone" dataKey="pro" stroke="#3b82f6" strokeWidth={2} />
                      <LineC type="monotone" dataKey="team" stroke="#10b981" strokeWidth={2} />
                    </LineChartC>
                  </RC>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>Recent system events and activities</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>User</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systemLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">{log.time}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              log.type === 'ERROR' ? 'destructive' :
                              log.type === 'WARNING' ? 'secondary' : 'default'
                            }
                          >
                            {log.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.message}</TableCell>
                        <TableCell>{log.user}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
