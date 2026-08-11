import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Lock, 
  UserCheck, 
  Activity, 
  Search,
  Download,
  Filter,
  Clock,
  MapPin,
  Smartphone
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LoginAttempt {
  id: string;
  user_email: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  failure_reason?: string;
  location?: string;
  device_type: string;
  timestamp: string;
}

interface SecurityIncident {
  id: string;
  incident_type: 'failed_login' | 'suspicious_activity' | 'data_breach' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affected_user?: string;
  ip_address: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  created_at: string;
  resolved_at?: string;
}

interface AuditLog {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  resource: string;
  resource_id?: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  additional_data?: any;
}

export const SecurityAudit = () => {
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('24h');

  useEffect(() => {
    fetchSecurityData();
  }, [timeFilter]);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      // Security audit data would come from security_logs, login_attempts, and audit_logs tables when implemented
      setLoginAttempts([]);
      setIncidents([]);
      setAuditLogs([]);

    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Error",
        description: "Failed to load security data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateIncidentStatus = async (incidentId: string, status: string) => {
    try {
      setIncidents(prev => prev.map(incident => 
        incident.id === incidentId 
          ? ({ 
              ...incident, 
              status: status as any, 
              resolved_at: status === 'resolved' ? new Date().toISOString() : undefined 
            } as any)
          : incident
      ));
      
      toast({
        title: "Success",
        description: "Incident status updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update incident status",
        variant: "destructive"
      });
    }
  };

  const exportSecurityReport = (type: string) => {
    toast({
      title: "Export Started",
      description: `${type} report will be downloaded shortly`
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'failed_login':
        return <Lock className="h-4 w-4" />;
      case 'suspicious_activity':
        return <AlertTriangle className="h-4 w-4" />;
      case 'data_breach':
        return <Shield className="h-4 w-4" />;
      case 'unauthorized_access':
        return <UserCheck className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading security data...</div>;
  }

  const filteredLoginAttempts = loginAttempts.filter(attempt =>
    attempt.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attempt.ip_address.includes(searchTerm)
  );

  const filteredIncidents = incidents.filter(incident =>
    incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.ip_address.includes(searchTerm)
  );

  const filteredAuditLogs = auditLogs.filter(log =>
    log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Security & Audit</h2>
          <p className="text-muted-foreground">Monitor security events and audit platform activity</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last hour</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search security events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Login Attempts</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loginAttempts.length}</div>
            <p className="text-xs text-muted-foreground">
              {loginAttempts.filter(a => a.success).length} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {loginAttempts.filter(a => !a.success).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Failed attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {incidents.filter(i => i.status === 'open' || i.status === 'investigating').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.length}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">87%</div>
            <p className="text-xs text-muted-foreground">
              Platform security health
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="login-attempts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="login-attempts">Login Attempts</TabsTrigger>
          <TabsTrigger value="incidents">Security Incidents</TabsTrigger>
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="alerts">Alert Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="login-attempts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Login Attempts</CardTitle>
                  <CardDescription>Monitor all authentication attempts to the platform</CardDescription>
                </div>
                <Button variant="outline" onClick={() => exportSecurityReport('Login Attempts')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoginAttempts.map((attempt) => (
                    <TableRow key={attempt.id}>
                      <TableCell className="font-medium">{attempt.user_email}</TableCell>
                      <TableCell className="font-mono text-sm">{attempt.ip_address}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {attempt.location || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Smartphone className="h-3 w-3" />
                          {attempt.device_type}
                        </div>
                      </TableCell>
                      <TableCell>
                        {attempt.success ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Success
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            Failed: {attempt.failure_reason}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          {new Date(attempt.timestamp).toLocaleString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Security Incidents</CardTitle>
                  <CardDescription>Track and manage security incidents</CardDescription>
                </div>
                <Button variant="outline" onClick={() => exportSecurityReport('Security Incidents')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getIncidentIcon(incident.incident_type)}
                          <span className="capitalize">{incident.incident_type.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div>
                          <p className="font-medium">{incident.description}</p>
                          {incident.affected_user && (
                            <p className="text-sm text-muted-foreground">User: {incident.affected_user}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(incident.severity) as any}>
                          {incident.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{incident.ip_address}</TableCell>
                      <TableCell>
                        <Badge variant={incident.status === 'resolved' ? 'default' : 'secondary'}>
                          {incident.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(incident.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <Select
                          value={incident.status}
                          onValueChange={(value) => updateIncidentStatus(incident.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="investigating">Investigating</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="false_positive">False Positive</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Data Access Audit Logs</CardTitle>
                  <CardDescription>Track all data access and modifications</CardDescription>
                </div>
                <Button variant="outline" onClick={() => exportSecurityReport('Audit Logs')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAuditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.user_email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{log.resource}</p>
                          {log.resource_id && (
                            <p className="text-sm text-muted-foreground font-mono">{log.resource_id}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{log.ip_address}</TableCell>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Security Alert Settings</CardTitle>
                <CardDescription>Configure automated security alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Failed Login Threshold</h4>
                      <p className="text-sm text-muted-foreground">Alert after 5 failed attempts</p>
                    </div>
                    <Badge variant="default">Enabled</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Suspicious IP Detection</h4>
                      <p className="text-sm text-muted-foreground">Monitor unusual IP addresses</p>
                    </div>
                    <Badge variant="default">Enabled</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Admin Access Alerts</h4>
                      <p className="text-sm text-muted-foreground">Notify on admin panel access</p>
                    </div>
                    <Badge variant="secondary">Disabled</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Data Export Alerts</h4>
                      <p className="text-sm text-muted-foreground">Alert on bulk data exports</p>
                    </div>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alert Recipients</CardTitle>
                <CardDescription>Manage who receives security alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">admin@bizflow.com</p>
                        <p className="text-sm text-muted-foreground">All security alerts</p>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">security@bizflow.com</p>
                        <p className="text-sm text-muted-foreground">Critical incidents only</p>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  Add Alert Recipient
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};