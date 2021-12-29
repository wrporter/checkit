import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import FullPageContainer from './FullPageContainer';

export default function FullPageSpinner() {
    return (
        <FullPageContainer>
            <CircularProgress size={80} thickness={3.6} />
        </FullPageContainer>
    );
}
