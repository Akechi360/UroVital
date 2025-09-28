
'use client';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/layout/auth-provider";
import { Stethoscope, Mail, Phone, MapPin, Clock, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import Link from "next/link";
import 'animate.css';
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from 'react';
import Image from "next/image";
import { Input } from "@/components/ui/input";

const NAV_LINKS = [
    { href: "/landing", label: "Home" },
    { href: "#", label: "About" },
    { href: "#", label: "Services" },
    { href: "#", label: "Departments" },
    { href: "#", label: "Doctors" },
    { href: "#", label: "Contact" },
]

const Footer = () => {
    return (
        <footer className="bg-[#0D122A] text-white pt-20 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* About */}
                    <div className="space-y-4">
                        <Link href="/landing" className="flex items-center gap-2 font-bold text-xl">
                            <div className="bg-white p-2 rounded-md">
                                <Stethoscope className="h-6 w-6 text-primary" />
                            </div>
                            <span className="font-headline text-white">UroVital</span>
                        </Link>
                        <p className="text-sm text-gray-400">
                            Our team of highly trained professionals uses the latest healing technologies to restore you to pain-free health quickly and easily.
                        </p>
                        <div className="flex space-x-4">
                            <Link href="#" className="text-gray-400 hover:text-white"><Facebook size={20} /></Link>
                            <Link href="#" className="text-gray-400 hover:text-white"><Twitter size={20} /></Link>
                            <Link href="#" className="text-gray-400 hover:text-white"><Linkedin size={20} /></Link>
                            <Link href="#" className="text-gray-400 hover:text-white"><Instagram size={20} /></Link>
                        </div>
                    </div>

                    {/* Useful Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Useful Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#" className="text-gray-400 hover:text-white hover:underline">About Us</Link></li>
                            <li><Link href="#" className="text-gray-400 hover:text-white hover:underline">Our Services</Link></li>
                            <li><Link href="#" className="text-gray-400 hover:text-white hover:underline">Our Team</Link></li>
                            <li><Link href="#" className="text-gray-400 hover:text-white hover:underline">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4 text-sm">
                        <h3 className="text-lg font-semibold">Contact Info</h3>
                        <p className="flex items-start gap-3">
                            <MapPin size={16} className="mt-1 shrink-0" />
                            <span>123 Street, New York, USA</span>
                        </p>
                        <p className="flex items-center gap-3">
                            <Mail size={16} />
                            <a href="mailto:info@urovital.com" className="hover:underline">info@urovital.com</a>
                        </p>
                        <p className="flex items-center gap-3">
                            <Phone size={16} />
                            <a href="tel:+01234567890" className="hover:underline">+012 345 67890</a>
                        </p>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
                        <p className="text-sm text-gray-400 mb-4">Subscribe to our newsletter to get the latest updates.</p>
                        <div className="flex">
                            <Input type="email" placeholder="Your email" className="bg-transparent border-gray-600 rounded-r-none" />
                            <Button className="rounded-l-none">Sign Up</Button>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} UroVital. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};


export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-body">
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-background/95 shadow-md" : "bg-transparent"
      )}>
        {/* Top Bar */}
        <div className="bg-[#EBF1F8] dark:bg-gray-900/50 text-xs text-gray-600 dark:text-gray-300">
            <div className="container mx-auto px-4 py-2 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Phone size={14} />
                        <span>+012 345 6789</span>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                        <Mail size={14} />
                        <span>info@urovital.com</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                     <div className="hidden lg:flex items-center gap-2">
                        <Clock size={14} />
                        <span>Opening Hours: Mon - Fri: 9am - 5pm</span>
                    </div>
                     <div className="hidden md:flex items-center gap-2">
                        <MapPin size={14} />
                        <span>123 Street, New York, USA</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
                <Link href="/landing" className="flex items-center gap-2 font-bold text-lg">
                    <div className={cn("p-2 rounded-md transition-colors", scrolled ? "bg-primary/10" : "bg-white")}>
                        <Stethoscope className="h-7 w-7 text-primary" />
                    </div>
                    <span className="font-headline text-primary">UroVital</span>
                </Link>
                <nav className="hidden lg:flex items-center gap-2">
                    {NAV_LINKS.map(link => (
                        <Button key={link.href} asChild variant="ghost" className={cn(
                            "font-semibold",
                            pathname.startsWith(link.href) && "text-primary"
                        )}>
                            <Link href={link.href}>{link.label}</Link>
                        </Button>
                    ))}
                </nav>
                <div className="flex items-center gap-2">
                    <Button asChild>
                        <Link href={isAuthenticated ? "/dashboard" : "/login"}>
                        {isAuthenticated ? "Ir al Panel" : "Make Appointment"}
                        </Link>
                    </Button>
                     <Button asChild variant="outline">
                        <Link href={isAuthenticated ? "/dashboard" : "/login"}>
                          Login
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
}
