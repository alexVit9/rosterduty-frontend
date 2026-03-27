// Generate consistent colors for locations and departments
export const getBadgeColor = (text: string, type: 'location' | 'department'): string => {
  // Special case for "Все" or "all"
  if (text === 'Все локации' || text === 'Все отделы' || text === 'all' || text === 'Все') {
    return 'bg-white text-gray-700 border-gray-300';
  }
  
  // Improved hash function with better distribution
  let hash = 0;
  const seed = type === 'location' ? 123 : 456; // Different seed for location vs department
  
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char + seed;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Additional mixing to reduce collisions with better bit distribution
  hash = Math.abs(hash);
  hash = ((hash >> 16) ^ hash) * 0x45d9f3b;
  hash = ((hash >> 16) ^ hash) * 0x45d9f3b;
  hash = ((hash >> 16) ^ hash) * 0x3335b369;
  hash = (hash >> 16) ^ hash;
  
  const colors = type === 'location' 
    ? [
        'bg-blue-100 text-blue-700 border-blue-200',
        'bg-purple-100 text-purple-700 border-purple-200',
        'bg-green-100 text-green-700 border-green-200',
        'bg-orange-100 text-orange-700 border-orange-200',
        'bg-pink-100 text-pink-700 border-pink-200',
        'bg-indigo-100 text-indigo-700 border-indigo-200',
        'bg-cyan-100 text-cyan-700 border-cyan-200',
        'bg-lime-100 text-lime-700 border-lime-200',
        'bg-teal-100 text-teal-700 border-teal-200',
        'bg-rose-100 text-rose-700 border-rose-200',
      ]
    : [
        'bg-rose-100 text-rose-700 border-rose-200',
        'bg-emerald-100 text-emerald-700 border-emerald-200',
        'bg-amber-100 text-amber-700 border-amber-200',
        'bg-violet-100 text-violet-700 border-violet-200',
        'bg-teal-100 text-teal-700 border-teal-200',
        'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
        'bg-sky-100 text-sky-700 border-sky-200',
        'bg-yellow-100 text-yellow-700 border-yellow-200',
        'bg-indigo-100 text-indigo-700 border-indigo-200',
        'bg-pink-100 text-pink-700 border-pink-200',
      ];
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};