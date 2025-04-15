import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


interface UserData {
  requestDetails?: {
    accommodationType: string;
    location: string;
    dateSubmitted: Date;
  };
  applicationStatus: 'accepted' | 'denied' | 'pending';
}

export const ApplicantDetails = ({ userData }: { userData: UserData }) => {
  return (
    <div className='w-fit'>
    <Card>
      <CardHeader>
        <CardTitle>Residence Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {userData.requestDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-sm text-muted-foreground">Accommodation Type</p>
                <p className="text-lg">{userData.requestDetails.accommodationType}</p>
              </div>
              <div>
                <p className="font-medium text-sm text-muted-foreground">Room Number</p>
                <p className="text-lg">106</p>
              </div>
              <div>
                <p className="font-medium text-sm text-muted-foreground">Moved In</p>
                <p className="text-lg">{userData.requestDetails.dateSubmitted.toLocaleDateString()}</p>
              </div>
              <div>
                <p className="font-medium text-sm text-muted-foreground">Status</p>
                <Badge
                    variant={userData.applicationStatus === 'accepted' ? "default" : "secondary"}
                    className={`mt-1 pb-1 ${userData.applicationStatus === 'accepted' ? 'bg-green-950 text-white' : ''}`}
                  >
                    {userData.applicationStatus === 'accepted' ? 'Approved' : userData.applicationStatus === 'denied' ? 'Denied' : 'Pending'}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </div>
  );
};
