import { useState, useEffect } from 'react';
import ruTranslations from '../i18n/ru.json';

export const useI18n = () => {
  const [translations, setTranslations] = useState(ruTranslations);

  const t = (key, params = {}) => {
    const keyPath = key.split('.');
    let value = translations;
    
    for (const path of keyPath) {
      value = value?.[path];
    }
    
    if (typeof value !== 'string') {
      return key;
    }
    
    // Simple interpolation for params like {{count}}
    return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
      return params[paramKey] !== undefined ? params[paramKey] : match;
    });
  };

  return { t };
};