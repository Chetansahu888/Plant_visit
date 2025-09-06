// import type React from "react"
// import type { Metadata } from "next"
// import { GeistSans } from "geist/font/sans"
// import { GeistMono } from "geist/font/mono"
// import { DM_Sans } from "next/font/google"
// import "./globals.css"
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";


// const dmSans = DM_Sans({
//   subsets: ["latin"],
//   display: "swap",
//   variable: "--font-dm-sans",
// })

// export const metadata: Metadata = {
//   title: "Plant Visit Task Management System",
//   description: "Industrial task management system for plant visits and maintenance scheduling",
//   generator: "v0.app",
// }

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode
// }>) {
//   return (
//     <html lang="en">
//       <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${dmSans.variable}`}>
//         <ToastContainer position="top-right" autoClose={3000} />
//         {children}


//         <div className="bg-gradient-to-r from-indigo-800 via-purple-800 to-blue-800 text-white py-3 relative overflow-hidden">
//         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/10 via-purple-600/10 to-transparent"></div>
//         <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
//           <div className="flex items-center justify-center space-x-2 mb-2">
//             <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center shadow-lg">
//               <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
//               </svg>
//             </div>
//             <span className="text-sm text-gray-300">Powered by</span>
//             <a 
//               href="https://www.botivate.in/" 
//               target="_blank" 
//               rel="noopener noreferrer"
//               className="text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text font-bold text-base hover:from-blue-200 hover:via-purple-200 hover:to-pink-200 transition-all duration-300 cursor-pointer"
//             >
//               Botivate
//             </a>
//           </div>
//           <div className="flex items-center justify-center space-x-1">
//             <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
//             <div className="w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse delay-300"></div>
//             <div className="w-1.5 h-1.5 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full animate-pulse delay-700"></div>
//           </div>
//         </div>
//       </div>
//       </body>
      
//     </html>
//   )
// }









import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { DM_Sans } from "next/font/google"
import "./globals.css"
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "Plant Visit Task Management System",
  description: "Industrial task management system for plant visits and maintenance scheduling",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${dmSans.variable} relative`}>
        {/* Toast notifications */}
        <ToastContainer position="top-right" autoClose={3000} />

        {/* Main content */}
        {children}

        {/* Footer */}
        <div className="bg-gradient-to-r from-indigo-800 via-purple-800 to-blue-800 text-white py-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/10 via-purple-600/10 to-transparent"></div>
          <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm text-gray-300">Powered by</span>
              <a 
                href="https://www.botivate.in/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text font-bold text-base hover:from-blue-200 hover:via-purple-200 hover:to-pink-200 transition-all duration-300 cursor-pointer"
              >
                Botivate
              </a>
            </div>
            <div className="flex items-center justify-center space-x-1">
              <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse delay-300"></div>
              <div className="w-1.5 h-1.5 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full animate-pulse delay-700"></div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}

