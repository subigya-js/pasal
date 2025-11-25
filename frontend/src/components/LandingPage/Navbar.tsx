"use client";

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { FiHeart, FiMenu, FiShoppingCart, FiUser } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";

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
                    <input
                        type="text"
                        placeholder="Search"
                        className='rounded-lg border border-gray-300 px-3 py-1 text-sm h-10'
                    />
                    <Link href="/cart" aria-label='Cart'><FiShoppingCart size={20} className='cursor-pointer' /></Link>
                    <Link href="/favorites" aria-label='Favorites'><FiHeart size={20} className='cursor-pointer' /></Link>
                    {isMounted ? (
                        isLoggedIn ? (
                            <div className='relative' ref={userDropdownRef}>
                                <button
                                    onClick={toggleUserDropdown}
                                    aria-label='User menu'
                                    className='cursor-pointer hover:opacity-80 transition-opacity'
                                >
                                    <FiUser size={20} />
                                </button>

                                {isUserDropdownOpen && (
                                    <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50'>
                                        <Link
                                            href="/profile"
                                            className='block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors'
                                            onClick={() => setIsUserDropdownOpen(false)}
                                        >
                                            Profile
                                        </Link>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setIsUserDropdownOpen(false);
                                            }}
                                            className='w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors'
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className='px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200'
                            >
                                Login
                            </Link>
                        )
                    ) : (
                        <div className='h-10'></div>
                    )}
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
                        {isMounted && (
                            isLoggedIn ? (
                                <>
                                    <Link
                                        href="/profile"
                                        aria-label='Profile'
                                        className='flex items-center px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors'
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <FiUser size={20} className='mr-2 mt-4' /> Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsMenuOpen(false);
                                        }}
                                        className='w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    className='block w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-center'
                                >
                                    Login
                                </Link>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
