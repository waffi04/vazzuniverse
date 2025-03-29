import { PlansProps, SubCategories } from '@/types/category';

export const matchProductToCategory = (
  plan: PlansProps,
  category: SubCategories
): boolean => {
  // Case 1: Special handling for Top-up category
  if (
    category.name.toLowerCase() === 'top-up' ||
    category.code?.toLowerCase() === 'top-up'
  ) {
    // For top-up, use special logic if needed
    return true;
  }

  // Case 2: Direct sub-category ID matching
  if (plan.subCategoryId && category.id) {
    if (Number(plan.subCategoryId) === Number(category.id)) {
      return true;
    }
  }

  const masaAktifKeywords = [
    'tambah masa aktif', 
    'perpanjangan masa aktif', 
    'extension', 
    'validity'
  ];

  if (plan.layanan) {
    const layananLower = String(plan.layanan).toLowerCase();
    
    // Check for masa aktif specific keywords
    if (masaAktifKeywords.some(keyword => layananLower.includes(keyword))) {
      return true;
    }
    if (
      layananLower.includes('axis tambah masa aktif kartu') || 
      plan.providerId?.toLowerCase().includes('maxi')
    ) {
      return true;
    }
  }

  // Case 4: Data/Internet category matching
  if (
    (plan.layanan && category.code?.toLowerCase() === 'data') ||
    category.name.toLowerCase().includes('data') ||
    category.name.toLowerCase().includes('internet')
  ) {
    const layananLower = String(plan.layanan).toLowerCase();
    if (
      layananLower.includes('gb') ||
      layananLower.includes('data') ||
      layananLower.includes('internet')
    ) {
      return true;
    }
  }

  // Case 5: Provider ID and category code matching
  if (plan.providerId && category.code) {
    const providerIdLower = String(plan.providerId).toLowerCase();
    const categoryCodeLower = String(category.code).toLowerCase();

    const categoryMappings: Record<string, string[]> = {
      pulsa: ['pulsa', 'pls', 'credit', 'pulsa transfer', 'Pulsa Transfer'],
      data: ['data', 'internet', 'gb', 'mb', 'adb', 'max', 'alwayson', 'combo'],
      voucher: ['voucher', 'vcr', 'vch'],
      game: ['game', 'games', 'gmg'],
      pln: ['pln', 'listrik', 'electric'],
      pakettelp: ['telp', 'call', 'voice', 'telpn'],
      masaaktif: ['maxi', 'masa aktif', 'perpanjangan']
    };

    // Check based on mapping
    if (categoryMappings[categoryCodeLower]) {
      return categoryMappings[categoryCodeLower].some((keyword) =>
        providerIdLower.includes(keyword)
      );
    }

    // Fallback to general checking
    return (
      providerIdLower.includes(categoryCodeLower) ||
      categoryCodeLower.includes(providerIdLower)
    );
  }

  return false;
};