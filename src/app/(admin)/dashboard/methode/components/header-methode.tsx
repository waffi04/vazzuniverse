import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DialogMethod } from "./dialog-methode";

export function  HeaderMethode(){
    return  (
        <header className=" items-center flex w-full justify-between">
            <h1 className="flex items-center">Daftar Metode Payment</h1>
            <div className="">

            </div>
            <DialogMethod>
            <Button>
                <Plus />
                <span>Create</span>
            </Button>
            </DialogMethod>
        </header>
    )
}