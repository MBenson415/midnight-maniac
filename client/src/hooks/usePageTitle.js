import { useEffect } from 'react';

export default function usePageTitle(title) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `Midnight Maniac - ${title}` : 'Midnight Maniac';
    
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}
