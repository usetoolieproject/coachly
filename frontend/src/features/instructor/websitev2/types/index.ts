export interface Theme {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  previewImage: string;
  isBlank?: boolean;
  price: number;
  isNew?: boolean;
  previewComponent?: string;
  comingSoon?: boolean;
}

export interface WebsiteV2State {
  selectedTheme: Theme | null;
  isBuilderMode: boolean;
  isSaving: boolean;
}

export interface ThemeSelectionProps {
  onThemeSelect: (theme: Theme) => void;
  onPreviewTheme: (theme: Theme) => void;
}

export interface BuilderProps {
  selectedTheme: Theme;
  onBackToSelection: () => void;
}
