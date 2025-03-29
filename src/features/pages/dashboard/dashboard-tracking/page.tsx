"use client"
import { useState } from "react";
import { HeaderTracking } from "./_components/header";

export default function TrackingPage(){
    const [term,setTerm]  =  useState('')
    return (
        <main className="p-7 flex flex-col gap-10">
            <HeaderTracking onChange={setTerm}/>
        </main>
    )
}