"use client";

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { FiHeart, FiMenu, FiShoppingCart, FiUser } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";
import { Input } from '../ui/input';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const userDropdownRef = useRef<HTMLDivElement>(null);
    const { isLoggedIn, logout } = useAuth();
    const { cartItemCount } = useCart();

    // Only render auth-dependent UI after mounting on client
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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
            <div className={`fixed top-0 left-0 right-0 z-40 px-4 md:px-10 flex items-center justify-between h-16 w-full transition-all duration-300 ${isScrolled
                    ? 'bg-white/95 backdrop-blur-md shadow-lg'
                    : 'bg-white shadow-md'
                }`}>
                {/* Left */}
                <div>
                    <Link href="/" className='text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform duration-300'>
                        Pasal
                    </Link>
                </div>

                {/* Middle - Hidden on mobile */}
                <div className='hidden md:flex justify-center'>
                    <ul className='flex justify-between gap-8'>
                        <li className='relative group'>
                            <Link href="/" className='cursor-pointer font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200'>
                                Home
                            </Link>
                            <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300'></span>
                        </li>
                        <li className='relative group'>
                            <a href="#jerseys" className='cursor-pointer font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200'>
                                Jerseys
                            </a>
                            <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300'></span>
                        </li>
                        <li className='relative group'>
                            <a href="#teams" className='cursor-pointer font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200'>
                                Teams
                            </a>
                            <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300'></span>
                        </li>
                    </ul>
                </div>

                {/* Right - Hidden on mobile */}
                <div className='hidden md:flex justify-end items-center gap-5'>
                    <div className='relative'>
                        <Input
                            type="text"
                            placeholder="Search jerseys..."
                            className='rounded-xl border-2 border-gray-200 focus:border-gray-400 px-4 py-2 text-sm h-10 w-56 transition-all duration-300 focus:w-64'
                        />
                        <svg className='absolute right-3 top-2.5 w-5 h-5 text-gray-400' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <Link href="/cart" aria-label='Cart' className='relative group'>
                        <div className='p-2 rounded-full hover:bg-gray-100 transition-colors duration-200'>
                            <FiShoppingCart size={22} className='cursor-pointer text-gray-700 group-hover:text-gray-900' />
                        </div>
                        {cartItemCount > 0 && (
                            <span className='absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-lg'>
                                {cartItemCount}
                            </span>
                        )}
                    </Link>

                    <Link href="/favorites" aria-label='Favorites' className='group'>
                        <div className='p-2 rounded-full hover:bg-gray-100 transition-colors duration-200'>
                            <FiHeart size={22} className='cursor-pointer text-gray-700 group-hover:text-red-500 transition-colors duration-200' />
                        </div>
                    </Link>

                    {isMounted ? (
                        isLoggedIn ? (
                            <div className='relative' ref={userDropdownRef}>
                                <Button
                                    onClick={toggleUserDropdown}
                                    variant="ghost"
                                    className='cursor-pointer hover:bg-gray-100 rounded-full p-2 h-auto'
                                >
                                    <div className='w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white'>
                                        <FiUser size={20} />
                                    </div>
                                </Button>

                                {isUserDropdownOpen && (
                                    <div className='absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-fade-in'>
                                        <Link
                                            href="/profile"
                                            className='block px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200 font-medium text-gray-700 hover:text-gray-900'
                                            onClick={() => setIsUserDropdownOpen(false)}
                                        >
                                            <div className='flex items-center gap-3'>
                                                <FiUser size={18} />
                                                <span>Profile</span>
                                            </div>
                                        </Link>
                                        <div className='border-t border-gray-100 my-1'></div>
                                        <Button
                                            onClick={() => {
                                                logout();
                                                setIsUserDropdownOpen(false);
                                            }}
                                            variant="ghost"
                                            className='w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 px-4 py-3 h-auto font-medium'
                                        >
                                            <svg className='w-5 h-5 mr-3' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Sign Out
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Button asChild className='rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300'>
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
                        <Button onClick={toggleMenu} variant="ghost" className='p-2 hover:bg-gray-100 rounded-lg'>
                            {isMenuOpen ? <RxCross1 size={24} /> : <FiMenu size={24} />}
                        </Button>
                    )}
                </div>
            </div>

            {/* Spacer to prevent content from going under fixed navbar */}
            <div className='h-16'></div>

            {/* Mobile menu */}
            <div
                ref={menuRef}
                className={`fixed top-0 left-0 w-80 h-full bg-white shadow-2xl transform z-50 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}
            >
                <div className='p-6'>
                    <div className='flex items-center justify-between mb-8'>
                        <Link href="/" className='text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent cursor-pointer'>
                            Pasal
                        </Link>
                        <Button onClick={toggleMenu} variant="ghost" className='p-2 hover:bg-gray-100 rounded-lg'>
                            <RxCross1 size={24} />
                        </Button>
                    </div>

                    <ul className='space-y-2 mb-6'>
                        <li>
                            <Link href="/" className='block px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200 font-medium text-gray-700'>
                                Home
                            </Link>
                        </li>
                        <li>
                            <a href="#jerseys" className='block px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200 font-medium text-gray-700'>
                                Jerseys
                            </a>
                        </li>
                        <li>
                            <a href="#teams" className='block px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200 font-medium text-gray-700'>
                                Teams
                            </a>
                        </li>
                    </ul>

                    <div className='space-y-4'>
                        <div className='relative'>
                            <Input
                                type="text"
                                placeholder="Search jerseys..."
                                className='w-full rounded-xl border-2 border-gray-200 px-4 py-2 text-sm h-11'
                            />
                            <svg className='absolute right-3 top-3 w-5 h-5 text-gray-400' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <Link href="/cart" aria-label='Cart' className='flex items-center px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 relative'>
                            <FiShoppingCart size={20} className='mr-3 text-gray-700' />
                            <span className='font-medium text-gray-700'>Cart</span>
                            {cartItemCount > 0 && (
                                <span className='ml-auto bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center'>
                                    {cartItemCount}
                                </span>
                            )}
                        </Link>

                        <Link href="/favorites" aria-label='Favorites' className='flex items-center px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200'>
                            <FiHeart size={20} className='mr-3 text-gray-700' />
                            <span className='font-medium text-gray-700'>Favorites</span>
                        </Link>

                        {isMounted && (
                            isLoggedIn ? (
                                <div className='space-y-2 pt-4 border-t border-gray-200'>
                                    <Link
                                        href="/profile"
                                        aria-label='Profile'
                                        className='flex items-center px-4 py-3 rounded-xl transition-all duration-200 bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:from-gray-800 hover:to-gray-700 shadow-md'
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <FiUser size={20} className='mr-3' />
                                        <span className='font-semibold'>Profile</span>
                                    </Link>
                                    <Button
                                        onClick={() => {
                                            logout();
                                            setIsMenuOpen(false);
                                        }}
                                        variant="ghost"
                                        className='w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer px-4 py-3 h-auto font-semibold rounded-xl'
                                    >
                                        <svg className='w-5 h-5 mr-3' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Sign Out
                                    </Button>
                                </div>
                            ) : (
                                <Button asChild className='w-full rounded-xl font-semibold shadow-md h-12 mt-4'>
                                    <Link href="/login">
                                        Login
                                    </Link>
                                </Button>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Overlay for mobile menu */}
            {isMenuOpen && (
                <div
                    className='fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden'
                    onClick={() => setIsMenuOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default Navbar;
