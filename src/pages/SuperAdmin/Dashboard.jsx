'use client'

import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from '@headlessui/react'
import {
    Bars3Icon,
    CalendarIcon,
    ChartPieIcon,
    DocumentDuplicateIcon,
    FolderIcon,
    HomeIcon,
    HomeModernIcon,
    UsersIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline'

const navigation = [
    { name: 'Dashboard', href: '#', icon: ChartPieIcon, current: true },
    { name: 'User', href: '#', icon: UsersIcon, current: false },
    { name: 'Hotels', href: '#', icon: HomeModernIcon, current: false },
    { name: 'Reports', href: '#', icon: ChartPieIcon, current: false },
]


function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function Example() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <>
            {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-white dark:bg-gray-900">
        <body class="h-full">
        ```
      */}
            <div>
                <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
                    />

                    <div className="fixed inset-0 flex">
                        <DialogPanel
                            transition
                            className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
                        >
                            <TransitionChild>
                                <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                                    <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                                        <span className="sr-only">Close sidebar</span>
                                        <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                                    </button>
                                </div>
                            </TransitionChild>

                            {/* Sidebar component, swap this element with another sidebar if you like */}
                            <div className="relative flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-2 ring-1 ring-white/10 dark:before:pointer-events-none dark:before:absolute dark:before:inset-0 dark:before:bg-black/10">
                                <div className="relative flex h-16 shrink-0 items-center">
                                    <img
                                        alt="Your Company"
                                        src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                                        className="h-8 w-auto dark:hidden"
                                    />
                                    <img
                                        alt="Your Company"
                                        src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                                        className="relative h-8 w-auto not-dark:hidden"
                                    />
                                </div>
                                <nav className="flex flex-1 flex-col ">
                                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                        <li>
                                            <ul role="list" className="-mx-2 space-y-1">
                                                {navigation.map((item) => (
                                                    <li key={item.name}>
                                                        <a
                                                            href={item.href}
                                                            className={classNames(
                                                                item.current
                                                                    ? 'bg-white/5 text-white'
                                                                    : 'text-gray-400 hover:bg-white/5 hover:text-white',
                                                                'group flex gap-x-3 rounded-md p-2 text-sm/6  ',
                                                            )}
                                                        >
                                                            <item.icon aria-hidden="true" className="size-6 shrink-0" />
                                                            {item.name}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </li>
                                       
                                    </ul>
                                </nav>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>

                {/* Static sidebar for desktop */}
                <div className="hidden bg-gray-900 lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                    {/* Sidebar component, swap this element with another sidebar if you like */}
                    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 px-6 dark:border-white/10 dark:bg-black/10">
                        <div className="flex h-16 shrink-0 items-center">
                            <img
                                alt="Your Company"
                                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                                className="h-8 w-auto dark:hidden"
                            />
                            <img
                                alt="Your Company"
                                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                                className="h-8 w-auto not-dark:hidden"
                            />
                        </div>
                        <nav className="flex flex-1 flex-col">
                            <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                <li>
                                    <ul role="list" className="-mx-2 space-y-1">
                                        {navigation.map((item) => (
                                            <li key={item.name}>
                                                <a
                                                    href={item.href}
                                                    className={classNames(
                                                        item.current ? 'bg-white/5 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white',
                                                        'group flex gap-x-3 rounded-md p-2 text-sm/6 ',
                                                    )}
                                                >
                                                    <item.icon aria-hidden="true" className="size-6 shrink-0" />
                                                    {item.name}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                              
                                <li className="-mx-6 mt-auto">
                                    <a
                                        href="#"
                                        className="flex items-center gap-x-4 px-6 py-3 text-sm/6   text-white hover:bg-white/5"
                                    >
                                        <img
                                            alt=""
                                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                            className="size-8 rounded-full bg-gray-800 outline -outline-offset-1 outline-white/10"
                                        />
                                        <span className="sr-only">Your profile</span>
                                        <span aria-hidden="true">Tom Cook</span>
                                    </a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>

                <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-gray-900 px-4 py-4 shadow-sm sm:px-6 lg:hidden dark:shadow-none dark:after:pointer-events-none dark:after:absolute dark:after:inset-0 dark:after:border-b dark:after:border-white/10 dark:after:bg-black/10">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        className="-m-2.5 p-2.5 text-gray-400 hover:text-white lg:hidden"
                    >
                        <span className="sr-only">Open sidebar</span>
                        <Bars3Icon aria-hidden="true" className="size-6" />
                    </button>
                    <div className="flex-1 text-sm/6   text-white">Dashboard</div>
                    <a href="#">
                        <span className="sr-only">Your profile</span>
                        <img
                            alt=""
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                            className="size-8 rounded-full bg-gray-800 outline -outline-offset-1 outline-white/10"
                        />
                    </a>
                </div>

                <main className="py-10  lg:pl-72">
                    <div className="px-4   sm:px-6 lg:px-8">{/* Your content */}</div>
                </main>
            </div>
        </>
    )
}
