import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
interface DeleteDialogProps {
    onClose : ()  => void
    open : boolean
    onOpen : ()  => void
    kode : string
    id : number 

}
export function DeleteDialogVoucher({onClose,onOpen,open,kode,id}  : DeleteDialogProps){
    const {mutate}  = trpc.voucher.delete.useMutation({
        onSuccess : ()  => {
            toast.success("Delete Voucher Successfully")
        },
        onError : ()  => {
            toast.error("Gagal Delete Voucher")
        }
    })
    return (
        <Dialog open={open}  onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Delete Voucher
                    </DialogTitle>
                    <DialogDescription className ="flex flex-col gap-1">
                        <span>

                        {`Apa Kamu Yakin ingin Menghapus Voucher ?`}
                        </span>
                        <span>

                        Dengan Kode = {`${kode}`}
                        </span>

                    </DialogDescription>
                    <DialogFooter className=" flex items-end gap-2">
                        <Button className="text-white">
                            Clear
                        </Button>
                        <Button className="bg-red-800 text-white hover:bg-red-900" onClick={()=> mutate({id})}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}