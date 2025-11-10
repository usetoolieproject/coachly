import React from 'react';
import Pagination from '../../ui/Pagination';

type PaginationBarProps = {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
};

const PaginationBar: React.FC<PaginationBarProps> = ({ currentPage, totalPages, onPrevious, onNext, className }) => {
  return (
    <div className={className || ''}>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPrevious={onPrevious} onNext={onNext} />
    </div>
  );
};

export default PaginationBar;


