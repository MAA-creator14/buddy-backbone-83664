import { Contact } from "@/hooks/useContacts";
import { Interaction } from "@/hooks/useInteractions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  lastInteraction?: Interaction;
  dueStatus?: 'overdue' | 'due-soon' | 'on-track' | 'no-frequency';
}

export const ContactCard = ({ contact, onEdit, onDelete, lastInteraction, dueStatus }: ContactCardProps) => {
  const navigate = useNavigate();
  
  const getDueStatusBadge = () => {
    if (!dueStatus || dueStatus === 'no-frequency') return null;
    
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
              {contact.relationship_type}
            </Badge>
            {getDueStatusBadge()}
          </div>
          {lastInteraction && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDistanceToNow(new Date(lastInteraction.date), { addSuffix: true })} • {lastInteraction.type}
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
