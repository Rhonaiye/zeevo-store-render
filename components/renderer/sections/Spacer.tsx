import React from 'react';
import { SpacerSection as SpacerSectionType } from '@/types/zeevo-types';

interface SpacerProps {
    data: SpacerSectionType;
}

const Spacer: React.FC<SpacerProps> = ({ data }) => {
    const { height = 40, backgroundColor } = data;

    return (
        <div
            style={{
                height: `${height}px`,
                backgroundColor: backgroundColor || 'transparent',
            }}
        />
    );
};

export default Spacer;
