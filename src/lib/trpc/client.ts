import { AppRouter } from '@/server/trpc'
import {createTRPCReact,} from '@trpc/react-query'
import {httpBatchLink, loggerLink} from '@trpc/client'

const getBaseUrl= () => {
    if(typeof window !== 'undefined') return ''
    if(process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
    return `http://localhost:${process.env.PORT ?? 3000}`
}

export const trpc=createTRPCReact<AppRouter>()

export const trpcClient=trpc.createClient({
    links:[
        loggerLink({
            enabled:(opts)=>process.env.NODE_ENV==='development' || (opts.direction==='down' && opts.result instanceof Error),
        }),
        httpBatchLink({
            url:`${getBaseUrl()}/api/trpc`,
            async headers() {
                const token=typeof window !=='undefined' ? localStorage.getItem('token') : null;
                return token ? {Authorization:`Bearer ${token}`} : {}
            }
        })
    ]
})