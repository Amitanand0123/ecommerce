'use client'

import { useState } from "react"
import { trpc,trpcClient } from "./client"
import { httpBatchLink, loggerLink } from "@trpc/client"
import { QueryClient,QueryClientProvider } from "@tanstack/react-query"


const getBaseUrl=()=>{
    if(typeof window !== 'undefined') return ''
    if(process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
    return `http://localhost:${process.env.PORT ?? 3000}`
}

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