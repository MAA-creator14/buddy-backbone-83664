import { Contact, useContactStore, getContactDueStatus } from "@/store/contactStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Calendar, RefreshCw, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
}

export const ContactCard = ({ contact, onEdit, onDelete }: ContactCardProps) => {
  const navigate = useNavigate();
  const { getInteractionsByContact, interactions: allInteractions } = useContactStore();
  
  const interactions = getInteractionsByContact(contact.id);
  const lastInteraction = interactions[0]; // Already sorted by most recent
  const dueStatus = getContactDueStatus(contact, allInteractions);
  
  const getDueStatusBadge = () => {
    if (dueStatus === 'no-frequency') return null;
    
    const statusConfig = {
      'overdue': { label: 'Overdue', variant: 'destructive' as const },
      'due-soon': { label: 'Due Soon', variant: 'default' as const },
      'on-track': { label: 'On Track', variant: 'secondary' as const },
    };
    
    const config = statusConfig[dueStatus];
    return (
      <Badge variant={config.variant} className="text-xs">
        <Clock className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getSyncStatusIcon = () => {
    if (!contact.linkedInAutoSync || !contact.linkedinProfile) return null;
    
    switch (contact.syncStatus) {
      case 'syncing':
        return <RefreshCw className="h-3 w-3 text-primary animate-spin" />;
      case 'enabled':
        return <CheckCircle2 className="h-3 w-3 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-destructive" />;
      default:
        return <RefreshCw className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getSyncStatusText = () => {
    if (!contact.linkedInAutoSync || !contact.linkedinProfile) return null;
    
    switch (contact.syncStatus) {
      case 'syncing':
        return 'Syncing LinkedIn...';
      case 'enabled':
        return 'LinkedIn auto-sync enabled';
      case 'error':
        return 'Sync error';
      default:
        return 'Auto-sync enabled';
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div 
          className="flex-1 space-y-2 cursor-pointer" 
          onClick={() => navigate(`/contact/${contact.id}`)}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground">{contact.name}</h3>
            <Badge variant="secondary" className="capitalize">
              {contact.relationshipType}
            </Badge>
            {getDueStatusBadge()}
            {contact.linkedInAutoSync && contact.linkedinProfile && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      {getSyncStatusIcon()}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{getSyncStatusText()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {lastInteraction && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDistanceToNow(lastInteraction.timestamp, { addSuffix: true })} • {lastInteraction.type}
              </span>
            </div>
          )}
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>{contact.role} at {contact.company}</p>
            {contact.notes && (
              <p className="text-xs italic">{contact.notes}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(contact);
            }}
            className="h-8 w-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(contact.id);
            }}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
