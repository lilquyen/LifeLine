import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';

interface Personnel {
  id: string;
  name: string;
  role: string;
  status: 'available' | 'on-duty' | 'off-duty' | 'emergency';
  location: string;
  specialization: string[];
  contact: string;
  lastActive: string;
}

interface PersonnelManagementProps {
  personnel: Personnel[];
  onAssign: (personnelId: string, incident: string) => void;
  onUpdateStatus: (personnelId: string, status: string) => void;
}

export function PersonnelManagement({ personnel, onAssign, onUpdateStatus }: PersonnelManagementProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'on-duty': return 'bg-blue-500';
      case 'off-duty': return 'bg-gray-500';
      case 'emergency': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const availablePersonnel = personnel.filter(p => p.status === 'available');
  const onDutyPersonnel = personnel.filter(p => p.status === 'on-duty');

  return (
    <div className="space-y-4">
      {/* Personnel Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Personnel Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl text-green-600">{availablePersonnel.length}</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl text-blue-600">{onDutyPersonnel.length}</div>
              <div className="text-sm text-muted-foreground">On Duty</div>
            </div>
            <div className="text-center">
              <div className="text-2xl text-gray-600">
                {personnel.filter(p => p.status === 'off-duty').length}
              </div>
              <div className="text-sm text-muted-foreground">Off Duty</div>
            </div>
            <div className="text-center">
              <div className="text-2xl text-red-600">
                {personnel.filter(p => p.status === 'emergency').length}
              </div>
              <div className="text-sm text-muted-foreground">Emergency</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Personnel for Dispatch */}
      <Card>
        <CardHeader>
          <CardTitle>Available Personnel for Dispatch</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {availablePersonnel.map(person => (
              <div key={person.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{person.name}</span>
                      <Badge className={getStatusColor(person.status)}>
                        {person.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{person.role}</div>
                    <div className="flex gap-1 mt-1">
                      {person.specialization.map(spec => (
                        <Badge key={spec} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">📍 {person.location}</div>
                  <div className="text-xs text-muted-foreground">📞 {person.contact}</div>
                  <div className="text-xs text-muted-foreground">Last: {person.lastActive}</div>
                  <Button 
                    size="sm" 
                    className="mt-2"
                    onClick={() => onAssign(person.id, 'new-incident')}
                  >
                    Assign
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* On-Duty Personnel */}
      <Card>
        <CardHeader>
          <CardTitle>Currently On Duty</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {onDutyPersonnel.map(person => (
              <div key={person.id} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{person.name}</span>
                      <Badge className={getStatusColor(person.status)}>
                        {person.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{person.role}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">📍 {person.location}</div>
                  <div className="text-xs text-muted-foreground">📞 {person.contact}</div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onUpdateStatus(person.id, 'available')}
                  >
                    Mark Available
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}