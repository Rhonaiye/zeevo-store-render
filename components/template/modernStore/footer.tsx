import React from 'react'
import Image from 'next/image'
import { Store } from '@/store/useAppStore'



function Footer({store}: {store: Store}) {
  return (
    <footer className="text-white py-12" style={{ backgroundColor: store.secondaryColor }}>
           <div className="max-w-7xl mx-auto px-4">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
               {/* Store Info */}
               <div>
                 <div className="flex items-center space-x-3 mb-4">
                   {store.logo && (
                     <div className="relative w-8 h-8">
                       <Image
                         src={store.logo}
                         alt="Logo"
                         fill
                         className="rounded-full object-cover"
                       />
                     </div>
                   )}
                   <h3 className="text-xl font-bold">{store.name}</h3>
                 </div>
                 {store.description && (
                   <p className="text-gray-200 text-sm mb-4">{store.description}</p>
                 )}
               </div>
   
               {/* Contact Info */}
               {store.contact && (
                 <div>
                   <h4 className="text-lg font-semibold mb-4">Contact</h4>
                   <div className="space-y-2 text-gray-200 text-sm">
                     {store.contact.email && <p>Email: {store.contact.email}</p>}
                     {store.contact.phone && <p>Phone: {store.contact.phone}</p>}
                     {store.contact.address && <p>Address: {store.contact.address}</p>}
                   </div>
                 </div>
               )}
   
               {/* Policies */}
               {store.policies && (store.policies.returns || store.policies.terms) && (
                 <div>
                   <h4 className="text-lg font-semibold mb-4">Policies</h4>
                   <div className="space-y-2 text-gray-200 text-sm">
                     {store.policies.returns && (
                       <div>
                         <h5 className="font-medium">Returns</h5>
                         <p className="line-clamp-3">{store.policies.returns}</p>
                       </div>
                     )}
                     {store.policies.terms && (
                       <div>
                         <h5 className="font-medium">Terms</h5>
                         <p className="line-clamp-3">{store.policies.terms}</p>
                       </div>
                     )}
                   </div>
                 </div>
               )}
             </div>
   
             <div className="border-t border-white border-opacity-20 mt-8 pt-8 text-center text-gray-200 text-sm">
               <p>© 2025 {store.name}. All rights reserved.</p>
             </div>
           </div>
         </footer>
  )
}

export default Footer