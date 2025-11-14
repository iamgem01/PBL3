// import React, { useState, useRef, useEffect } from react;
// import { Share2, MessageSquare, User, Globe, Bold, Italic, Underline, Strikethrough, Link, AlignLeft, Hash, MoreHorizontal, Type, FileText, Menu } from 'lucide-react';

// interface ChecklistItem {
//   id: string;
//   text: string;
//   checked: boolean;
// }

// interface SelectionToolbar {
//   show: boolean;
//   x: number;
//   y: number;
// }

// export default function TravelPlanner() {
//   const [checklist, setChecklist] = useState<ChecklistItem[]>([
//     { id: '1', text: 'Passport 🛂', checked: false },
//     { id: '2', text: 'Boarding pass / Tickets', checked: false },
//     { id: '3', text: 'Wallet (cash + cards)', checked: false },
//     { id: '4', text: 'Phone + charger', checked: false },
//     { id: '5', text: 'Travel insurance documents', checked: false },
//     { id: '6', text: 'Keys', checked: false },
//   ]);

//   const [noteName, setNoteName] = useState('Travel Planner');
//   const [isEditingName, setIsEditingName] = useState(false);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const nameInputRef = useRef<HTMLInputElement>(null);

//   const [selectionToolbar, setSelectionToolbar] = useState<SelectionToolbar>({
//     show: false,
//     x: 0,
//     y: 0,
//   });

//   const contentRef = useRef<HTMLDivElement>(null);

//   const toggleCheck = (id: string) => {
//     setChecklist(prev =>
//       prev.map(item =>
//         item.id === id ? { ...item, checked: !item.checked } : item
//       )
//     );
//   };

//   const handleTextSelection = () => {
//     const selection = window.getSelection();
//     if (selection && selection.toString().length > 0) {
//       const range = selection.getRangeAt(0);
//       const rect = range.getBoundingClientRect();
      
//       setSelectionToolbar({
//         show: true,
//         x: rect.left + rect.width / 2,
//         y: rect.top + window.scrollY - 50,
//       });
//     } else {
//       setSelectionToolbar({ show: false, x: 0, y: 0 });
//     }
//   };

//   useEffect(() => {
//     document.addEventListener('mouseup', handleTextSelection);
//     document.addEventListener('selectionchange', () => {
//       const selection = window.getSelection();
//       if (!selection || selection.toString().length === 0) {
//         setSelectionToolbar({ show: false, x: 0, y: 0 });
//       }
//     });

//     return () => {
//       document.removeEventListener('mouseup', handleTextSelection);
//     };
//   }, []);

//   useEffect(() => {
//     if (isEditingName && nameInputRef.current) {
//       nameInputRef.current.focus();
//       nameInputRef.current.select();
//     }
//   }, [isEditingName]);

//   const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setNoteName(e.target.value);
//   };

//   const handleNameBlur = () => {
//     setIsEditingName(false);
//     if (noteName.trim() === '') {
//       setNoteName('Travel Planner');
//     }
//   };

//   const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       setIsEditingName(false);
//     } else if (e.key === 'Escape') {
//       setIsEditingName(false);
//       setNoteName('Travel Planner');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex">       
//       {/* Main Content */}
//       <div
//         className={`flex-1 transition-all duration-300 ${
//           sidebarCollapsed ? 'ml-16' : 'ml-64'
//         }`}
//       >
//         {/* Header */}
//         <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <div className="flex items-center gap-2">
//               <FileText className="w-4 h-4 text-gray-600" />
//               {isEditingName ? (
//                 <input
//                   ref={nameInputRef}
//                   type="text"
//                   value={noteName}
//                   onChange={handleNameChange}
//                   onBlur={handleNameBlur}
//                   onKeyDown={handleNameKeyDown}
//                   className="text-gray-600 bg-transparent border-b border-blue-500 outline-none px-1"
//                 />
//               ) : (
//                 <span
//                   className="text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
//                   onClick={() => setIsEditingName(true)}
//                 >
//                   {noteName}
//                 </span>
//               )}
//             </div>
//             <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded flex items-center gap-1">
//               <Globe className="w-3 h-3" />
//               Private
//             </span>
//           </div>
//           <div className="flex items-center gap-2">
//             <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded flex items-center gap-2">
//               <Share2 className="w-4 h-4" />
//               Share
//             </button>
//             <button className="w-8 h-8 hover:bg-gray-100 rounded flex items-center justify-center">
//               <User className="w-4 h-4 text-gray-600" />
//             </button>
//             <button className="w-8 h-8 hover:bg-gray-100 rounded flex items-center justify-center">
//               <MoreHorizontal className="w-4 h-4 text-gray-600" />
//             </button>
//           </div>
//         </header>

