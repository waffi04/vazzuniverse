import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"; 
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"; 
import { Button } from "@/components/ui/button";
import { Member } from "@/types/schema/user"; 
import { ReactNode, useState } from "react"; 
import { FormMember } from "./form-editmember";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ButtonEditMemberProps {
  children: ReactNode;
  user: Member;
}

export default function DropdownMember({ children, user }: ButtonEditMemberProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [action, setAction] = useState<'edit' | 'delete' | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { mutate: deleteMember } = trpc.member.deleteUser.useMutation({
    onSuccess: () => {
      toast.success('The member has been successfully removed.')
      setIsDeleting(false);
      setIsDialogOpen(false);
    },
    onError: (error) => {
        toast.error('Failed To Delete Member')
      setIsDeleting(false);
    }
  });
  
  const handleEdit = () => {
    setAction('edit');
    setIsDialogOpen(true);
  };
  
  const handleDelete = () => {
    setAction('delete');
    setIsDialogOpen(true);
  };
  
  const confirmDelete = () => {
    setIsDeleting(true);
    deleteMember({ userId : user.id });
  };
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {action === 'edit' ? (
            <>
              <DialogHeader>
                <DialogTitle>Edit Member</DialogTitle>
                <DialogDescription>
                  Update the member information for {user.name}.
                </DialogDescription>
              </DialogHeader>
              <FormMember 
                balance={user.balance} 
                id={user.id} 
                name={user.name} 
                role={user.role}
              />
            </>
          ) : action === 'delete' ? (
            <>
              <DialogHeader>
                <DialogTitle>Delete Member</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete {user.name}? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex justify-end gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}