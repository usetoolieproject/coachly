import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditorFactory } from '../EditorFactory';
import { usePageBuilderStore } from '../../stores/pageBuilderStore';

// Mock the store
jest.mock('../../stores/pageBuilderStore', () => ({
  usePageBuilderStore: jest.fn(),
  useUpdateSectionData: jest.fn(),
}));

// Mock theme context
jest.mock('../../../../contexts/ThemeContext', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

// Mock config
jest.mock('../../config/themeConfig', () => ({
  getSectionConfig: () => ({
    id: 'about',
    name: 'About Section',
    component: 'About',
    defaultData: {
      title: 'About',
      description: 'Welcome to my learning community!',
      features: ['Feature 1', 'Feature 2'],
    },
    editorFields: [
      {
        id: 'title',
        type: 'text',
        label: 'Section Title',
        placeholder: 'Enter section title...',
      },
    ],
  }),
}));

describe('EditorFactory', () => {
  const mockUpdateSectionData = jest.fn();
  
  beforeEach(() => {
    (usePageBuilderStore as jest.Mock).mockReturnValue({
      sectionData: {
        about: {
          title: 'About',
          description: 'Welcome to my learning community!',
          features: ['Feature 1', 'Feature 2'],
        },
      },
    });
    
    const { useUpdateSectionData } = require('../../stores/pageBuilderStore');
    useUpdateSectionData.mockReturnValue(mockUpdateSectionData);
  });

  it('should allow typing in input fields without infinite loops', () => {
    render(
      <EditorFactory
        themeId="professional-coach"
        sectionId="about"
        onClose={() => {}}
      />
    );

    const titleInput = screen.getByPlaceholderText('Enter section title...');
    
    // This should not cause infinite loops
    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    
    expect(mockUpdateSectionData).toHaveBeenCalledWith('about', {
      title: 'About',
      description: 'Welcome to my learning community!',
      features: ['Feature 1', 'Feature 2'],
      title: 'New Title', // This should be the updated value
    });
  });
});
