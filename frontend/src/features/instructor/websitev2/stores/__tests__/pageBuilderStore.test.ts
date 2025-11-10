import { renderHook, act } from '@testing-library/react';
import { usePageBuilderStore } from '../pageBuilderStore';

// Mock Zustand store for testing
const mockStore = {
  selectedTheme: 'professional-coach',
  addedSections: [],
  selectedSection: null,
  sectionData: {},
  selectedPageType: 'sales-page',
  isMobileView: false,
  isSaving: false,
  addSection: jest.fn(),
  removeSection: jest.fn(),
  setSelectedSection: jest.fn(),
  updateSectionData: jest.fn(),
  setSelectedPageType: jest.fn(),
  setIsMobileView: jest.fn(),
  setIsSaving: jest.fn(),
  resetBuilder: jest.fn(),
  loadTemplate: jest.fn(),
};

// Test that the store doesn't cause infinite loops
describe('PageBuilderStore', () => {
  it('should not cause infinite loops when accessing actions', () => {
    const { result } = renderHook(() => usePageBuilderStore());
    
    // This should not cause infinite re-renders
    expect(result.current).toBeDefined();
    expect(typeof result.current.addSection).toBe('function');
    expect(typeof result.current.removeSection).toBe('function');
  });

  it('should handle section updates without infinite loops', () => {
    const { result } = renderHook(() => usePageBuilderStore());
    
    act(() => {
      result.current.addSection('about');
    });
    
    expect(result.current.addedSections).toContain('about');
  });
});
