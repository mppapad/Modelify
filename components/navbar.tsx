'use client'

import { View } from 'lucide-react';
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Navbar() {
    return (
        <nav className="w-full  px-4 py-2.5 sticky top-0 z-50">

            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo/Brand */}
                <Link href="/" className="flex items-center space-x-1">
                    {/* You can replace this with your actual logo */}
                    <View size={28} color="#000000" strokeWidth={0.75} />
                    <span className="text-xl font-normal text-gray-800"> Modelify</span>
                </Link>
                <div className="flex items-center space-x-4">
                    <Button className="bg-indigo-600 hover:bg-indigo-400">Sign In</Button>
                </div>

            </div>
        </nav>
    )
}