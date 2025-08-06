"use client";

import Link from 'next/link';
import { FiHeart, FiShoppingCart, FiUser, FiMenu } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";
import { useEffect, useRef, useState } from 'react';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleMenu = () => {
        setIsMenuOpen(prev => !prev);
    };

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]);

    return (
        <div className='relative'>
            <div className='px-4 md:px-10 flex items-center justify-between shadow-md h-[10vh] w-full'>
                {/* Left */}
                <div>
                    <Link href="/" className='text-2xl cursor-pointer'>Pasal</Link>
                </div>

                {/* Middle - Hidden on mobile */}
                <div className='hidden md:flex justify-center'>
                    <ul className='flex justify-between gap-10'>
                        <li className='cursor-pointer hover:scale-105 duration-200'><Link href="/">Home</Link></li>
                        <li className='cursor-pointer hover:scale-105 duration-200'><a href="#jerseys">Jerseys</a></li>
                        <li className='cursor-pointer hover:scale-105 duration-200'><a href="#teams">Teams</a></li>
                    </ul>
                </div>

                {/* Right - Hidden on mobile */}
                <div className='hidden md:flex justify-end items-center gap-6'>
                    <input
                        type="text"
                        placeholder="Search"
                        className='rounded-lg border border-gray-300 px-3 py-1 text-sm h-10'
                    />
                    <Link href="/cart" aria-label='Cart'><FiShoppingCart size={20} className='cursor-pointer' /></Link>
                    <Link href="/favorites" aria-label='Favorites'><FiHeart size={20} className='cursor-pointer' /></Link>
                    <Link href="/profile" aria-label='Profile'><FiUser size={20} className='cursor-pointer' /></Link>
                </div>

                {/* Mobile menu toggle */}
                <div className='md:hidden flex items-center gap-4'>
                    <button onClick={toggleMenu} className='focus:outline-none' aria-label="Toggle menu" aria-expanded={isMenuOpen}>
                        {isMenuOpen ? <RxCross1 size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <div
                ref={menuRef}
                className={`fixed top-0 left-0 w-64 h-full bg-white shadow-md transform z-50 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}
            >
                <div className='p-4'>
                    <Link href="/" className='text-2xl cursor-pointer block mb-4'>Pasal</Link>
                    <ul className='space-y-4'>
                        <li className='cursor-pointer hover:scale-105 duration-200'><Link href="/">Home</Link></li>
                        <li className='cursor-pointer hover:scale-105 duration-200'><a href="#jerseys">Jerseys</a></li>
                        <li className='cursor-pointer hover:scale-105 duration-200'><a href="#teams">Teams</a></li>
                    </ul>
                    <div className='mt-6 space-y-4'>
                        <input
                            type="text"
                            placeholder="Search"
                            className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm h-10'
                        />
                        <Link href="/cart" aria-label='Cart' className='flex items-center'><FiShoppingCart size={20} className='mr-2' /> Cart</Link>
                        <Link href="/favorites" aria-label='Favorites' className='flex items-center'><FiHeart size={20} className='mr-2' /> Favorites</Link>
                        <Link href="/profile" aria-label='Profile' className='flex items-center'><FiUser size={20} className='mr-2' /> Profile</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
