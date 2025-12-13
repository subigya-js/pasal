"use client";

import Link from "next/link";
import { FiFacebook, FiInstagram, FiMail, FiMapPin, FiPhone, FiTwitter, FiYoutube } from "react-icons/fi";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent inline-block">
                            Pasal
                        </Link>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Your premier destination for authentic football jerseys. We bring you the best quality jerseys from top clubs around the world.
                        </p>
                        {/* Social Media Links */}
                        <div className="flex gap-3 pt-2">
                            <a
                                href="https://facebook.com/siuubedi"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-blue-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                                aria-label="Facebook"
                            >
                                <FiFacebook size={18} />
                            </a>
                            <a
                                href="https://x.com/subigya_js"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-sky-500 flex items-center justify-center transition-all duration-300 hover:scale-110"
                                aria-label="Twitter"
                            >
                                <FiTwitter size={18} />
                            </a>
                            <a
                                href="https://instagram.com/siuubedi.js"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-pink-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                                aria-label="Instagram"
                            >
                                <FiInstagram size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-white">Quick Links</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm flex items-center group">
                                    <span className="w-0 h-0.5 bg-white group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/#jerseys" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm flex items-center group">
                                    <span className="w-0 h-0.5 bg-white group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                                    Shop Jerseys
                                </Link>
                            </li>
                            <li>
                                <Link href="/#teams" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm flex items-center group">
                                    <span className="w-0 h-0.5 bg-white group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                                    Browse Teams
                                </Link>
                            </li>
                            <li>
                                <Link href="/cart" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm flex items-center group">
                                    <span className="w-0 h-0.5 bg-white group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                                    Shopping Cart
                                </Link>
                            </li>
                            <li>
                                <Link href="/profile" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm flex items-center group">
                                    <span className="w-0 h-0.5 bg-white group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                                    My Account
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-white">Customer Service</h3>
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm flex items-center group">
                                    <span className="w-0 h-0.5 bg-white group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                                    About Us
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm flex items-center group">
                                    <span className="w-0 h-0.5 bg-white group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                                    Contact Us
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm flex items-center group">
                                    <span className="w-0 h-0.5 bg-white group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                                    Shipping & Delivery
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm flex items-center group">
                                    <span className="w-0 h-0.5 bg-white group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                                    Returns & Exchanges
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm flex items-center group">
                                    <span className="w-0 h-0.5 bg-white group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                                    FAQs
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-white">Get in Touch</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-gray-300 text-sm">
                                <FiMapPin className="mt-1 flex-shrink-0 text-blue-400" size={18} />
                                <span>BP Chowk, Waling-8, Syangja, Nepal- 33801</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-300 text-sm">
                                <FiPhone className="flex-shrink-0 text-green-400" size={18} />
                                <a href="tel:+9779846071244" className="hover:text-white transition-colors">
                                    +977 9846071244
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-gray-300 text-sm">
                                <FiMail className="flex-shrink-0 text-red-400" size={18} />
                                <a href="mailto:support@pasal.com" className="hover:text-white transition-colors">
                                    contact@subigyasubedi.com.np
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 text-sm text-center md:text-left">
                            © {currentYear} Pasal. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
