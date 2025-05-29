'use client'
import { useState } from "react"
import { trpc,trpcClient } from "./client"
import { QueryClient,QueryClientProvider } from "@tanstack/react-query"


export default function TRPCProvider({children}:{children:React.ReactNode}){
    const [queryClient]=useState(()=> new QueryClient({
        defaultOptions:{
            queries:{
                refetchOnWindowFocus:false,
            }
        }
    }))
    const [clientInstance] = useState(() => trpcClient);

    return (
        <trpc.Provider client={clientInstance} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </trpc.Provider>
    )
}