"use client";

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { FiHeart, FiMenu, FiShoppingCart, FiUser } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";
import { Input } from '../ui/input';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const userDropdownRef = useRef<HTMLDivElement>(null);
    const { isLoggedIn, logout } = useAuth();

    // Only render auth-dependent UI after mounting on client
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(prev => !prev);
    };

    const toggleUserDropdown = () => {
        setIsUserDropdownOpen(prev => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
                setIsUserDropdownOpen(false);
            }
        };

        if (isMenuOpen || isUserDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen, isUserDropdownOpen]);

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
                    <Input
                        type="text"
                        placeholder="Search"
                        className='rounded-lg border border-gray-300 px-3 py-1 text-sm h-10'
                    />
                    <Link href="/cart" aria-label='Cart'><FiShoppingCart size={20} className='cursor-pointer' /></Link>
                    <Link href="/favorites" aria-label='Favorites'><FiHeart size={20} className='cursor-pointer' /></Link>
                    {isMounted ? (
                        isLoggedIn ? (
                            <div className='relative' ref={userDropdownRef}>
                                <Button
                                    onClick={toggleUserDropdown}
                                    variant="default"
                                    className='cursor-pointer bg-none'
                                >
                                    <FiUser size={28} />
                                </Button>

                                {isUserDropdownOpen && (
                                    <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50'>
                                        <Link
                                            href="/profile"
                                            className='block px-4 py-2 cursor-pointer'
                                            onClick={() => setIsUserDropdownOpen(false)}
                                        >
                                            Profile
                                        </Link>
                                        <Button
                                            onClick={() => {
                                                logout();
                                                setIsUserDropdownOpen(false);
                                            }}
                                            variant="ghost"
                                            className='w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-600'
                                        >
                                            Sign Out
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Button asChild>
                                <Link href="/login">
                                    Login
                                </Link>
                            </Button>
                        )
                    ) : (
                        <div className='h-0'></div>
                    )}
                </div>

                {/* Mobile menu toggle */}
                <div className='md:hidden flex items-center gap-4'>
                    {isMounted && (
                        <Button onClick={toggleMenu} variant="ghost">
                            {isMenuOpen ? <RxCross1 size={28} /> : <FiMenu size={28} />}
                        </Button>
                    )}
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
                        <Input
                            type="text"
                            placeholder="Search"
                            className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm h-10'
                        />
                        <Link href="/cart" aria-label='Cart' className='flex items-center'><FiShoppingCart size={20} className='mr-2' /> Cart</Link>
                        <Link href="/favorites" aria-label='Favorites' className='flex items-center'><FiHeart size={20} className='mr-2' /> Favorites</Link>
                        {isMounted && (
                            isLoggedIn ? (
                                <>
                                    <Link
                                        href="/profile"
                                        aria-label='Profile'
                                        className='flex items-center px-4 py-2 hover:bg-gray-900 rounded-lg transition-colors items-center bg-gray-800 text-white'
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <FiUser size={20} className='mr-2' /> Profile
                                    </Link>
                                    <Button
                                        onClick={() => {
                                            logout();
                                            setIsMenuOpen(false);
                                        }}
                                        variant="ghost"
                                        className='w-full justify-start text-white bg-red-500 hover:bg-red-600 hover:text-white cursor-pointer'
                                    >
                                        Sign Out
                                    </Button>
                                </>
                            ) : (
                                <Button asChild className='w-full'>
                                    <Link href="/login">
                                        Login
                                    </Link>
                                </Button>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
