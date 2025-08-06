import React from 'react'
import Link from 'next/link';
import { FiSearch, FiShoppingCart, FiUser, FiHeart } from "react-icons/fi"; // example added icon

const Navbar = () => {
    return (
        <div className='px-10 grid grid-cols-3 items-center shadow-md h-[10vh] w-screen'>
            {/* Left */}
            <div>
                <Link href="/" className='text-2xl cursor-pointer'>Pasal</Link>
            </div>

            {/* Middle */}
            <div className='flex justify-center'>
                <ul className='flex justify-between gap-10'>
                    <li className='cursor-pointer hover:scale-105 duration-200'><Link href="/">Home</Link></li>
                    <li className='cursor-pointer hover:scale-105 duration-200'><Link href="#jerseys">Jerseys</Link></li>
                    <li className='cursor-pointer hover:scale-105 duration-200'><Link href="#teams">Teams</Link></li>
                </ul>
            </div>

            {/* Right */}
            <div className='flex justify-end items-center gap-6'>
                <Link href="/search"><FiSearch size={20} className='cursor-pointer' /></Link>
                <Link href="/cart"><FiShoppingCart size={20} className='cursor-pointer' /></Link>
                <Link href="/favorites"><FiHeart size={20} className='cursor-pointer' /></Link>
                <Link href="/profile"><FiUser size={20} className='cursor-pointer' /></Link>
            </div>
        </div>
    )
}

export default Navbar
