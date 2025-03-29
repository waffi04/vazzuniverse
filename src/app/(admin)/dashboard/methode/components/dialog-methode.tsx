import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ReactNode, useState } from "react";
import { FormMethode } from "./form-mrthode";
import { PaymentMethod } from "@/types/payment";
import { trpc } from "@/utils/trpc";
import { MethodSchemas } from "@/types/schema/method";
import { toast } from "sonner";

export function DialogMethod({
    children,
    data,
    onSuccess,
    onOptimisticUpdate
}: {
    children: ReactNode;
    data?: PaymentMethod;
    onSuccess?: (method: PaymentMethod) => void;
    onOptimisticUpdate?: (method: MethodSchemas) => void;
}) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    // Get the utils to access the cache
    const utils = trpc.useContext();

    const { mutate: create, isLoading: createLoading } = trpc.methods.create.useMutation({
        // Optimistic update for create
        onMutate: async (newMethod) => {
            // Cancel any outgoing refetches
            await utils.methods.getMethods.cancel();

            // Snapshot the previous value
            const previousResponse = utils.methods.getMethods.getData();

            // Optimistically update to the new value
            utils.methods.getMethods.setData(undefined, (old) => {
                if (!old) return { message: 'Methods fetched', status: 200, data: [newMethod as any] };
                
                return {
                    ...old,
                    data: [...old.data, newMethod]
                };
            });

            // Optional callback for parent component to update local state
            onOptimisticUpdate?.(newMethod);

            // Return a context object with the snapshotted value
            return { previousResponse };
        },
        onSuccess: (response) => {
            toast.success("Payment method created successfully.");
            setIsDialogOpen(false);
        },
        onError: (err, newMethod, context) => {
            // Rollback the optimistic update
            utils.methods.getMethods.setData(undefined, context?.previousResponse);
            
            toast.error("Failed to create payment method");
        },
        onSettled: () => {
            // Refetch the methods to ensure consistency
            utils.methods.getMethods.invalidate();
        }
    });

    const { mutate: update, isLoading: updateLoading } = trpc.methods.update.useMutation({
        // Optimistic update for update
        onMutate: async ({ id, data: updatedMethod }) => {
            // Cancel any outgoing refetches
            await utils.methods.getMethods.cancel();

            // Snapshot the previous value
            const previousResponse = utils.methods.getMethods.getData();

            // Optimistically update to the new value
            utils.methods.getMethods.setData(undefined, (old) => {
                if (!old) return { message: 'Methods fetched', status: 200, data: [] };
                
                return {
                    ...old,
                    data: old.data.map(method => 
                        method.id === id ? { ...method, ...updatedMethod } : method
                    )
                };
            });

            // Optional callback for parent component to update local state
            onOptimisticUpdate?.(updatedMethod);

            // Return a context object with the snapshotted value
            return { previousResponse };
        },
        onSuccess: (response) => {
            toast.success("Payment method updated successfully.");
            setIsDialogOpen(false);
        },
        onError: (err, { id }, context) => {
            // Rollback the optimistic update
            utils.methods.getMethods.setData(undefined, context?.previousResponse);
            
            toast.error("Failed to update payment method");
        },
        onSettled: () => {
            // Refetch the methods to ensure consistency
            utils.methods.getMethods.invalidate();
        }
    });

    const handleSubmit = (values: MethodSchemas) => {
        if (data) {
            update({
                id: data.id!,
                data: values
            });
        } else {
            create(values);
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>
                        {data ? "Edit Payment Method" : "Add New Payment Method"}
                    </DialogTitle>
                    <DialogDescription>
                        {data 
                            ? "Update the details of an existing payment method" 
                            : "Create a new payment method for your application"}
                    </DialogDescription>
                </DialogHeader>
                
                <FormMethode 
                    data={data} 
                    onSubmit={handleSubmit}
                    isLoading={createLoading || updateLoading}
                />
            </DialogContent>
        </Dialog>
    );
}