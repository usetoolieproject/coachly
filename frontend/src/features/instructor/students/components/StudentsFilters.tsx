import SearchInput from '../../../../components/shared/ui/SearchInput';
import { useTheme } from '../../../../contexts/ThemeContext';

export function StudentsFilters({ value, onChange }: { value: string; onChange: (v: string) => void; }) {
  const { isDarkMode } = useTheme();
  return (
    <div className={`${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} mt-5 rounded-xl shadow-sm border p-6 mb-6`}>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            value={value}
            onChange={onChange}
            placeholder="Search students by name or email..."
            inputClassName={isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' : ''}
          />
        </div>
      </div>
    </div>
  );
}


