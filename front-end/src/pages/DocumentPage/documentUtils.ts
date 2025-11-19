export const formatDate = (dateString: string): string => {
    if (!dateString || dateString === null || dateString === undefined || dateString === '') {
      return new Date().toLocaleString();
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };