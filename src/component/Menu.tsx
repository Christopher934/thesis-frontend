import Link from "next/link";
import Image from "next/image";
import { role } from "@/lib/data";
const menuItems = [
    {
        title: "MENU",
        items: [
            {
                icon: "/home.png",
                label: "Dashboard",
                href: "/",
                visible: ["admin", "pegawai"],
            },
            {
                icon: "/tenagakerja.png",
                label: "Pegawai",
                href: "/list/pegawai",
                visible: ["admin"],
            },
            {
                icon: "/subject.png",
                label: "Managemen Jadwal",
                href: "/list/managemenjadwal",
                visible: ["admin"],
            },
            {
                icon: "/class.png",
                label: "Jadwal Saya",
                href: "/list/jadwalsaya",
                visible: ["admin", "pegawai"],
            },
            {
                icon: "/assignment.png",
                label: "Ajukan Tukar Shift",
                href: "/list/ajukantukarshift",
                visible: ["admin", "pegawai"],
            },
            {
                icon: "/attendance.png",
                label: "Absensi",
                href: "/list/absensi",
                visible: ["admin", "pegawai"],
            },
            {
                icon: "/calendar.png",
                label: "Events",
                href: "/list/events",
                visible: ["admin", "pegawai"],
            },
            {
                icon: "/message.png",
                label: "Pesan",
                href: "/list/messages",
                visible: ["admin", "pegawai"],
            },
            {
                icon: "/announcement.png",
                label: "Laporan",
                href: "/list/laporan",
                visible: ["admin",],
            },
        ],
    },
    {
        title: "OTHER",
        items: [
            {
                icon: "/profile.png",
                label: "Profile",
                href: "/profile",
                visible: ["admin", "pegawai"],
            },
            {
                icon: "/logout.png",
                label: "Logout",
                href: "/logout",
                visible: ["admin", "pegawai"],
            },
        ],
    },
];

const Menu = () => {
    return (
        <div className='mt-4 text-sm'>{menuItems.map(i => (
            <div className='flex flex-col gap-2' key={i.title}>
                <span className="hidden lg:block text-grey-400 font-light my-4">{i.title}</span>
                {i.items.map((item) => {
                    if (item.visible.includes(role)) {
                        return (
                            <Link
                                href={item.href}
                                key={item.label}
                                className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2"
                            >
                                <Image src={item.icon} alt="" width={20} height={20} />
                                <span className="hidden lg:block">{item.label}</span>
                            </Link>
                        );
                    }

                })}
            </div>
        ))}
        </div>
    )
}

export default Menu;