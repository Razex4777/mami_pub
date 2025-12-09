import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const ShoppingCartAddIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <img 
    src="/icons/product-actions/shopping_cart_add_32.svg" 
    alt="Add to cart"
    className={className}
    style={{ width: size, height: size }}
  />
);

export const HeartFavoriteIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <img 
    src="/icons/product-actions/heart_favorite_32.svg" 
    alt="Favorite"
    className={className}
    style={{ width: size, height: size }}
  />
);

export const EyeQuickViewIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <img 
    src="/icons/product-actions/eye_quick_view_32.svg" 
    alt="Quick view"
    className={className}
    style={{ width: size, height: size }}
  />
);

export const CompareArrowsIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <img 
    src="/icons/product-actions/compare_arrows_32.svg" 
    alt="Compare"
    className={className}
    style={{ width: size, height: size }}
  />
);
