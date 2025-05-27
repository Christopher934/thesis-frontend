import Image from 'next/image'

const Navbar = () => {
    return (
        <div className='flex items-center justify-between p-4'>
            {/* Search Bar */}
            <div className="hidden md:flex items-center gap-2 text-xs ring-[1.5px] ring-gray-300  rounded-full px-2">
                <Image src="/search.png" alt='' width={14} height={14}></Image>
                <input type="text" placeholder='Search...' className='w-[200px] p-2 bg-transparent outline-none' />
            </div>
            {/* Icon and User */}
            <div className='flex items-center gap-6 justify-end w-full'>
                <div className='bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer'>
                    <Image src="/message.png" alt='' width={20} height={20}></Image>
                </div>
                <div className='bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer'>
                    <Image src="/announcement.png" alt='' width={20} height={20}></Image>
                </div>
                <div className="flex flex-col">
                    <span className='text-xs leading-3 font-medium'>Hans</span>
                    <span className='text-[10px] text-gray-500 text-right'>Admin</span>
                </div>
                <Image src='/avatar.png' alt='' width={36} height={36} className='rounded-full'></Image>
            </div>
        </div>

    )
}

export default Navbar