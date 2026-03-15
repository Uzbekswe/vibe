export interface LogoAsset {
  url: string;
  type: "favicon" | "apple-touch-icon" | "og:image" | "manifest" | "other";
  width?: number;
  height?: number;
}

export interface ColorAsset {
  hex: string;
  source: "theme-color" | "manifest" | "dominant" | "css";
  context?: string;
}

export interface BackdropAsset {
  url: string;
  alt?: string;
  source: "og:image" | "hero" | "css-background" | "other";
}

export interface TypographyAsset {
  family: string;
  weights: number[];
  sizes: string[];
  context: "heading" | "body" | "nav" | "other";
  source: "google-fonts" | "css" | "system";
}

export interface BrandAssets {
  brand_name: string;
  logos: LogoAsset[];
  colors: ColorAsset[];
  backdrop_images: BackdropAsset[];
  typography: TypographyAsset[];
}