//         <main className="max-w-4xl mx-auto px-6 py-8" ref={contentRef}>
//           {/* Selection Toolbar */}
//           {selectionToolbar.show && (
//             <div
//               className="fixed z-50 bg-gray-900 text-white rounded-lg shadow-2xl px-2 py-1.5 flex items-center gap-1"
//               style={{
//                 left: `${selectionToolbar.x}px`,
//                 top: `${selectionToolbar.y}px`,
//                 transform: 'translateX(-50%)',
//               }}
//             >
//               <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center transition-colors">
//                 <Type className="w-4 h-4" />
//               </button>
//               <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center transition-colors">
//                 <Bold className="w-4 h-4" />
//               </button>
//               <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center transition-colors">
//                 <Italic className="w-4 h-4" />
//               </button>
//               <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center transition-colors">
//                 <Underline className="w-4 h-4" />
//               </button>
//               <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center transition-colors">
//                 <Strikethrough className="w-4 h-4" />
//               </button>
//               <div className="w-px h-6 bg-gray-600 mx-1"></div>
//               <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center transition-colors">
//                 <Link className="w-4 h-4" />
//               </button>
//               <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center transition-colors">
//                 <MessageSquare className="w-4 h-4" />
//               </button>
//             </div>
//           )}

//           {/* Hero Image */}
//           <div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg">
//             <img
//               src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=400&fit=crop"
//               alt="Travel landmarks"
//               className="w-full h-64 object-cover"
//             />
//             <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
//             <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-xl transition-all">
//               <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M12 2L4.5 20.5l.75-8.5L12 2z"/>
//                 <path d="M12 2l7.5 18.5-.75-8.5L12 2z"/>
//                 <path d="M5.25 12l6.75 8.5L19.5 12H5.25z"/>
//               </svg>
//             </button>
//           </div>

//           {/* Title */}
//           <h1 className="text-4xl font-bold mb-8">{noteName}</h1>

//           {/* Instructions */}
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
//             <p className="text-blue-800 text-sm">
//               Expand each category below by clicking the{' '}
//               <span className="font-semibold">▶</span> to use your packing checklist!
//             </p>
//           </div>

//           {/* Checklist */}
//           <div className="bg-white rounded-lg border border-gray-200 p-6">
//             <div className="flex items-center gap-2 mb-4">
//               <span className="text-lg">📋</span>
//               <h2 className="text-lg font-semibold">Essentials</h2>
//             </div>
//             <div className="space-y-3">
//               {checklist.map(item => (
//                 <label
//                   key={item.id}
//                   className="flex items-center gap-3 cursor-pointer group"
//                 >
//                   <input
//                     type="checkbox"
//                     checked={item.checked}
//                     onChange={() => toggleCheck(item.id)}
//                     className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
//                   />
//                   <span
//                     className={`${
//                       item.checked
//                         ? 'line-through text-gray-400'
//                         : 'text-gray-700'
//                     } group-hover:text-gray-900 transition-colors`}
//                   >
//                     {item.text}
//                   </span>
//                 </label>
//               ))}
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }